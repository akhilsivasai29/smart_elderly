// SQL Database Client API Utility

const API_BASE_URL = 'http://localhost:3001/api';

export async function fetchSqlInitialState() {
  try {
    const res = await fetch(`${API_BASE_URL}/state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isSqlActive: true };
  } catch (e) {
    console.warn('Backend SQL server not available, falling back to LocalStorage persistence:', e.message);
    return { data: null, isSqlActive: false };
  }
}

export async function addMedicineSql(med) {
  try {
    await fetch(`${API_BASE_URL}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(med)
    });
  } catch (e) {
    console.error('SQL Error addMedicine:', e);
  }
}

export async function updateMedicineSql(medId, status, takenAt = null, missedCount = 0) {
  try {
    await fetch(`${API_BASE_URL}/medicines/${medId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, takenAt, missedCount })
    });
  } catch (e) {
    console.error('SQL Error updateMedicine:', e);
  }
}

export async function deleteMedicineSql(medId) {
  try {
    await fetch(`${API_BASE_URL}/medicines/${medId}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.error('SQL Error deleteMedicine:', e);
  }
}

export async function toggleDietSql(mealId, completed) {
  try {
    await fetch(`${API_BASE_URL}/diet/${mealId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
  } catch (e) {
    console.error('SQL Error toggleDiet:', e);
  }
}

export async function toggleActivitySql(actId, completed) {
  try {
    await fetch(`${API_BASE_URL}/activities/${actId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
  } catch (e) {
    console.error('SQL Error toggleActivity:', e);
  }
}

export async function updateWaterSql(waterData) {
  try {
    await fetch(`${API_BASE_URL}/water`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waterData)
    });
  } catch (e) {
    console.error('SQL Error updateWater:', e);
  }
}

export async function saveCaregiverSql(caregiver) {
  try {
    await fetch(`${API_BASE_URL}/caregiver`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caregiver)
    });
  } catch (e) {
    console.error('SQL Error saveCaregiver:', e);
  }
}

export async function addBpLogSql(bpLog) {
  try {
    await fetch(`${API_BASE_URL}/vitals/bp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bpLog)
    });
  } catch (e) {
    console.error('SQL Error addBpLog:', e);
  }
}

export async function addSugarLogSql(sugarLog) {
  try {
    await fetch(`${API_BASE_URL}/vitals/sugar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sugarLog)
    });
  } catch (e) {
    console.error('SQL Error addSugarLog:', e);
  }
}

export async function addAuditLogSql(logItem) {
  try {
    await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logItem)
    });
  } catch (e) {
    console.error('SQL Error addAuditLog:', e);
  }
}

export async function resolveAuditLogSql(logId) {
  try {
    await fetch(`${API_BASE_URL}/logs/${logId}/resolve`, {
      method: 'PUT'
    });
  } catch (e) {
    console.error('SQL Error resolveAuditLog:', e);
  }
}

export async function updateSettingsSql(settings) {
  try {
    await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (e) {
    console.error('SQL Error updateSettings:', e);
  }
}
