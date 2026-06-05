const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { isAuthenticated, isTeamCreator } = require('../middleware/authMiddleware');

// All routes in this file require authentication
router.use(isAuthenticated);

// ─── GET / ───────────────────────────────────────────────────────────────────
// Get all teams the current user belongs to (as a member or creator)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.created_by, t.created_at
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get teams error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST / ──────────────────────────────────────────────────────────────────
// Create a new team and automatically add the creator as the first member
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate that a team name was provided
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Insert the new team
    const teamResult = await pool.query(
      'INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *',
      [name.trim(), req.user.id]
    );

    const team = teamResult.rows[0];

    // Add the creator as the first team member
    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
      [team.id, req.user.id]
    );

    return res.status(201).json(team);
  } catch (err) {
    console.error('Create team error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /:id ────────────────────────────────────────────────────────────────
// Get a single team by its ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get team error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /:id/members ────────────────────────────────────────────────────────
// Get all members of a specific team
router.get('/:id/members', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN team_members tm ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [req.params.id]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get members error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /:id/members ──────────────────────────────────────────────────────
// Add a new member to a team by their email address
// Uses ON CONFLICT DO NOTHING to silently handle duplicate additions
router.post('/:id/members', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the user by email
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    const user = userResult.rows[0];

    // Add them to the team (ignore if already a member)
    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, user.id]
    );

    return res.status(200).json({ message: 'Member added successfully', user });
  } catch (err) {
    console.error('Add member error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /:id ─────────────────────────────────────────────────────────────
// Delete a team entirely — only the team creator is allowed to do this
// The isTeamCreator middleware checks ownership before this handler runs
router.delete('/:id', isTeamCreator, async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);

    return res.status(200).json({ message: 'Team deleted' });
  } catch (err) {
    console.error('Delete team error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /:id/members/:userId ─────────────────────────────────────────────
// Remove a specific member from a team — only the team creator can do this
router.delete('/:id/members/:userId', isTeamCreator, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, req.params.userId]
    );

    return res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
