-- =========================================================================
-- Smart Elderly Care - Vitals & BP Tracker and Caregiver Portal Database
-- =========================================================================

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS elderly_care_db;
USE elderly_care_db;

-- 2. Drop existing tables if re-initialising
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS sugar_logs;
DROP TABLE IF EXISTS bp_logs;
DROP TABLE IF EXISTS caregiver;

-- =========================================================================
-- SECTION 1: VITALS & BLOOD PRESSURE TRACKER
-- =========================================================================

-- Table 1.1: Blood Pressure Logs (Systolic, Diastolic, Pulse)
CREATE TABLE bp_logs (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  sys INT NOT NULL,
  dia INT NOT NULL,
  pulse INT NOT NULL,
  note TEXT,
  category VARCHAR(50)
);

INSERT INTO bp_logs (id, date, sys, dia, pulse, note, category) VALUES
('bp-101', '2026-09-24 08:15 AM', 120, 80, 72, 'Fasting morning check - Normal range', 'Normal'),
('bp-102', '2026-09-24 02:00 PM', 126, 82, 74, 'Post lunch check - Comfortable', 'Normal'),
('bp-103', '2026-09-24 08:00 PM', 135, 88, 78, 'Evening check - Slightly elevated after walk', 'Pre-Hypertension');

-- Table 1.2: Blood Sugar Logs (Fasting, Post-Meal, Random)
CREATE TABLE sugar_logs (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  note TEXT,
  category VARCHAR(50)
);

INSERT INTO sugar_logs (id, date, level, type, note, category) VALUES
('sugar-101', '2026-09-24 08:00 AM', 108, 'Fasting', 'Checked before breakfast', 'Normal'),
('sugar-102', '2026-09-24 02:30 PM', 142, 'Post-Meal', '2 hours after lunch', 'Normal'),
('sugar-103', '2026-09-24 09:00 PM', 115, 'Before Bed', 'Checked before sleeping', 'Normal');


-- =========================================================================
-- SECTION 2: CAREGIVER PORTAL & AUDIT LOGS
-- =========================================================================

-- Table 2.1: Caregiver Contact & Threshold Settings
CREATE TABLE caregiver (
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

INSERT INTO caregiver (id, name, relation, phone, whatsapp, email, notifyOnMissed, missedThreshold, autoSmsSimulated) VALUES
(1, 'Sarah Jenkins', 'Daughter / Primary Caregiver', '+1 (555) 382-9102', '+15553829102', 'sarah.jenkins@familycare.org', 1, 2, 1);

-- Table 2.2: Caregiver Escalations & Audit Logs
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  timestamp VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  detail TEXT,
  severity VARCHAR(20),
  resolved TINYINT DEFAULT 1
);

INSERT INTO audit_logs (id, timestamp, type, title, detail, severity, resolved) VALUES
('log-201', '2026-09-24 08:02 AM', 'MEDICINE_TAKEN', 'Aspirin (Cardio) Taken', 'Senior confirmed morning pill on time.', 'success', 1),
('log-202', '2026-09-24 01:15 PM', 'MEDICINE_MISSED', 'Metformin Dose Missed', 'First missed dose alert logged.', 'warning', 1),
('log-203', '2026-09-24 01:30 PM', 'CAREGIVER_ALERT', '⚠️ URGENT: Caregiver Alerted for Metformin', 'Repeatedly missed dose (2 times). Caregiver Sarah Jenkins (+1 555 382-9102) was notified.', 'danger', 0),
('log-204', '2026-09-24 04:45 PM', 'EMERGENCY_SOS', '🚨 EMERGENCY SOS CALL TRIGGERED', 'Senior pressed SOS emergency button. Caregiver notified.', 'danger', 0);


-- =========================================================================
-- QUERY RESULTS FOR BOTH SECTIONS IN MYSQL WORKBENCH
-- =========================================================================

-- View Section 1: Vitals & BP Tracker
SELECT * FROM bp_logs;
SELECT * FROM sugar_logs;

-- View Section 2: Caregiver Portal & Logs
SELECT * FROM caregiver;
SELECT * FROM audit_logs;
