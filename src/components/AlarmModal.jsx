import React, { useEffect, useState } from 'react';
import { Pill, CheckCircle2, Clock, AlertTriangle, BellRing, Volume2, ShieldAlert } from 'lucide-react';
import { soundManager, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function AlarmModal({ activeAlert, onConfirmTaken, onSnooze, onMarkMissed, caregiver, voiceEnabled }) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min auto 2nd reminder countdown simulation

  useEffect(() => {
    if (!activeAlert) return;

    // Start playing alarm ringtone sound
    soundManager.playAlarm();

    // Voice announcement
    if (voiceEnabled) {
      const speechMsg = `Attention please! It is time to take your ${activeAlert.slot || 'scheduled'} medicine: ${activeAlert.name}. ${activeAlert.instructions || ''}`;
      speakText(speechMsg);
    }

    // Interval to repeat subtle alert sound every 10s if open
    const soundInterval = setInterval(() => {
      soundManager.playAlarm();
    }, 10000);

    // Auto 2nd reminder timer
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(soundInterval);
      clearInterval(countdown);
    };
  }, [activeAlert, voiceEnabled]);

  if (!activeAlert) return null;

  const handleTaken = () => {
    soundManager.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti error", e);
    }
    onConfirmTaken(activeAlert.id);
  };

  const handleSnooze = () => {
    soundManager.playChime();
    onSnooze(activeAlert.id, 5); // 5 mins
  };

  const handleMissed = () => {
    soundManager.playUrgentAlert();
    onMarkMissed(activeAlert.id);
  };

  const speakInstruction = () => {
    speakText(`Medicine: ${activeAlert.name}. Dosage: ${activeAlert.dosage}. Instructions: ${activeAlert.instructions}`);
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.88)' }}>
      <div 
        className="modal-content alarm-pulse" 
        style={{ 
          border: '4px solid #ef4444', 
          maxWidth: '640px', 
          textAlign: 'center',
          padding: '32px 24px',
          background: 'var(--bg-card)'
        }}
      >
        {/* Alarm Header Icon */}
        <div style={{ 
          width: '90px', 
          height: '90px', 
          borderRadius: '50%', 
          background: '#fee2e2', 
          color: '#dc2626', 
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(220, 38, 38, 0.4)'
        }}>
          <BellRing size={52} className="alarm-pulse" />
        </div>

        {/* Escalation or 2nd Reminder Badge */}
        {activeAlert.isSecondReminder ? (
          <div className="badge badge-warning" style={{ fontSize: '16px', padding: '8px 18px', marginBottom: '12px' }}>
            <AlertTriangle size={18} /> SECOND REMINDER NOTICE (Unanswered)
          </div>
        ) : (
          <div className="badge badge-danger" style={{ fontSize: '16px', padding: '8px 18px', marginBottom: '12px' }}>
            ⏰ MEDICINE REMINDER TIME ({activeAlert.time})
          </div>
        )}

        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
          It is time for your medicine!
        </h2>

        {/* Medicine Main Card */}
        <div style={{ 
          background: 'var(--primary-light)', 
          borderRadius: '20px', 
          padding: '20px', 
          margin: '16px 0 24px',
          border: '2px solid #bfdbfe',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: activeAlert.color || '#3b82f6', 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Pill size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a8a', margin: 0 }}>
                  {activeAlert.name}
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                  Dosage: {activeAlert.dosage}
                </p>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button 
              onClick={speakInstruction} 
              className="btn btn-outline" 
              style={{ height: '44px', padding: '0 12px', borderRadius: '10px', fontSize: '15px' }}
              title="Speak instruction out loud"
            >
              <Volume2 size={20} /> Listen
            </button>
          </div>

          <div style={{ marginTop: '12px', background: '#fff', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              💡 <strong>Instructions:</strong> {activeAlert.instructions || 'Take with fresh water.'}
            </p>
          </div>
        </div>

        {/* Action Buttons - Extra Large for Elderly Accessibility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          
          {/* Taken Button - Big Green */}
          <button 
            onClick={handleTaken} 
            className="btn btn-success btn-lg btn-full"
            style={{ fontSize: '24px', borderRadius: '20px' }}
          >
            <CheckCircle2 size={32} />
            <span>I HAVE TAKEN THIS MEDICINE</span>
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Snooze 5 Mins */}
            <button 
              onClick={handleSnooze} 
              className="btn btn-warning btn-full"
              style={{ flex: 1, minHeight: '60px', fontSize: '18px' }}
            >
              <Clock size={22} />
              <span>Remind in 5 Mins</span>
            </button>

            {/* Missed / Skip */}
            <button 
              onClick={handleMissed} 
              className="btn btn-secondary btn-full"
              style={{ flex: 1, minHeight: '60px', fontSize: '18px', color: '#dc2626' }}
            >
              <AlertTriangle size={22} />
              <span>Mark as Missed</span>
            </button>
          </div>
        </div>

        {/* Caregiver Safety Info Notice */}
        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '14px', 
          padding: '12px 16px', 
          fontSize: '15px', 
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={18} color="#d97706" />
          <span>
            Caregiver Alert Notice: If unanswered, 2nd reminder will sound. If missed, <strong>{caregiver.name} ({caregiver.phone})</strong> will be alerted.
          </span>
        </div>

      </div>
    </div>
  );
}
