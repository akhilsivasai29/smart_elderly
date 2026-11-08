import 'dotenv/config';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'elderly_care.db');

export let dbType = 'unknown';

export async function initDatabase() {
  const mysqlHost = process.env.MYSQL_HOST || 'localhost';
  const mysqlUser = process.env.MYSQL_USER || 'root';
  const mysqlDatabase = process.env.MYSQL_DATABASE || 'elderly_care_db';
  const mysqlPort = Number(process.env.MYSQL_PORT || 3306);

  // List passwords to try: user specified in .env, then common default MySQL passwords
  const passwordCandidates = [
    process.env.MYSQL_PASSWORD,
    'root',
    'admin',
    '123456',
    '1234',
    ''
  ].filter((p, idx, self) => p !== undefined && self.indexOf(p) === idx);

  let pool = null;
  let workingPassword = null;

  // 1. Attempt connecting to MySQL Server
  for (const password of passwordCandidates) {
    try {
      // Step A: Ensure Database exists in MySQL
      const tempConn = await mysql.createConnection({
        host: mysqlHost,
        port: mysqlPort,
        user: mysqlUser,
        password: password
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlDatabase}\`;`);
      await tempConn.end();

      // Step B: Create MySQL Pool
      pool = mysql.createPool({
        host: mysqlHost,
        port: mysqlPort,
        user: mysqlUser,
        password: password,
        database: mysqlDatabase,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      const connection = await pool.getConnection();
      connection.release();
      workingPassword = password;
      break;
    } catch (e) {
      // Try next password candidate
    }
  }

  if (pool) {
    console.log(`✅ DIRECT MYSQL CONNECTED! Using MySQL Database '${mysqlDatabase}' on ${mysqlHost}:${mysqlPort} (user: ${mysqlUser})`);
    dbType = 'MySQL';

    // Create Tables in MySQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dosage VARCHAR(100),
        time VARCHAR(10) NOT NULL,
        slot VARCHAR(20),
        instructions TEXT,
        color VARCHAR(20),
        iconType VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending',
        takenAt VARCHAR(20),
        missedCount INT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS diet_plan (
        id VARCHAR(50) PRIMARY KEY,
        meal VARCHAR(50) NOT NULL,
        time VARCHAR(20) NOT NULL,
        items TEXT NOT NULL,
        note TEXT,
        completed TINYINT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        time VARCHAR(20) NOT NULL,
        duration VARCHAR(20),
        completed TINYINT DEFAULT 0,
        icon VARCHAR(20)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_intake (
        id INT PRIMARY KEY DEFAULT 1,
        currentGlasses INT DEFAULT 4,
        targetGlasses INT DEFAULT 8,
        glassSizeMl INT DEFAULT 250,
        history TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS caregiver (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(100) NOT NULL,
        relation VARCHAR(100),
        phone VARCHAR(30),
        whatsapp VARCHAR(30),
        email VARCHAR(100),
        notifyOnMissed TINYINT DEFAULT 1,
        missedThreshold INT DEFAULT 2,
        autoSmsSimulated TINYINT DEFAULT 1
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bp_logs (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        sys INT NOT NULL,
        dia INT NOT NULL,
        pulse INT NOT NULL,
        note TEXT,
        category VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sugar_logs (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        level INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        note TEXT,
        category VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        detail TEXT,
        severity VARCHAR(20),
        resolved TINYINT DEFAULT 1
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        mode VARCHAR(20) DEFAULT 'elderly',
        fontSize VARCHAR(20) DEFAULT 'large',
        voiceEnabled TINYINT DEFAULT 1,
        soundEnabled TINYINT DEFAULT 1,
        autoSpeakReminders TINYINT DEFAULT 1,
        highContrast TINYINT DEFAULT 0
      );
    `);

    // Seed MySQL default data if medicines table is empty
    const [medRows] = await pool.query('SELECT COUNT(*) as count FROM medicines');
    if (medRows[0].count === 0) {
      console.log('🌱 Seeding complete initial records into MySQL database...');
      await pool.query(`
        INSERT INTO medicines (id, name, dosage, time, slot, instructions, color, iconType, status) VALUES
        ('med-1', 'Aspirin (Cardio)', '100 mg (1 Tablet)', '08:00', 'Morning', 'Take with 1 full glass of water after breakfast', '#ef4444', 'pill', 'pending'),
        ('med-2', 'Metformin', '500 mg (1 Tablet)', '13:00', 'Afternoon', 'Take during or immediately after lunch', '#3b82f6', 'tablet', 'pending'),
        ('med-3', 'Multivitamin Syrup', '10 ml (2 Spoons)', '17:30', 'Evening', 'Take after evening tea', '#10b981', 'syrup', 'pending'),
        ('med-4', 'Atorvastatin', '10 mg (1 Tablet)', '20:00', 'Night', 'Take 30 minutes before bedtime', '#8b5cf6', 'pill', 'pending');
      `);

      await pool.query(`
        INSERT INTO diet_plan (id, meal, time, items, note, completed) VALUES
        ('diet-1', 'Breakfast', '08:30 AM', '["Oatmeal with warm almond milk & raisins", "1 Boiled egg / Paneer slice", "1 Apple or Banana"]', 'Low sodium, heart healthy', 1),
        ('diet-2', 'Lunch', '01:30 PM', '["Steamed Brown Rice / Whole wheat rotis (2)", "Yellow Dal Curry & Spinach (Palak)", "Cucumber & Tomato salad with lemon juice"]', 'High fiber, easy digestion', 0),
        ('diet-3', 'Evening Snack', '05:00 PM', '["Warm Herbal Green Tea", "4 Soaked Almonds & 2 Walnuts", "Light roasted makhana (foxnuts)"]', 'Good for brain & heart health', 0),
        ('diet-4', 'Dinner', '07:30 PM', '["Light vegetable soup (Carrot & Pumpkin)", "Grilled Tofu / Khichdi", "Warm Golden Turmeric Milk before sleep"]', 'Eat at least 2 hours before sleeping', 0);
      `);

      await pool.query(`
        INSERT INTO activities (id, name, time, duration, completed, icon) VALUES
        ('act-1', 'Morning Gentle Walk', '07:00 AM', '25 mins', 1, 'walk'),
        ('act-2', 'Morning Blood Pressure Check', '08:15 AM', '5 mins', 1, 'heart'),
        ('act-3', 'Eye & Neck Stretching Exercises', '11:00 AM', '15 mins', 0, 'eye'),
        ('act-4', 'Afternoon Hydration & Breathing', '03:30 PM', '10 mins', 0, 'wind'),
        ('act-5', 'Night Sugar Level Check', '09:00 PM', '5 mins', 0, 'drop');
      `);

      await pool.query(`
        INSERT INTO water_intake (id, currentGlasses, targetGlasses, glassSizeMl, history) VALUES
        (1, 4, 8, 250, '[{"time":"07:30 AM","amountMl":250},{"time":"09:00 AM","amountMl":250},{"time":"11:30 AM","amountMl":250},{"time":"01:15 PM","amountMl":250}]')
        ON DUPLICATE KEY UPDATE currentGlasses=VALUES(currentGlasses);
      `);

      await pool.query(`
        INSERT INTO caregiver (id, name, relation, phone, whatsapp, email) VALUES
        (1, 'Sarah Jenkins', 'Daughter / Primary Caregiver', '+1 (555) 382-9102', '+15553829102', 'sarah.jenkins@familycare.org')
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `);

      await pool.query(`
        INSERT INTO bp_logs (id, date, sys, dia, pulse, note, category) VALUES
        ('bp-1', '2026-09-23 08:30 AM', 122, 80, 72, 'Fasting morning check', 'Normal'),
        ('bp-2', '2026-09-24 08:15 AM', 126, 82, 74, 'Felt calm and comfortable', 'Normal');
      `);

      await pool.query(`
        INSERT INTO sugar_logs (id, date, level, type, note, category) VALUES
        ('s-1', '2026-09-23 08:00 AM', 108, 'Fasting', 'Before breakfast', 'Normal'),
        ('s-2', '2026-09-23 02:30 PM', 142, 'Post-Meal', '2 hours after lunch', 'Normal'),
        ('s-3', '2026-09-24 08:00 AM', 112, 'Fasting', 'Before breakfast', 'Normal');
      `);

      await pool.query(`
        INSERT INTO audit_logs (id, timestamp, type, title, detail, severity, resolved) VALUES
        ('log-1', '2026-09-24 08:02 AM', 'MEDICINE_TAKEN', 'Aspirin (Cardio) Taken', 'Elderly confirmed morning pill on time.', 'success', 1),
        ('log-2', '2026-09-23 08:15 PM', 'MEDICINE_SNOOZED', 'Atorvastatin Snoozed (10 mins)', 'Reminder snoozed once, confirmed 10 minutes later.', 'warning', 1);
      `);

      await pool.query(`
        INSERT INTO settings (id, mode, fontSize, voiceEnabled) VALUES
        (1, 'elderly', 'large', 1)
        ON DUPLICATE KEY UPDATE mode=VALUES(mode);
      `);
    }

    // Return unified MySQL DB adapter
    return {
      type: 'MySQL',
      all: async (sql, params = []) => {
        const [rows] = await pool.query(sql, params);
        return rows;
      },
      get: async (sql, params = []) => {
        const [rows] = await pool.query(sql, params);
        return rows[0] || null;
      },
      run: async (sql, params = []) => {
        const [result] = await pool.execute(sql, params);
        return result;
      }
    };
  }

  console.warn(`⚠️ MySQL Connection attempt failed. Falling back to SQLite file database...`);
  dbType = 'SQLite';

  // 2. Fallback to SQLite if local MySQL is offline or password protected
  const sqliteDb = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await sqliteDb.exec('PRAGMA foreign_keys = ON;');

  // Create SQLite tables...
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, dosage TEXT, time TEXT NOT NULL,
      slot TEXT, instructions TEXT, color TEXT, iconType TEXT, status TEXT DEFAULT 'pending',
      takenAt TEXT, missedCount INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS diet_plan (id TEXT PRIMARY KEY, meal TEXT NOT NULL, time TEXT NOT NULL, items TEXT NOT NULL, note TEXT, completed INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, name TEXT NOT NULL, time TEXT NOT NULL, duration TEXT, completed INTEGER DEFAULT 0, icon TEXT);
    CREATE TABLE IF NOT EXISTS water_intake (id INTEGER PRIMARY KEY CHECK (id = 1), currentGlasses INTEGER DEFAULT 4, targetGlasses INTEGER DEFAULT 8, glassSizeMl INTEGER DEFAULT 250, history TEXT);
    CREATE TABLE IF NOT EXISTS caregiver (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL, relation TEXT, phone TEXT, whatsapp TEXT, email TEXT, notifyOnMissed INTEGER DEFAULT 1, missedThreshold INTEGER DEFAULT 2, autoSmsSimulated INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS bp_logs (id TEXT PRIMARY KEY, date TEXT NOT NULL, sys INTEGER NOT NULL, dia INTEGER NOT NULL, pulse INTEGER NOT NULL, note TEXT, category TEXT);
    CREATE TABLE IF NOT EXISTS sugar_logs (id TEXT PRIMARY KEY, date TEXT NOT NULL, level INTEGER NOT NULL, type TEXT NOT NULL, note TEXT, category TEXT);
    CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, detail TEXT, severity TEXT, resolved INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), mode TEXT DEFAULT 'elderly', fontSize TEXT DEFAULT 'large', voiceEnabled INTEGER DEFAULT 1, soundEnabled INTEGER DEFAULT 1, autoSpeakReminders INTEGER DEFAULT 1, highContrast INTEGER DEFAULT 0);
  `);

  return {
    type: 'SQLite',
    all: (sql, params) => sqliteDb.all(sql, params),
    get: (sql, params) => sqliteDb.get(sql, params),
    run: (sql, params) => sqliteDb.run(sql, params)
  };
}
