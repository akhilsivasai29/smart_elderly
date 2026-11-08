import React, { useState, useEffect } from 'react';
import { Heart, User, ShieldAlert, Volume2, VolumeX, Type, Clock, AlertTriangle } from 'lucide-react';
import { speakText, soundManager } from '../utils/audio';

export default function Header({ settings, updateSettings, caregiver, onEmergencyTrigger, dbType = 'SQLite' }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const toggleMode = () => {
    soundManager.playChime();
    const newMode = settings.mode === 'elderly' ? 'caregiver' : 'elderly';
    updateSettings({ ...settings, mode: newMode });
    if (settings.voiceEnabled) {
      speakText(newMode === 'caregiver' ? 'Switched to Caregiver Portal' : 'Switched to Senior Simple View');
    }
  };

  const cycleFontSize = () => {
    soundManager.playChime();
    const sizes = ['normal', 'large', 'extra-large'];
    const nextIndex = (sizes.indexOf(settings.fontSize) + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    updateSettings({ ...settings, fontSize: newSize });
    
    // Update body class
    document.body.classList.remove('font-large', 'font-extra-large');
    if (newSize === 'large') document.body.classList.add('font-large');
    if (newSize === 'extra-large') document.body.classList.add('font-extra-large');
  };

  const toggleVoice = () => {
    soundManager.playChime();
    const newVoiceState = !settings.voiceEnabled;
    updateSettings({ ...settings, voiceEnabled: newVoiceState });
    if (newVoiceState) {
      speakText('Voice assistance is enabled');
    }
  };

  return (
    <header className="card" style={{ padding: '16px 20px', marginBottom: '16px', background: settings.mode === 'caregiver' ? '#1e293b' : 'var(--bg-card)', color: settings.mode === 'caregiver' ? '#fff' : 'var(--text-main)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        
        {/* App Title & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <Heart size={32} fill="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>
                Senior Health Care
              </h1>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '12px', 
                background: dbType === 'MySQL' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                color: dbType === 'MySQL' ? '#3b82f6' : '#10b981', 
                border: dbType === 'MySQL' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {dbType === 'MySQL' ? '🐬 MySQL Connected' : '🗄️ SQLite Connected'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: settings.mode === 'caregiver' ? '#94a3b8' : 'var(--text-muted)', marginTop: '2px', fontWeight: '600' }}>
              <Clock size={16} />
              <span>{formattedDate} • <strong>{formattedTime}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Utility Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Audio Speak Toggle */}
          <button 
            onClick={toggleVoice} 
            className="btn btn-secondary" 
            style={{ height: '48px', padding: '0 14px', borderRadius: '12px', fontSize: '15px' }}
            title="Toggle Voice Assistance"
          >
            {settings.voiceEnabled ? <Volume2 size={20} color="#16a34a" /> : <VolumeX size={20} color="#94a3b8" />}
            <span style={{ display: 'none', mdDisplay: 'inline' }}>{settings.voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {/* Font Size Cycle */}
          <button 
            onClick={cycleFontSize} 
            className="btn btn-secondary" 
            style={{ height: '48px', padding: '0 14px', borderRadius: '12px', fontSize: '15px' }}
            title="Increase Text Size"
          >
            <Type size={20} />
            <span>Size: {settings.fontSize.toUpperCase()}</span>
          </button>

          {/* Senior View vs Caregiver Mode Toggle */}
          <button 
            onClick={toggleMode} 
            className={`btn ${settings.mode === 'caregiver' ? 'btn-warning' : 'btn-outline'}`}
            style={{ height: '48px', padding: '0 16px', borderRadius: '12px', fontSize: '15px' }}
          >
            {settings.mode === 'elderly' ? <User size={20} /> : <ShieldAlert size={20} />}
            <span>{settings.mode === 'elderly' ? 'Caregiver Mode' : 'Senior View'}</span>
          </button>

          {/* Emergency Call / SOS Button */}
          <button
            onClick={onEmergencyTrigger}
            className="btn btn-danger"
            style={{ height: '48px', padding: '0 16px', borderRadius: '12px', fontSize: '15px' }}
            title="Notify Caregiver Emergency"
          >
            <AlertTriangle size={20} />
            <span>SOS Call</span>
          </button>
        </div>

      </div>

      {/* Sub-header Banner in Caregiver Mode */}
      {settings.mode === 'caregiver' && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 14px', 
          background: 'rgba(245, 158, 11, 0.15)', 
          borderRadius: '10px', 
          borderLeft: '4px solid #f59e0b',
          fontSize: '14px',
          color: '#fef08a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>🛡️ <strong>Caregiver Management Mode Active:</strong> You can edit schedules, set alert thresholds, and monitor logs.</span>
          <span style={{ fontWeight: 700 }}>Caregiver: {caregiver.name} ({caregiver.phone})</span>
        </div>
      )}
    </header>
  );
}
