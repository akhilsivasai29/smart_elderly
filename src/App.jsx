import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ElderlyDashboard from './components/ElderlyDashboard';
import CaregiverDashboard from './components/CaregiverDashboard';
import VitalsTracker from './components/VitalsTracker';
import AlarmModal from './components/AlarmModal';
import CaregiverAlertBanner from './components/CaregiverAlertBanner';
import MedicineModal from './components/MedicineModal';

import { loadInitialState, setStoredData, STORAGE_KEYS } from './utils/storage';
import { soundManager, speakText } from './utils/audio';
import {
  fetchSqlInitialState,
  addMedicineSql,
  updateMedicineSql,
  deleteMedicineSql,
  toggleDietSql,
  toggleActivitySql,
  updateWaterSql,
  saveCaregiverSql,
  addBpLogSql,
  addSugarLogSql,
  addAuditLogSql,
  resolveAuditLogSql,
  updateSettingsSql,
} from './utils/api';

export default function App() {
  const [data, setData] = useState(loadInitialState());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'vitals' | 'caregiver'
  const [activeAlert, setActiveAlert] = useState(null); // Medicine object triggering active alarm modal
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);

  // Load from SQL Database on initial mount if available
  useEffect(() => {
    fetchSqlInitialState().then(({ data: sqlData, isSqlActive }) => {
      if (isSqlActive && sqlData) {
        setData(sqlData);
      }
    });
  }, []);

  // Sync state to LocalStorage as secondary backup
  useEffect(() => {
    setStoredData(STORAGE_KEYS.MEDICINES, data.medicines);
    setStoredData(STORAGE_KEYS.DIET_PLAN, data.dietPlan);
    setStoredData(STORAGE_KEYS.ACTIVITIES, data.activities);
    setStoredData(STORAGE_KEYS.WATER_INTAKE, data.water);
    setStoredData(STORAGE_KEYS.CAREGIVER, data.caregiver);
    setStoredData(STORAGE_KEYS.VITALS, data.vitals);
    setStoredData(STORAGE_KEYS.LOGS, data.logs);
    setStoredData(STORAGE_KEYS.SETTINGS, data.settings);
  }, [data]);

  // Apply initial font size class to body
  useEffect(() => {
    document.body.classList.remove('font-large', 'font-extra-large');
    if (data.settings.fontSize === 'large') document.body.classList.add('font-large');
    if (data.settings.fontSize === 'extra-large') document.body.classList.add('font-extra-large');
  }, [data.settings.fontSize]);

  // Real-time clock check for scheduled medicine reminders
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      data.medicines.forEach((med) => {
        if (med.status === 'pending' && med.time === currentHHMM && (!activeAlert || activeAlert.id !== med.id)) {
          setActiveAlert(med);
        }
      });
    };

    const interval = setInterval(checkSchedule, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [data.medicines, activeAlert]);

  // Update settings handler
  const handleUpdateSettings = (newSettings) => {
    setData((prev) => ({ ...prev, settings: newSettings }));
    updateSettingsSql(newSettings);
  };

  // Confirm Medicine Taken
  const handleConfirmTaken = (medId) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    updateMedicineSql(medId, 'taken', nowTime, 0);

    setData((prev) => {
      const updatedMeds = prev.medicines.map((m) => {
        if (m.id === medId) {
          return { ...m, status: 'taken', takenAt: nowTime, missedCount: 0 };
        }
        return m;
      });

      const medObj = prev.medicines.find((m) => m.id === medId);
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp,
        type: 'MEDICINE_TAKEN',
        title: `${medObj ? medObj.name : 'Medicine'} Taken`,
        detail: `Confirmed taken by senior at ${nowTime}`,
        severity: 'success',
      };

      addAuditLogSql(newLog);

      return {
        ...prev,
        medicines: updatedMeds,
        logs: [newLog, ...prev.logs],
      };
    });

    setActiveAlert(null);
    if (data.settings.voiceEnabled) {
      speakText('Thank you! Medicine marked as taken.');
    }
  };

  // Snooze Medicine (Set 2nd reminder)
  const handleSnooze = (medId, mins = 5) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    updateMedicineSql(medId, 'snoozed', null, 0);

    setData((prev) => {
      const updatedMeds = prev.medicines.map((m) => {
        if (m.id === medId) {
          return { ...m, status: 'snoozed', isSecondReminder: true };
        }
        return m;
      });

      const medObj = prev.medicines.find((m) => m.id === medId);
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp,
        type: 'MEDICINE_SNOOZED',
        title: `${medObj ? medObj.name : 'Medicine'} Snoozed (${mins} mins)`,
        detail: `2nd reminder scheduled in ${mins} minutes`,
        severity: 'warning',
      };

      addAuditLogSql(newLog);

      return {
        ...prev,
        medicines: updatedMeds,
        logs: [newLog, ...prev.logs],
      };
    });

    setActiveAlert(null);
    if (data.settings.voiceEnabled) {
      speakText(`Reminder snoozed. We will remind you again in ${mins} minutes.`);
    }
  };

  // Mark Medicine Missed & Trigger Escalation if threshold reached
  const handleMarkMissed = (medId) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    setData((prev) => {
      let medObj = null;
      let newMissedCount = 1;

      const updatedMeds = prev.medicines.map((m) => {
        if (m.id === medId) {
          medObj = m;
          newMissedCount = (m.missedCount || 0) + 1;
          return { ...m, status: 'missed', missedCount: newMissedCount };
        }
        return m;
      });

      updateMedicineSql(medId, 'missed', null, newMissedCount);

      const isEscalated = newMissedCount >= prev.caregiver.missedThreshold;

      const newLog = {
        id: `log-${Date.now()}`,
        timestamp,
        type: isEscalated ? 'CAREGIVER_ALERT' : 'MEDICINE_MISSED',
        title: isEscalated ? `⚠️ URGENT: Caregiver Alerted for ${medObj ? medObj.name : 'Medicine'}` : `Missed Reminder: ${medObj ? medObj.name : 'Medicine'}`,
        detail: isEscalated 
          ? `Repeatedly missed dose (${newMissedCount} times). Caregiver ${prev.caregiver.name} (${prev.caregiver.phone}) was notified.` 
          : `Medicine marked as missed. Second reminder warning logged.`,
        severity: isEscalated ? 'danger' : 'warning',
        resolved: !isEscalated,
      };

      addAuditLogSql(newLog);

      if (isEscalated) {
        soundManager.playUrgentAlert();
      }

      return {
        ...prev,
        medicines: updatedMeds,
        logs: [newLog, ...prev.logs],
      };
    });

    setActiveAlert(null);
  };

  // Trigger Instant Test Alarm Modal for testing
  const handleTriggerTestAlarm = (med) => {
    soundManager.playChime();
    setActiveAlert(med);
  };

  // SOS Emergency Trigger
  const handleEmergencyTrigger = () => {
    soundManager.playUrgentAlert();
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    const emergencyLog = {
      id: `log-${Date.now()}`,
      timestamp,
      type: 'EMERGENCY_SOS',
      title: '🚨 EMERGENCY SOS CALL TRIGGERED',
      detail: `Senior pressed SOS button. Caregiver ${data.caregiver.name} (${data.caregiver.phone}) notified.`,
      severity: 'danger',
      resolved: false,
    };

    addAuditLogSql(emergencyLog);

    setData((prev) => ({
      ...prev,
      logs: [emergencyLog, ...prev.logs],
    }));

    if (data.settings.voiceEnabled) {
      speakText(`Emergency SOS button pressed. Calling caregiver ${data.caregiver.name}.`);
    }

    // Attempt phone dialer or alert
    window.open(`tel:${data.caregiver.phone}`);
  };

  // Resolve Caregiver Alert
  const handleResolveAlert = (logId) => {
    soundManager.playSuccess();
    resolveAuditLogSql(logId);
    setData((prev) => ({
      ...prev,
      logs: prev.logs.map((l) => (l.id === logId ? { ...l, resolved: true } : l)),
    }));
  };

  // Add Water Glass (+250ml)
  const handleAddWaterGlass = () => {
    soundManager.playSuccess();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setData((prev) => {
      const newCount = Math.min(prev.water.currentGlasses + 1, prev.water.targetGlasses + 4);
      const newHistory = [{ time: timeNow, amountMl: prev.water.glassSizeMl }, ...prev.water.history];
      
      const newWater = {
        ...prev.water,
        currentGlasses: newCount,
        history: newHistory,
      };

      updateWaterSql(newWater);

      return {
        ...prev,
        water: newWater,
      };
    });

    if (data.settings.voiceEnabled) {
      speakText('Great! Water glass added. Staying hydrated is important!');
    }
  };

  // Toggle Health Activity
  const handleToggleActivity = (actId) => {
    soundManager.playChime();
    setData((prev) => {
      const updatedActs = prev.activities.map((a) => {
        if (a.id === actId) {
          toggleActivitySql(actId, !a.completed);
          return { ...a, completed: !a.completed };
        }
        return a;
      });
      return { ...prev, activities: updatedActs };
    });
  };

  // Toggle Diet Item
  const handleToggleDietItem = (mealId) => {
    soundManager.playChime();
    setData((prev) => {
      const updatedDiet = prev.dietPlan.map((d) => {
        if (d.id === mealId) {
          toggleDietSql(mealId, !d.completed);
          return { ...d, completed: !d.completed };
        }
        return d;
      });
      return { ...prev, dietPlan: updatedDiet };
    });
  };

  // Caregiver Save
  const handleSaveCaregiver = (updatedCaregiver) => {
    saveCaregiverSql(updatedCaregiver);
    setData((prev) => ({ ...prev, caregiver: updatedCaregiver }));
  };

  // Add Medicine
  const handleAddMedicine = (newMed) => {
    addMedicineSql(newMed);
    setData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMed],
    }));
  };

  // Delete Medicine
  const handleDeleteMedicine = (medId) => {
    soundManager.playChime();
    deleteMedicineSql(medId);
    setData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== medId),
    }));
  };

  // Add Vitals
  const handleAddBpLog = (newLog) => {
    addBpLogSql(newLog);
    setData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        bpLogs: [newLog, ...prev.vitals.bpLogs],
      },
    }));
  };

  const handleAddSugarLog = (newLog) => {
    addSugarLogSql(newLog);
    setData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        sugarLogs: [newLog, ...prev.vitals.sugarLogs],
      },
    }));
  };

  return (
    <div className="app-container">
      
      {/* App Header */}
      <Header 
        settings={data.settings} 
        updateSettings={handleUpdateSettings} 
        caregiver={data.caregiver}
        onEmergencyTrigger={handleEmergencyTrigger}
        dbType={data.dbType}
      />

      {/* Urgent Caregiver Escalation Banner if any missed alert active */}
      <CaregiverAlertBanner 
        alertLogs={data.logs} 
        caregiver={data.caregiver} 
        onResolveAlert={handleResolveAlert} 
      />

      {/* Main Navigation Tabs */}
      <nav className="nav-tabs">
        <button 
          onClick={() => { soundManager.playChime(); setActiveTab('dashboard'); }} 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          💊 Medicine & Diet
        </button>

        <button 
          onClick={() => { soundManager.playChime(); setActiveTab('vitals'); }} 
          className={`nav-tab ${activeTab === 'vitals' ? 'active' : ''}`}
        >
          ❤️ Vitals & BP
        </button>

        <button 
          onClick={() => { soundManager.playChime(); setActiveTab('caregiver'); }} 
          className={`nav-tab ${activeTab === 'caregiver' ? 'active' : ''}`}
        >
          🛡️ Caregiver Portal
        </button>
      </nav>

      {/* Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <ElderlyDashboard 
            medicines={data.medicines}
            dietPlan={data.dietPlan}
            activities={data.activities}
            water={data.water}
            onConfirmTaken={handleConfirmTaken}
            onSnooze={handleSnooze}
            onMarkMissed={handleMarkMissed}
            onTriggerTestAlarm={handleTriggerTestAlarm}
            onAddWaterGlass={handleAddWaterGlass}
            onToggleActivity={handleToggleActivity}
            onToggleDietItem={handleToggleDietItem}
            voiceEnabled={data.settings.voiceEnabled}
          />
        )}

        {activeTab === 'vitals' && (
          <VitalsTracker 
            vitals={data.vitals}
            onAddBpLog={handleAddBpLog}
            onAddSugarLog={handleAddSugarLog}
          />
        )}

        {activeTab === 'caregiver' && (
          <CaregiverDashboard 
            medicines={data.medicines}
            caregiver={data.caregiver}
            logs={data.logs}
            onSaveCaregiver={handleSaveCaregiver}
            onAddMedicine={handleAddMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onOpenAddModal={() => setIsAddMedModalOpen(true)}
          />
        )}
      </main>

      {/* Alarm Modal Overlay */}
      <AlarmModal 
        activeAlert={activeAlert}
        onConfirmTaken={handleConfirmTaken}
        onSnooze={handleSnooze}
        onMarkMissed={handleMarkMissed}
        caregiver={data.caregiver}
        voiceEnabled={data.settings.voiceEnabled}
      />

      {/* Add Medicine Modal */}
      <MedicineModal 
        isOpen={isAddMedModalOpen}
        onClose={() => setIsAddMedModalOpen(false)}
        onSave={handleAddMedicine}
      />

    </div>
  );
}
