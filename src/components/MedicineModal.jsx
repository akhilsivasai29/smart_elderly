import React, { useState } from 'react';
import { X, Plus, Pill } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function MedicineModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet (500mg)');
  const [time, setTime] = useState('09:00');
  const [slot, setSlot] = useState('Morning');
  const [instructions, setInstructions] = useState('Take with 1 glass of water after food');
  const [color, setColor] = useState('#ef4444');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playSuccess();
    onSave({
      id: `med-${Date.now()}`,
      name,
      dosage,
      time,
      slot,
      instructions,
      color,
      iconType: 'pill',
      status: 'pending',
      takenAt: null,
      missedCount: 0,
    });

    // Reset form
    setName('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={28} color="#2563eb" /> Add New Medicine Reminder
          </h2>
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Medicine Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Aspirin, Blood Pressure Tablet" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Dosage</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 100mg (1 Pill)" 
                value={dosage} 
                onChange={(e) => setDosage(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Time</label>
              <input 
                type="time" 
                className="form-input" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select className="form-select" value={slot} onChange={(e) => setSlot(e.target.value)}>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pill Tag Color</label>
              <select className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="#ef4444">🔴 Red</option>
                <option value="#3b82f6">🔵 Blue</option>
                <option value="#10b981">🟢 Green</option>
                <option value="#8b5cf6">🟣 Purple</option>
                <option value="#f59e0b">🟡 Yellow</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Food & Special Instructions</label>
            <textarea 
              className="form-textarea" 
              rows={3} 
              placeholder="e.g. Take after breakfast with warm water" 
              value={instructions} 
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-full">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full">
              <Plus size={20} /> Save Medicine Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
