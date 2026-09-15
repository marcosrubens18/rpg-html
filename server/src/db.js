const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'valdora.db');

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player',
    banned_until TEXT,
    banned_permanently INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    race_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    destiny_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    xp_to_next INTEGER NOT NULL DEFAULT 30,
    max_hp INTEGER NOT NULL,
    hp INTEGER NOT NULL,
    max_mp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    crit_chance REAL NOT NULL DEFAULT 0.05,
    evasion_chance REAL NOT NULL DEFAULT 0.05,
    gold INTEGER NOT NULL DEFAULT 20,
    attribute_points INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT 'praca',
    inventory TEXT NOT NULL DEFAULT '{}',
    equipment TEXT NOT NULL DEFAULT '{}',
    status_effects TEXT NOT NULL DEFAULT '[]',
    pvp_wins INTEGER NOT NULL DEFAULT 0,
    pvp_losses INTEGER NOT NULL DEFAULT 0,
    history TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    reward_gold INTEGER NOT NULL DEFAULT 0,
    reward_xp INTEGER NOT NULL DEFAULT 0,
    starts_at TEXT,
    ends_at TEXT,
    created_by INTEGER REFERENCES users(id),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS punishments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    admin_id INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT
  );
`);

module.exports = db;
