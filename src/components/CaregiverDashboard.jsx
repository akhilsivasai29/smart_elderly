import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Trash2, Edit3, Save, Phone, Mail, MessageSquare, 
  Clock, AlertTriangle, FileText, CheckCircle2, User, BellRing
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function CaregiverDashboard({
  medicines,
  caregiver,
  logs,
  onSaveCaregiver,
  onAddMedicine,
  onDeleteMedicine,
  onOpenAddModal
}) {
  const [editingCaregiver, setEditingCaregiver] = useState(caregiver);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleCaregiverSubmit = (e) => {
    e.preventDefault();
    soundManager.playSuccess();
    onSaveCaregiver(editingCaregiver);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handlePrintReport = () => {
    soundManager.playChime();
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Caregiver Portal Header Banner */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.2)', 
              color: '#fef08a', 
              padding: '6px 14px', 
              borderRadius: '999px', 
              fontSize: '14px', 
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={18} /> CAREGIVER & FAMILY CONTROL CENTER
            </span>

            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 4px 0' }}>
              Caregiver Schedule & Alert Management
            </h2>
            <p style={{ fontSize: '17px', color: '#cbd5e1', margin: 0 }}>
              Manage medication times, set escalation alerts, and view missed medicine logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{ borderRadius: '14px', minHeight: '52px', fontSize: '17px' }}
            >
              <Plus size={22} /> Add New Medicine
            </button>

            <button 
              onClick={handlePrintReport}
              className="btn btn-secondary"
              style={{ borderRadius: '14px', minHeight: '52px', fontSize: '17px', background: '#334155', color: '#fff' }}
            >
              <FileText size={22} /> Print Doctor Summary
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Caregiver Settings + Medicine Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 1. Caregiver Contact & Escalation Settings */}
        <div className="card">
          <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={24} color="#2563eb" /> Primary Caregiver Info & Escalation
          </h3>

          <form onSubmit={handleCaregiverSubmit}>
            <div className="form-group">
              <label className="form-label">Caregiver Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingCaregiver.name} 
                onChange={(e) => setEditingCaregiver({ ...editingCaregiver, name: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship / Role</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingCaregiver.relation} 
                onChange={(e) => setEditingCaregiver({ ...editingCaregiver, relation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (For Call & SMS Alerts)</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingCaregiver.phone} 
                onChange={(e) => setEditingCaregiver({ ...editingCaregiver, phone: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number (For Direct Escalation)</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingCaregiver.whatsapp} 
                onChange={(e) => setEditingCaregiver({ ...editingCaregiver, whatsapp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Missed Reminder Threshold</label>
              <select 
                className="form-select"
                value={editingCaregiver.missedThreshold}
                onChange={(e) => setEditingCaregiver({ ...editingCaregiver, missedThreshold: Number(e.target.value) })}
              >
                <option value={1}>Alert after 1 Missed Reminder (Immediate)</option>
                <option value={2}>Alert after 2 Missed Reminders (Recommended)</option>
              </select>
            </div>

            {isSavedNotice && (
              <div style={{ padding: '10px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontWeight: '700', marginBottom: '14px', fontSize: '15px' }}>
                ✓ Caregiver Settings Updated Successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ borderRadius: '14px' }}>
              <Save size={20} /> Save Caregiver Details
            </button>
          </form>
        </div>

        {/* 2. Medicine Schedule Management */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={24} color="#3b82f6" /> Manage Prescribed Medicines ({medicines.length})
            </h3>

            <button onClick={onOpenAddModal} className="btn btn-outline" style={{ height: '40px', padding: '0 12px', borderRadius: '10px', fontSize: '14px' }}>
              <Plus size={16} /> Add Pill
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {medicines.map((med) => (
              <div 
                key={med.id}
                style={{ 
                  background: '#f8fafc',
                  border: '2px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    background: med.color || '#3b82f6', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <BellRing size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '19px', fontWeight: '800', margin: 0 }}>
                      {med.name} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({med.time})</span>
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                      Dosage: {med.dosage} • {med.slot}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => onDeleteMedicine(med.id)}
                  className="btn btn-secondary"
                  style={{ height: '40px', width: '40px', padding: 0, borderRadius: '10px', color: '#dc2626' }}
                  title="Delete medicine schedule"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Missed Reminders & Audit Activity Log */}
      <div className="card">
        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={24} color="#d97706" /> Activity & Missed Reminder Audit History
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.map((log) => (
            <div 
              key={log.id}
              style={{ 
                background: log.severity === 'danger' ? '#fef2f2' : log.severity === 'warning' ? '#fffbeb' : '#f0fdf4',
                borderLeft: `5px solid ${log.severity === 'danger' ? '#dc2626' : log.severity === 'warning' ? '#d97706' : '#16a34a'}`,
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <strong style={{ fontSize: '17px', color: 'var(--text-main)' }}>{log.title}</strong>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {log.detail}
                </p>
              </div>

              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
