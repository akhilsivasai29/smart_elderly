import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db;

// Initialize DB on server start
initDatabase().then((database) => {
  db = database;
  console.log('✅ SQLite Database connected and initialized.');
}).catch((err) => {
  console.error('❌ Failed to initialize SQLite database:', err);
});

// Middleware to check DB readiness
app.use((req, res, next) => {
  if (!db) {
    return res.status(503).json({ error: 'Database initializing, try again in a moment.' });
  }
  next();
});

// 1. GET full state (SQL SELECT queries)
app.get('/api/state', async (req, res) => {
  try {
    const medicines = await db.all('SELECT * FROM medicines');
    const dietRows = await db.all('SELECT * FROM diet_plan');
    const actRows = await db.all('SELECT * FROM activities');
    const waterRow = await db.get('SELECT * FROM water_intake WHERE id = 1');
    const caregiverRow = await db.get('SELECT * FROM caregiver WHERE id = 1');
    const bpLogs = await db.all('SELECT * FROM bp_logs ORDER BY date DESC');
    const sugarLogs = await db.all('SELECT * FROM sugar_logs ORDER BY date DESC');
    const logs = await db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    const settingsRow = await db.get('SELECT * FROM settings WHERE id = 1');

    const state = {
      dbType: db.type || 'SQL',
      medicines: medicines.map((m) => ({
        ...m,
        missedCount: Number(m.missedCount || 0)
      })),
      dietPlan: dietRows.map((d) => ({
        ...d,
        completed: Boolean(d.completed),
        items: JSON.parse(d.items || '[]')
      })),
      activities: actRows.map((a) => ({
        ...a,
        completed: Boolean(a.completed)
      })),
      water: {
        currentGlasses: waterRow ? waterRow.currentGlasses : 4,
        targetGlasses: waterRow ? waterRow.targetGlasses : 8,
        glassSizeMl: waterRow ? waterRow.glassSizeMl : 250,
        history: waterRow ? JSON.parse(waterRow.history || '[]') : []
      },
      caregiver: caregiverRow ? {
        ...caregiverRow,
        notifyOnMissed: Boolean(caregiverRow.notifyOnMissed),
        autoSmsSimulated: Boolean(caregiverRow.autoSmsSimulated)
      } : {},
      vitals: {
        bpLogs,
        sugarLogs,
        weight: 68.5
      },
      logs: logs.map((l) => ({
        ...l,
        resolved: Boolean(l.resolved)
      })),
      settings: settingsRow ? {
        ...settingsRow,
        voiceEnabled: Boolean(settingsRow.voiceEnabled),
        soundEnabled: Boolean(settingsRow.soundEnabled),
        autoSpeakReminders: Boolean(settingsRow.autoSpeakReminders),
        highContrast: Boolean(settingsRow.highContrast)
      } : {}
    };

    res.json(state);
  } catch (err) {
    console.error('SQL Query Error (GET /api/state):', err);
    res.status(500).json({ error: 'Failed to fetch state from SQL database' });
  }
});

// 2. MEDICINES SQL ENDPOINTS

// Add Medicine (SQL INSERT)
app.post('/api/medicines', async (req, res) => {
  try {
    const med = req.body;
    await db.run(
      `INSERT INTO medicines (id, name, dosage, time, slot, instructions, color, iconType, status, takenAt, missedCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [med.id, med.name, med.dosage, med.time, med.slot, med.instructions, med.color, med.iconType, med.status || 'pending', med.takenAt || null, med.missedCount || 0]
    );
    res.json({ success: true, medicine: med });
  } catch (err) {
    console.error('SQL Error (INSERT medicine):', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Medicine status/takenAt/missedCount (SQL UPDATE)
app.put('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, takenAt, missedCount } = req.body;
    await db.run(
      `UPDATE medicines SET status = ?, takenAt = ?, missedCount = ? WHERE id = ?`,
      [status, takenAt, missedCount, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE medicine):', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Medicine (SQL DELETE)
app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM medicines WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (DELETE medicine):', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. DIET PLAN SQL ENDPOINT
app.put('/api/diet/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    await db.run('UPDATE diet_plan SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE diet):', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. ACTIVITIES SQL ENDPOINT
app.put('/api/activities/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    await db.run('UPDATE activities SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE activity):', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. WATER INTAKE SQL ENDPOINT
app.put('/api/water', async (req, res) => {
  try {
    const { currentGlasses, targetGlasses, glassSizeMl, history } = req.body;
    await db.run(
      `UPDATE water_intake SET currentGlasses = ?, targetGlasses = ?, glassSizeMl = ?, history = ? WHERE id = 1`,
      [currentGlasses, targetGlasses, glassSizeMl, JSON.stringify(history)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE water):', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. CAREGIVER SQL ENDPOINT
app.put('/api/caregiver', async (req, res) => {
  try {
    const c = req.body;
    await db.run(
      `UPDATE caregiver SET name = ?, relation = ?, phone = ?, whatsapp = ?, email = ?, notifyOnMissed = ?, missedThreshold = ?, autoSmsSimulated = ? WHERE id = 1`,
      [c.name, c.relation, c.phone, c.whatsapp, c.email, c.notifyOnMissed ? 1 : 0, c.missedThreshold, c.autoSmsSimulated ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE caregiver):', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. VITALS SQL ENDPOINTS
app.post('/api/vitals/bp', async (req, res) => {
  try {
    const bp = req.body;
    await db.run(
      `INSERT INTO bp_logs (id, date, sys, dia, pulse, note, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bp.id, bp.date, bp.sys, bp.dia, bp.pulse, bp.note, bp.category]
    );
    res.json({ success: true, log: bp });
  } catch (err) {
    console.error('SQL Error (INSERT bp_logs):', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vitals/sugar', async (req, res) => {
  try {
    const s = req.body;
    await db.run(
      `INSERT INTO sugar_logs (id, date, level, type, note, category) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.id, s.date, s.level, s.type, s.note, s.category]
    );
    res.json({ success: true, log: s });
  } catch (err) {
    console.error('SQL Error (INSERT sugar_logs):', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. AUDIT LOGS SQL ENDPOINTS
app.post('/api/logs', async (req, res) => {
  try {
    const l = req.body;
    await db.run(
      `INSERT INTO audit_logs (id, timestamp, type, title, detail, severity, resolved) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.timestamp, l.type, l.title, l.detail, l.severity, l.resolved ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (INSERT audit_logs):', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/logs/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('UPDATE audit_logs SET resolved = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE audit_logs):', err);
    res.status(500).json({ error: err.message });
  }
});

// 9. SETTINGS SQL ENDPOINT
app.put('/api/settings', async (req, res) => {
  try {
    const s = req.body;
    await db.run(
      `UPDATE settings SET mode = ?, fontSize = ?, voiceEnabled = ?, soundEnabled = ?, autoSpeakReminders = ?, highContrast = ? WHERE id = 1`,
      [s.mode, s.fontSize, s.voiceEnabled ? 1 : 0, s.soundEnabled ? 1 : 0, s.autoSpeakReminders ? 1 : 0, s.highContrast ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('SQL Error (UPDATE settings):', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. VISUAL DATABASE VIEWER PAGE
app.get('/db', async (req, res) => {
  try {
    const medicines = await db.all('SELECT * FROM medicines');
    const diet = await db.all('SELECT * FROM diet_plan');
    const activities = await db.all('SELECT * FROM activities');
    const caregiver = await db.all('SELECT * FROM caregiver');
    const bpLogs = await db.all('SELECT * FROM bp_logs');
    const sugarLogs = await db.all('SELECT * FROM sugar_logs');
    const logs = await db.all('SELECT * FROM audit_logs');

    const renderTable = (title, rows) => {
      if (!rows.length) return `<div class="card"><h3>${title}</h3><p>No records found.</p></div>`;
      const keys = Object.keys(rows[0]);
      return `
        <div style="background:#fff; border-radius:12px; padding:20px; margin-bottom:24px; box-shadow:0 4px 12px rgba(0,0,0,0.05); font-family:sans-serif;">
          <h3 style="margin-top:0; color:#1e293b; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">📊 Table: <code>${title}</code> (${rows.length} rows)</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                  ${keys.map(k => `<th style="padding:10px; color:#475569;">${k}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(r => `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    ${keys.map(k => `<td style="padding:10px; color:#334155;"><pre style="margin:0; font-size:12px; font-family:monospace;">${String(r[k])}</pre></td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SQL Database Visual Explorer</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 30px; }
          .container { max-width: 1200px; margin: 0 auto; }
          h1 { color: #0f172a; display: flex; align-items: center; gap: 10px; }
          .badge { background: #10b981; color: white; font-size: 14px; padding: 4px 10px; border-radius: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗄️ SQL Database Explorer <span class="badge">SQLite Active</span></h1>
          <p style="color:#64748b;">Live view of all SQL database tables and records stored in <code>server/elderly_care.db</code>.</p>
          <hr style="border:none; border-top:1px solid #cbd5e1; margin-bottom:24px;">
          ${renderTable('medicines', medicines)}
          ${renderTable('diet_plan', diet)}
          ${renderTable('activities', activities)}
          ${renderTable('caregiver', caregiver)}
          ${renderTable('bp_logs', bpLogs)}
          ${renderTable('sugar_logs', sugarLogs)}
          ${renderTable('audit_logs', logs)}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error viewing DB: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SQL Backend Server listening on http://localhost:${PORT}`);
  console.log(`📊 DB Explorer page available at http://localhost:${PORT}/db`);
});
