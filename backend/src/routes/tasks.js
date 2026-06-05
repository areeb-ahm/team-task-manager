const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { taskSchema } = require('../validators/taskValidator');

// All routes require authentication
router.use(isAuthenticated);

// ─── GET / ───────────────────────────────────────────────────────────────────
// Get tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { team_id, assigned_to, status } = req.query;

    let query = `
      SELECT t.*, u.name AS assignee_name, tm.name AS team_name 
      FROM tasks t 
      LEFT JOIN users u ON u.id = t.assigned_to 
      LEFT JOIN teams tm ON tm.id = t.team_id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (team_id) {
      query += ` AND t.team_id = $${paramIndex}`;
      params.push(team_id);
      paramIndex++;
    }

    if (assigned_to) {
      query += ` AND t.assigned_to = $${paramIndex}`;
      params.push(assigned_to);
      paramIndex++;
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST / ──────────────────────────────────────────────────────────────────
// Create a new task
router.post('/', async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, status, due_date, team_id, assigned_to } = value;
    const created_by = req.user.id;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date, team_id, assigned_to, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, status, due_date, team_id, assigned_to, created_by]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /:id ────────────────────────────────────────────────────────────────
// Get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.name AS assignee_name, tm.name AS team_name 
       FROM tasks t 
       LEFT JOIN users u ON u.id = t.assigned_to 
       LEFT JOIN teams tm ON tm.id = t.team_id 
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get single task error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /:id ────────────────────────────────────────────────────────────────
// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, status, due_date, team_id, assigned_to } = value;

    const result = await pool.query(
      `UPDATE tasks 
       SET title=$1, description=$2, status=$3, due_date=$4, team_id=$5, assigned_to=$6 
       WHERE id=$7 RETURNING *`,
      [title, description, status, due_date, team_id, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /:id ─────────────────────────────────────────────────────────────
// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
