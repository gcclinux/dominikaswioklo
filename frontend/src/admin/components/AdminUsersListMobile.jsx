import React, { useState } from 'react';

function AdminUsersListMobile({ items, doDelete, doBlock, working, onEdit }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

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
      if (action === 'delete') await doDelete(id);
      else if (action === 'block') await doBlock(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((row) => (
          <div key={row.uid} style={{
            background: selectedIds.has(row.uid) 
              ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: selectedIds.has(row.uid) ? '2px solid #667eea' : '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: selectedIds.has(row.uid) 
              ? '0 4px 12px rgba(102,126,234,0.2)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}>
            {/* Header: User ID, Status, Checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#999' }}>
                  ID: {row.uid}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: row.blocked ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)',
                  color: row.blocked ? '#c0392b' : '#27ae60'
                }}>
                  {row.blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={selectedIds.has(row.uid)}
                onChange={() => toggleSelect(row.uid)}
                style={{ 
                  cursor: 'pointer', 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#667eea'
                }}
              />
            </div>

            {/* User Name */}
            <div style={{ 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              color: '#2c3e50',
              marginBottom: '0.75rem'
            }}>
              👤 {row.name} {row.surname || ''}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.75rem 0' }} />

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                ✉️ {row.email || '—'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                📞 {row.phone || '—'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                📅 Created: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(row)}
              style={{
                marginTop: '0.75rem',
                width: '100%',
                padding: '0.6rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              ✏️ Edit User
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>No users found</div>
        )}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
        <button 
          onClick={() => handleBulkAction('delete')}
          disabled={selectedIds.size === 0 || working}
          style={{ 
            flex: 1,
            padding: '0.75rem',
            background: selectedIds.size === 0 || working ? '#ccc' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedIds.size === 0 || working ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Delete
        </button>
        <button 
          onClick={() => handleBulkAction('block')}
          disabled={selectedIds.size === 0 || working}
          style={{ 
            flex: 1,
            padding: '0.75rem',
            background: selectedIds.size === 0 || working ? '#ccc' : '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedIds.size === 0 || working ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Block
        </button>
      </div>
    </>
  );
}

export default AdminUsersListMobile;
