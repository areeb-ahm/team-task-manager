const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');

// ─── Local Strategy ──────────────────────────────────────────────────────────
// Authenticate users by email + password against the users table
passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, // Use 'email' instead of default 'username'
    async (email, password, done) => {
      try {
        // Look up the user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // No account with that email
        if (!user) {
          return done(null, false, { message: 'No account found with that email' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // Authentication successful
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ─── Serialize User ──────────────────────────────────────────────────────────
// Determines what data gets saved into the session.
// We only store the user's id to keep the session lightweight.
// This runs once when the user first logs in.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ─── Deserialize User ────────────────────────────────────────────────────────
// On every subsequent request, this retrieves the full user object
// from the database using the id that was stored in the session.
// We intentionally exclude password_hash from the query for security.
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [id]
    );
    const user = result.rows[0];

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = passport;
