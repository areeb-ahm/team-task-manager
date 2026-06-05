const pool = require('../config/db');

// ─── isAuthenticated ─────────────────────────────────────────────────────────
// Protects routes that require a logged-in user.
// Passport attaches req.isAuthenticated() after a successful login session.
// Use this middleware on any route that should be accessible only to logged-in users.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Authentication required. Please log in.' });
};

// ─── isTeamCreator ───────────────────────────────────────────────────────────
// Authorisation guard: ensures only the user who created a team can perform
// sensitive operations on it (e.g. deleting the team, removing members).
// Expects the team id to be available as req.params.id.
const isTeamCreator = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT created_by FROM teams WHERE id = $1',
      [req.params.id]
    );

    const team = result.rows[0];

    // Team does not exist
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the logged-in user is the one who created this team
    if (team.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the team creator can perform this action' });
    }

    return next();
  } catch (err) {
    console.error('isTeamCreator error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAuthenticated, isTeamCreator };
