import React from 'react';
import { 
  Pill, CheckCircle2, Clock, AlertTriangle, Play, Volume2, 
  Droplets, Utensils, Heart, Check, Plus, Sun, Sunrise, Sunset, Moon, Sparkles
} from 'lucide-react';
import { soundManager, speakText } from '../utils/audio';

export default function ElderlyDashboard({
  medicines,
  dietPlan,
  activities,
  water,
  onConfirmTaken,
  onSnooze,
  onMarkMissed,
  onTriggerTestAlarm,
  onAddWaterGlass,
  onToggleActivity,
  onToggleDietItem,
  voiceEnabled
}) {
  // Find upcoming medicine (first pending or snoozed medicine)
  const pendingMedicines = medicines.filter(m => m.status === 'pending' || m.status === 'snoozed');
  const nextMedicine = pendingMedicines.length > 0 ? pendingMedicines[0] : null;

  const takenCount = medicines.filter(m => m.status === 'taken').length;
  const totalMeds = medicines.length;

  const speakMedicine = (med) => {
    soundManager.playChime();
    speakText(`Medicine ${med.name}. Dosage: ${med.dosage}. Scheduled for ${med.time}. Instructions: ${med.instructions}`);
  };

  const getSlotIcon = (slot) => {
    switch (slot?.toLowerCase()) {
      case 'morning': return <Sunrise size={22} color="#f59e0b" />;
      case 'afternoon': return <Sun size={22} color="#3b82f6" />;
      case 'evening': return <Sunset size={22} color="#d97706" />;
      case 'night': return <Moon size={22} color="#8b5cf6" />;
      default: return <Clock size={22} color="#64748b" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. HERO CARD - Next Medicine Due */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', 
          color: '#ffffff',
          padding: '28px',
          borderRadius: '28px',
          border: 'none',
          boxShadow: '0 16px 36px rgba(37, 99, 235, 0.35)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '6px 16px', 
            borderRadius: '999px', 
            fontSize: '16px', 
            fontWeight: '700',
            backdropFilter: 'blur(4px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={18} /> NEXT SCHEDULED REMINDER
          </span>

          <span style={{ fontSize: '16px', fontWeight: '700', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '12px' }}>
            Daily Progress: <strong>{takenCount} of {totalMeds} Taken</strong>
          </span>
        </div>

        {nextMedicine ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '16px', opacity: 0.9, fontWeight: '600' }}>
                  {nextMedicine.slot} Dose • Scheduled at {nextMedicine.time}
                </span>
                <h2 style={{ fontSize: '38px', fontWeight: '800', margin: '4px 0 8px 0', lineHeight: 1.1 }}>
                  {nextMedicine.name}
                </h2>
                <p style={{ fontSize: '22px', fontWeight: '700', opacity: 0.95, margin: 0 }}>
                  Dosage: {nextMedicine.dosage}
                </p>
              </div>

              {/* Icon */}
              <div style={{ 
                width: '76px', 
                height: '76px', 
                borderRadius: '24px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                <Pill size={44} />
              </div>
            </div>

            <div style={{ 
              marginTop: '16px', 
              background: 'rgba(255, 255, 255, 0.15)', 
              padding: '14px 18px', 
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              💡 <strong>Instructions:</strong> {nextMedicine.instructions}
            </div>

            {/* Action Buttons for Next Pill */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onConfirmTaken(nextMedicine.id)}
                className="btn btn-success btn-lg"
                style={{ flex: 2, minWidth: '220px', borderRadius: '18px', fontSize: '22px' }}
              >
                <CheckCircle2 size={28} />
                <span>TAKE NOW</span>
              </button>

              <button 
                onClick={() => onTriggerTestAlarm(nextMedicine)}
                className="btn btn-warning"
                style={{ flex: 1, minWidth: '170px', borderRadius: '18px', fontSize: '18px' }}
                title="Test how alarm sounds"
              >
                <Play size={22} />
                <span>TEST ALARM</span>
              </button>

              <button 
                onClick={() => speakMedicine(nextMedicine)}
                className="btn btn-secondary"
                style={{ height: '68px', padding: '0 18px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                title="Read Out Loud"
              >
                <Volume2 size={26} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Sparkles size={52} style={{ marginBottom: '12px', opacity: 0.9 }} />
            <h3 style={{ fontSize: '28px', fontWeight: '800' }}>Great Job! All Medicines Taken</h3>
            <p style={{ fontSize: '18px', opacity: 0.95, marginTop: '4px' }}>
              You are completely up to date with your medicine schedule for today.
            </p>
          </div>
        )}
      </div>

      {/* 2. TODAY'S ALL MEDICINES SCHEDULE LIST */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={26} color="#2563eb" /> Today's Medicine List
          </h2>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Tap card to listen or mark
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {medicines.map((med) => {
            const isTaken = med.status === 'taken';
            const isMissed = med.status === 'missed';
            const isSnoozed = med.status === 'snoozed';

            return (
              <div 
                key={med.id}
                style={{ 
                  background: isTaken ? 'var(--success-bg)' : isMissed ? 'var(--danger-bg)' : isSnoozed ? 'var(--warning-bg)' : 'var(--bg-card-hover)',
                  border: `2px solid ${isTaken ? '#bbf7d0' : isMissed ? '#fecaca' : isSnoozed ? '#fde68a' : 'var(--border-color)'}`,
                  borderRadius: '20px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Left details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
                  <div style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '16px', 
                    background: med.color || '#3b82f6', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Pill size={28} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      {getSlotIcon(med.slot)}
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        {med.slot} • <strong>{med.time}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, textDecoration: isTaken ? 'line-through' : 'none' }}>
                      {med.name}
                    </h3>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>
                      Dosage: {med.dosage}
                    </p>
                  </div>
                </div>

                {/* Status Badge & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  
                  {/* Speak button */}
                  <button 
                    onClick={() => speakMedicine(med)}
                    className="btn btn-secondary"
                    style={{ height: '48px', width: '48px', padding: 0, borderRadius: '14px' }}
                    title="Read out instructions"
                  >
                    <Volume2 size={20} />
                  </button>

                  {/* Test Alarm Button */}
                  <button 
                    onClick={() => onTriggerTestAlarm(med)}
                    className="btn btn-outline"
                    style={{ height: '48px', padding: '0 12px', borderRadius: '14px', fontSize: '15px' }}
                    title="Test alarm popup"
                  >
                    <Play size={18} /> Test Alert
                  </button>

                  {/* Action or Taken status */}
                  {isTaken ? (
                    <span className="badge badge-success" style={{ padding: '10px 18px', fontSize: '16px' }}>
                      <CheckCircle2 size={20} /> TAKEN AT {med.takenAt || '08:00 AM'}
                    </span>
                  ) : (
                    <button 
                      onClick={() => onConfirmTaken(med.id)}
                      className="btn btn-success"
                      style={{ height: '48px', padding: '0 20px', borderRadius: '14px', fontSize: '16px' }}
                    >
                      <Check size={20} /> Mark Taken
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WATER HYDRATION & DIET SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Water Tracker Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #cff4fc 100%)', border: '2px solid #a5f3fc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0891b2', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={26} color="#0891b2" /> Water Intake Tracker
            </h2>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0e7490' }}>
              Goal: {water.targetGlasses} Glasses ({water.targetGlasses * water.glassSizeMl} ml)
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <h3 style={{ fontSize: '36px', fontWeight: '800', color: '#164e63', margin: 0 }}>
              {water.currentGlasses} / {water.targetGlasses} Glasses
            </h3>
            <p style={{ fontSize: '16px', color: '#0e7490', fontWeight: '600' }}>
              Total Drank Today: <strong>{water.currentGlasses * water.glassSizeMl} ml</strong>
            </p>
          </div>

          {/* Visual Glass Icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '14px 0' }}>
            {Array.from({ length: water.targetGlasses }).map((_, idx) => (
              <div 
                key={idx}
                style={{ 
                  width: '36px', 
                  height: '46px', 
                  borderRadius: '8px 8px 12px 12px',
                  background: idx < water.currentGlasses ? '#06b6d4' : '#e0f2fe',
                  border: '2px solid #0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <Droplets size={18} />
              </div>
            ))}
          </div>

          {/* Add Water Glass Button */}
          <button 
            onClick={onAddWaterGlass}
            className="btn btn-primary btn-full"
            style={{ borderRadius: '16px', background: '#0891b2', minHeight: '56px', fontSize: '19px' }}
          >
            <Plus size={24} />
            <span>DRANK 1 GLASS WATER (+250ml)</span>
          </button>
        </div>

        {/* Daily Diet & Meals Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={26} color="#d97706" /> Today's Diet Plan
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dietPlan.map((meal) => (
              <div 
                key={meal.id}
                style={{ 
                  background: meal.completed ? '#f0fdf4' : '#fafafa',
                  border: `2px solid ${meal.completed ? '#bbf7d0' : 'var(--border-color)'}`,
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--text-main)' }}>{meal.meal}</strong>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({meal.time})</span>
                  </div>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {meal.items.join(', ')}
                  </p>
                </div>

                <button 
                  onClick={() => onToggleDietItem(meal.id)}
                  className={`btn ${meal.completed ? 'btn-success' : 'btn-outline'}`}
                  style={{ height: '42px', padding: '0 14px', borderRadius: '10px', fontSize: '14px' }}
                >
                  {meal.completed ? <Check size={18} /> : 'Eaten'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. HEALTH ACTIVITIES CHECKLIST */}
      <div className="card">
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={26} color="#dc2626" /> Daily Health Activities
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {activities.map((act) => (
            <div 
              key={act.id}
              onClick={() => onToggleActivity(act.id)}
              style={{ 
                background: act.completed ? '#f0fdf4' : '#fafafa',
                border: `2px solid ${act.completed ? '#bbf7d0' : 'var(--border-color)'}`,
                borderRadius: '16px',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, textDecoration: act.completed ? 'line-through' : 'none' }}>
                  {act.name}
                </h4>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {act.time} ({act.duration})
                </span>
              </div>

              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: act.completed ? '#16a34a' : '#e2e8f0', 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {act.completed ? <Check size={22} /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
