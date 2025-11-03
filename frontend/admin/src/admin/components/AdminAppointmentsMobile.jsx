import React, { useState, useMemo } from 'react';

function AdminAppointmentsMobile({ sorted, confirmAppt, cancelAppt, blockUser, appointmentTypes = [] }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const futureOnly = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sorted.filter(row => {
      const parts = (row.date || '').split('-');
      if (parts.length !== 3) return false;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d >= today;
    });
  }, [sorted]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    for (const id of selectedIds) {
      if (action === 'confirm') await confirmAppt(id);
      else if (action === 'cancel') await cancelAppt(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {futureOnly.map((row) => {
          const appointmentType = appointmentTypes.find(t => t.appTag === row.appTag);
          return (
          <div key={row.id} style={{
            background: selectedIds.has(row.id) 
              ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: selectedIds.has(row.id) ? '2px solid #667eea' : '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: selectedIds.has(row.id) 
              ? '0 4px 12px rgba(102,126,234,0.2)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}>
            {/* Header: Date/Time, Status, Checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2c3e50' }}>
                  📅 {row.date}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background:
                    row.status === 'pending' ? 'rgba(243,156,18,0.2)' :
                    row.status === 'confirmed' ? 'rgba(46,204,113,0.2)' :
                    row.status === 'blocked' ? 'rgba(230, 126, 34, 0.2)' :
                    'rgba(231,76,60,0.2)',
                  color:
                    row.status === 'pending' ? '#d68910' :
                    row.status === 'confirmed' ? '#27ae60' :
                    row.status === 'blocked' ? '#d35400' :
                    '#c0392b'
                }}>
                  {row.status}
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={selectedIds.has(row.id)}
                onChange={() => toggleSelect(row.id)}
                style={{ 
                  cursor: 'pointer', 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#667eea'
                }}
              />
            </div>

            {/* Time */}
            <div style={{ 
              fontSize: '0.95rem', 
              color: '#555', 
              marginBottom: '0.75rem',
              fontWeight: 600
            }}>
              🕐 {row.timeStart} - {row.timeEnd}
            </div>

            {/* Appointment Type */}
            {appointmentType && (
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#667eea', 
                marginBottom: '0.75rem',
                fontWeight: 600,
                background: 'rgba(102,126,234,0.1)',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                📋 {appointmentType.appName}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.75rem 0' }} />

            {/* Client Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2c3e50' }}>
                👤 {row.name} {row.surname}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                ✉️ {row.email}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                📞 {row.phone || '—'}
              </div>
            </div>
          </div>
          );
        })}
        {futureOnly.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>No future appointments</div>
        )}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
        <button 
          onClick={() => handleBulkAction('confirm')}
          disabled={selectedIds.size === 0}
          style={{ 
            flex: 1,
            padding: '0.75rem',
            background: selectedIds.size === 0 ? '#ccc' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Confirm
        </button>
        <button 
          onClick={() => handleBulkAction('cancel')}
          disabled={selectedIds.size === 0}
          style={{ 
            flex: 1,
            padding: '0.75rem',
            background: selectedIds.size === 0 ? '#ccc' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export default AdminAppointmentsMobile;
