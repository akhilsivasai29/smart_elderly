import React, { useState } from 'react';
import { Activity, Heart, Droplet, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function VitalsTracker({ vitals, onAddBpLog, onAddSugarLog }) {
  const [activeSubTab, setActiveSubTab] = useState('bp'); // 'bp' | 'sugar'

  // BP Form State
  const [sys, setSys] = useState('124');
  const [dia, setDia] = useState('82');
  const [pulse, setPulse] = useState('74');

  // Sugar Form State
  const [sugarLevel, setSugarLevel] = useState('110');
  const [sugarType, setSugarType] = useState('Fasting');

  const getBpCategory = (s, d) => {
    const sysNum = Number(s);
    const diaNum = Number(d);
    if (sysNum < 120 && diaNum < 80) return { label: 'Normal', color: 'badge-success' };
    if (sysNum <= 129 && diaNum < 80) return { label: 'Elevated', color: 'badge-warning' };
    if (sysNum <= 139 || diaNum <= 89) return { label: 'Stage 1 High', color: 'badge-warning' };
    return { label: 'Stage 2 High', color: 'badge-danger' };
  };

  const getSugarCategory = (level, type) => {
    const l = Number(level);
    if (type === 'Fasting') {
      if (l < 100) return { label: 'Normal Fasting', color: 'badge-success' };
      if (l <= 125) return { label: 'Slightly High', color: 'badge-warning' };
      return { label: 'High Fasting', color: 'badge-danger' };
    } else {
      if (l < 140) return { label: 'Normal Post-Meal', color: 'badge-success' };
      if (l <= 199) return { label: 'Elevated', color: 'badge-warning' };
      return { label: 'High Post-Meal', color: 'badge-danger' };
    }
  };

  const handleBpSubmit = (e) => {
    e.preventDefault();
    soundManager.playSuccess();
    const now = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const cat = getBpCategory(sys, dia).label;
    onAddBpLog({
      id: `bp-${Date.now()}`,
      date: now,
      sys: Number(sys),
      dia: Number(dia),
      pulse: Number(pulse),
      category: cat,
      note: 'Routine blood pressure reading',
    });
  };

  const handleSugarSubmit = (e) => {
    e.preventDefault();
    soundManager.playSuccess();
    const now = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const cat = getSugarCategory(sugarLevel, sugarType).label;
    onAddSugarLog({
      id: `s-${Date.now()}`,
      date: now,
      level: Number(sugarLevel),
      type: sugarType,
      category: cat,
      note: `${sugarType} blood glucose check`,
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={26} color="#ef4444" /> Health Vitals & Monitor
        </h2>

        {/* Sub Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveSubTab('bp')}
            className={`btn ${activeSubTab === 'bp' ? 'btn-primary' : 'btn-outline'}`}
            style={{ height: '44px', padding: '0 16px', borderRadius: '12px', fontSize: '15px' }}
          >
            <Heart size={18} /> Blood Pressure (BP)
          </button>
          <button 
            onClick={() => setActiveSubTab('sugar')}
            className={`btn ${activeSubTab === 'sugar' ? 'btn-primary' : 'btn-outline'}`}
            style={{ height: '44px', padding: '0 16px', borderRadius: '12px', fontSize: '15px' }}
          >
            <Droplet size={18} /> Blood Sugar
          </button>
        </div>
      </div>

      {activeSubTab === 'bp' ? (
        <div>
          {/* BP Input Form */}
          <form onSubmit={handleBpSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '2px solid var(--border-color)', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Record New Blood Pressure Reading</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '15px' }}>Systolic (Top)</label>
                <input type="number" className="form-input" value={sys} onChange={(e) => setSys(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '15px' }}>Diastolic (Bottom)</label>
                <input type="number" className="form-input" value={dia} onChange={(e) => setDia(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '15px' }}>Pulse (BPM)</label>
                <input type="number" className="form-input" value={pulse} onChange={(e) => setPulse(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-success btn-full" style={{ height: '52px', borderRadius: '14px' }}>
                  <Plus size={20} /> Save BP
                </button>
              </div>
            </div>
          </form>

          {/* BP History Table */}
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>Recent BP History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vitals.bpLogs.map((log) => {
              const catInfo = getBpCategory(log.sys, log.dia);
              return (
                <div 
                  key={log.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 16px', 
                    borderRadius: '14px', 
                    border: '2px solid var(--border-color)',
                    background: '#fff'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '20px' }}>{log.sys} / {log.dia} mmHg</strong>
                    <span style={{ fontSize: '15px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      Pulse: {log.pulse} bpm • {log.date}
                    </span>
                  </div>
                  <span className={`badge ${catInfo.color}`}>{catInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {/* Sugar Input Form */}
          <form onSubmit={handleSugarSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '2px solid var(--border-color)', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Record Blood Sugar Reading</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '15px' }}>Glucose Level (mg/dL)</label>
                <input type="number" className="form-input" value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '15px' }}>Reading Context</label>
                <select className="form-select" value={sugarType} onChange={(e) => setSugarType(e.target.value)}>
                  <option value="Fasting">Fasting (Before Breakfast)</option>
                  <option value="Post-Meal">Post-Meal (2 Hours After Meal)</option>
                  <option value="Random">Random Check</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-success btn-full" style={{ height: '52px', borderRadius: '14px' }}>
                  <Plus size={20} /> Save Sugar Log
                </button>
              </div>
            </div>
          </form>

          {/* Sugar History Table */}
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>Blood Sugar Log History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vitals.sugarLogs.map((log) => {
              const catInfo = getSugarCategory(log.level, log.type);
              return (
                <div 
                  key={log.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 16px', 
                    borderRadius: '14px', 
                    border: '2px solid var(--border-color)',
                    background: '#fff'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '20px' }}>{log.level} mg/dL</strong>
                    <span style={{ fontSize: '15px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      ({log.type}) • {log.date}
                    </span>
                  </div>
                  <span className={`badge ${catInfo.color}`}>{catInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
