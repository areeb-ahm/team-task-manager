const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const pool = require('../config/db');
const { registerSchema, loginSchema } = require('../validators/authValidator');

// ─── POST /register ──────────────────────────────────────────────────────────
// Creates a new user account.
// Validates input, checks for duplicate emails, hashes the password,
// and inserts the user into the database.
router.post('/register', async (req, res) => {
  try {
    // Validate request body against the register schema
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    // Check if an account with this email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash the password with a salt round of 12
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert the new user and return their public info
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );

    return res.status(201).json({
      message: 'Account created successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /login ─────────────────────────────────────────────────────────────
// Authenticates a user using Passport's local strategy.
// On success, establishes a session and returns the user object.
router.post('/login', (req, res, next) => {
  // Validate request body against the login schema
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Use Passport's custom callback pattern for manual control over the response
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    // Establish the login session
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email },
      });
    });
  })(req, res, next);
});

// ─── POST /logout ────────────────────────────────────────────────────────────
// Logs the user out by destroying the session and clearing the session cookie.
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({ message: 'Error logging out' });
    }

    // Destroy the session from the session store
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err.message);
        return res.status(500).json({ message: 'Error destroying session' });
      }

      // Clear the session cookie from the browser
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// ─── GET /me ─────────────────────────────────────────────────────────────────
// Returns the currently logged-in user's info.
// Used by the frontend to check if a session is still active on page load.
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
    });
  }

  return res.status(401).json({ message: 'Not logged in' });
});

module.exports = router;
