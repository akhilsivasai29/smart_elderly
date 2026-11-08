import React from 'react';
import { AlertOctagon, PhoneCall, MessageSquare, CheckCircle, ShieldAlert } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function CaregiverAlertBanner({ alertLogs, caregiver, onResolveAlert }) {
  if (!alertLogs || alertLogs.length === 0) return null;

  const activeAlerts = alertLogs.filter((log) => !log.resolved);
  if (activeAlerts.length === 0) return null;

  const currentLog = activeAlerts[0];

  const handlePhoneCall = () => {
    soundManager.playChime();
    window.open(`tel:${caregiver.phone}`);
  };

  const handleWhatsApp = () => {
    soundManager.playChime();
    const text = encodeURIComponent(
      `Hello ${caregiver.name}, Urgent Health Alert: Elderly family member has missed their scheduled medicine: ${currentLog.title}. Please check in.`
    );
    window.open(`https://wa.me/${caregiver.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div 
      className="card"
      style={{ 
        background: 'linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%)', 
        border: '3px solid #f43f5e', 
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(244, 63, 94, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '16px', 
          background: '#f43f5e', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertOctagon size={34} />
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-danger" style={{ fontSize: '15px' }}>
              <ShieldAlert size={16} /> URGENT CAREGIVER NOTIFICATION
            </span>
            <span style={{ fontSize: '14px', color: '#9f1239', fontWeight: '600' }}>{currentLog.timestamp}</span>
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#881337', margin: '4px 0' }}>
            {currentLog.title}
          </h3>

          <p style={{ fontSize: '17px', color: '#9f1239', fontWeight: '600', marginBottom: '14px' }}>
            {currentLog.detail || `Repeatedly missed scheduled reminder. Caregiver ${caregiver.name} was notified.`}
          </p>

          {/* Action Buttons to connect with caregiver */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={handlePhoneCall} 
              className="btn btn-danger"
              style={{ padding: '0 18px', height: '46px', fontSize: '16px', borderRadius: '12px' }}
            >
              <PhoneCall size={18} />
              <span>Call Caregiver ({caregiver.name})</span>
            </button>

            <button 
              onClick={handleWhatsApp} 
              className="btn btn-success"
              style={{ padding: '0 18px', height: '46px', fontSize: '16px', borderRadius: '12px', background: '#25d366' }}
            >
              <MessageSquare size={18} />
              <span>WhatsApp Alert</span>
            </button>

            <button 
              onClick={() => onResolveAlert(currentLog.id)} 
              className="btn btn-secondary"
              style={{ padding: '0 16px', height: '46px', fontSize: '16px', borderRadius: '12px' }}
            >
              <CheckCircle size={18} />
              <span>Mark Checked & Resolved</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
