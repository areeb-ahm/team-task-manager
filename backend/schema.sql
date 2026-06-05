-- ============================================================================
-- Team Task Manager — Database Schema
-- ============================================================================
-- Run this file to create (or recreate) all tables:
--   psql -U your_username -d team_task_manager -f schema.sql
-- ============================================================================

-- ─── Drop Existing Tables ────────────────────────────────────────────────────
-- Dropped in reverse order of creation to respect foreign key dependencies
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

-- ─── Users ───────────────────────────────────────────────────────────────────
-- Stores registered users with hashed passwords for authentication
CREATE TABLE users (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT NOW()
);

-- ─── Teams ───────────────────────────────────────────────────────────────────
-- Stores teams created by users. Each team groups members and their tasks
CREATE TABLE teams (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  created_by    INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP     DEFAULT NOW()
);

-- ─── Team Members ────────────────────────────────────────────────────────────
-- Join table for the many-to-many relationship between users and teams
-- A user can belong to multiple teams; a team can have multiple members
CREATE TABLE team_members (
  team_id       INTEGER       REFERENCES teams(id) ON DELETE CASCADE,
  user_id       INTEGER       REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);

-- ─── Tasks ───────────────────────────────────────────────────────────────────
-- Stores tasks belonging to a team. Each task can be assigned to a team member
-- Status is constrained to: 'pending', 'in-progress', or 'done'
CREATE TABLE tasks (
  id            SERIAL        PRIMARY KEY,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        VARCHAR(50)   DEFAULT 'pending'
                              CHECK (status IN ('pending', 'in-progress', 'done')),
  due_date      DATE,
  team_id       INTEGER       REFERENCES teams(id) ON DELETE CASCADE,
  assigned_to   INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  created_by    INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP     DEFAULT NOW()
);

-- ─── Session (connect-pg-simple) ─────────────────────────────────────────────
-- Required by connect-pg-simple to store Express sessions in PostgreSQL
-- This replaces the default in-memory session store
CREATE TABLE session (
  sid           VARCHAR       NOT NULL PRIMARY KEY,
  sess          JSON          NOT NULL,
  expire        TIMESTAMP(6)  NOT NULL
);

CREATE INDEX idx_session_expire ON session(expire);
