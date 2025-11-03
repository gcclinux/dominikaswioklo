import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { authenticatedFetch } from '../utils/apiHelper';
import AdminAppointmentsMobile from './AdminAppointmentsMobile';
import { API } from '../../config/api';

function AdminAppointments({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [working, setWorking] = useState({}); // map id -> 'confirm'|'cancel'|'block'
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [hideBlocked, setHideBlocked] = useState(true);
  const [hidePast, setHidePast] = useState(false);
  const [blockedList, setBlockedList] = useState([]);
  const [confirmBlock, setConfirmBlock] = useState(null); // { userId, name, surname, email }
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isMobile] = useState(window.innerWidth <= 768);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [appointmentTypes, setAppointmentTypes] = useState([]);

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

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [aRes, sRes, bRes, tRes] = await Promise.all([
        authenticatedFetch(`${API}/appointments`).then(r => r.json()),
        authenticatedFetch(`${API}/settings`).then(r => r.json()),
        authenticatedFetch(`${API}/blocked`).then(r => r.json()),
        fetch(`${API}/appointment-types`).then(r => r.json()),
      ]);
      if (aRes.success) setItems(aRes.data || []);
      else setError(aRes.error || 'Failed to fetch appointments');
      if (sRes.success) setSettings(sRes.data);
      if (bRes?.success) setBlockedList(bRes.data || []);
      if (tRes?.success) setAppointmentTypes(tRes.data?.types || []);
    } catch (e) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAll();
  }, [isOpen]);

  const now = new Date();
  const bounds = useMemo(() => {
    const pastDays = settings?.pastAppointmentsDays ?? 30;
    const futureDays = settings?.futureAppointmentsDays ?? 30;
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - pastDays);
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + futureDays);
    return { minDate, maxDate };
  }, [settings]);

  const filtered = useMemo(() => {
    if (!items?.length) return [];
    const blockedUserIds = new Set((blockedList || []).map(b => b.userId).filter(Boolean));
    const blockedEmails = new Set((blockedList || []).map(b => (b.email || '').toLowerCase()).filter(Boolean));
    const blockedIps = new Set((blockedList || []).map(b => b.ipAddress).filter(Boolean));
    const byDate = items.filter((it) => {
      // it.date is YYYY-MM-DD
      const parts = (it.date || '').split('-');
      if (parts.length !== 3) return false;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(d.getTime())) return false;
      return d >= bounds.minDate && d <= bounds.maxDate;
    });

    const pendingFiltered = showPendingOnly ? byDate.filter((it) => it.status === 'pending') : byDate;
    const withoutBlocked = hideBlocked
      ? pendingFiltered.filter((it) => {
          const uid = it.userId;
          const email = (it.email || '').toLowerCase();
          const ip = it.ipAddress;
          return !(blockedUserIds.has(uid) || (email && blockedEmails.has(email)) || (ip && blockedIps.has(ip)));
        })
      : pendingFiltered;

    const withoutPast = hidePast
      ? withoutBlocked.filter((it) => {
          const parts = (it.date || '').split('-');
          if (parts.length !== 3) return false;
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d >= today;
        })
      : withoutBlocked;

    return withoutPast;
  }, [items, bounds, showPendingOnly, hideBlocked, hidePast, blockedList]);

  // Apply sorting
  const sorted = useMemo(() => {
    if (!filtered.length) return [];
    
    // Filter out empty appointments (no client, email, or phone)
    const withData = filtered.filter(row => {
      const hasClient = row.name || row.surname;
      const hasEmail = row.email;
      const hasPhone = row.phone && row.phone !== '—';
      return hasClient || hasEmail || hasPhone;
    });
    
    const sorted = [...withData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          // Sort by date and time
          const aDateTime = `${a.date}-${a.timeStart}`;
          const bDateTime = `${b.date}-${b.timeStart}`;
          comparison = aDateTime.localeCompare(bDateTime);
          break;
          
        case 'status':
          // Sort by status (pending, confirmed, cancelled, blocked)
          const statusWeight = (s) => {
            if (s === 'pending') return 0;
            if (s === 'confirmed') return 1;
            if (s === 'cancelled') return 2;
            if (s === 'blocked') return 3;
            return 4;
          };
          comparison = statusWeight(a.status) - statusWeight(b.status);
          break;
          
        case 'client':
          // Sort by client name (surname, then name)
          const aName = `${a.surname || ''} ${a.name || ''}`.toLowerCase();
          const bName = `${b.surname || ''} ${b.name || ''}`.toLowerCase();
          comparison = aName.localeCompare(bName);
          break;
          
        case 'phone':
          // Sort by phone number
          const aPhone = a.phone || '';
          const bPhone = b.phone || '';
          comparison = aPhone.localeCompare(bPhone);
          break;
          
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filtered, sortBy, sortDirection]);

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default direction based on column type
      setSortBy(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const call = async (path, method = 'PUT') => {
    const res = await authenticatedFetch(`${API}${path}`, { method });
    return res.json();
  };

  const confirmAppt = async (id) => {
    setWorking((w) => ({ ...w, [id]: 'confirm' }));
    try {
      const r = await call(`/appointments/${id}/confirm`);
      if (r.success) await fetchAll();
    } finally {
      setWorking((w) => ({ ...w, [id]: undefined }));
    }
  };

  const cancelAppt = async (id) => {
    setWorking((w) => ({ ...w, [id]: 'cancel' }));
    try {
      const r = await call(`/appointments/${id}/cancel`);
      if (r.success) await fetchAll();
    } finally {
      setWorking((w) => ({ ...w, [id]: undefined }));
    }
  };

  const blockUser = async (row) => {
    if (!row.userId && !row.email) return;
    const reason = 'Blocked by admin from appointments view';
    setWorking((w) => ({ ...w, [row.id]: 'block' }));
    try {
      // block by either userId or IP/email; we'll pass available fields
      const res = await authenticatedFetch(`${API}/blocked`, {
        method: 'POST',
        body: JSON.stringify({ userId: row.userId || null, ipAddress: row.ipAddress || null, email: row.email || null, reason })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to block user');
        return;
      }
      // mark appointment as blocked (frees the slot but keeps status as 'blocked')
      await call(`/appointments/${row.id}/block`);
      await fetchAll();
    } finally {
      setWorking((w) => ({ ...w, [row.id]: undefined }));
    }
  };

  const openConfirmBlock = (row) => {
    setConfirmBlock({ userId: row.userId, name: row.name, surname: row.surname, email: row.email });
  };

  const confirmBlockAll = async () => {
    if (!confirmBlock) return;
    const { userId, email } = confirmBlock;
    try {
      const res = await authenticatedFetch(`${API}/appointments/block-user`, {
        method: 'POST',
        body: JSON.stringify({ userId, email, reason: 'Blocked by admin (bulk)' })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to block user');
        return;
      }
      await fetchAll();
    } finally {
      setConfirmBlock(null);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="📅 All Appointments" maxWidth="76vw" maxHeight="95vh">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '70vh', // Fixed height for the entire content
        gap: '1rem'
      }}>
        {/* Fixed header section for loading/error messages */}
        {(loading || error) && (
          <div style={{ flexShrink: 0 }}>
            {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">Loading appointments…</span></div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {isMobile ? (
          <AdminAppointmentsMobile 
            sorted={sorted}
            confirmAppt={confirmAppt}
            cancelAppt={cancelAppt}
            blockUser={blockUser}
            appointmentTypes={appointmentTypes}
          />
        ) : (
        <div style={{ 
          flex: 1,
          border: '1px solid rgba(0,0,0,0.08)', 
          borderRadius: 12,
          overflow: 'hidden', // Hide overflow on container
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Fixed table header */}
          <div style={{ 
            flexShrink: 0,
            background: 'rgba(102,126,234,0.08)',
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1.5fr 1fr 1.2fr 1.5fr 2fr 1.5fr 0.5fr',
              gap: '0.5rem',
              padding: '0.75rem'
            }}>
              <div 
                style={{ 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: sortBy === 'date' ? '#667eea' : 'inherit'
                }}
                onClick={() => handleSort('date')}
                title="Click to sort by date"
              >
                Date {getSortIcon('date')}
              </div>
              <div style={{ fontWeight: 600 }}>Time</div>
              <div 
                style={{ 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: sortBy === 'status' ? '#667eea' : 'inherit'
                }}
                onClick={() => handleSort('status')}
                title="Click to sort by status"
              >
                Status {getSortIcon('status')}
              </div>
              <div style={{ fontWeight: 600 }}>Type</div>
              <div 
                style={{ 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: sortBy === 'client' ? '#667eea' : 'inherit'
                }}
                onClick={() => handleSort('client')}
                title="Click to sort by client name"
              >
                Client {getSortIcon('client')}
              </div>
              <div style={{ fontWeight: 600 }}>Email</div>
              <div 
                style={{ 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: sortBy === 'phone' ? '#667eea' : 'inherit'
                }}
                onClick={() => handleSort('phone')}
                title="Click to sort by phone"
              >
                Phone {getSortIcon('phone')}
              </div>
              <div style={{ fontWeight: 600, textAlign: 'center' }}>Select</div>
            </div>
          </div>

          {/* Scrollable appointments list body - ONLY this section scrolls */}
          <div style={{ 
            flex: 1,
            overflow: 'auto', // Only the appointments list scrolls
            background: 'white'
          }}>
            {sorted.map((row, idx) => {
              const appointmentType = appointmentTypes.find(t => t.appTag === row.appTag);
              return (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr 1fr 1.2fr 1.5fr 2fr 1.5fr 0.5fr',
                  gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid #eee',
                  background: row.status === 'pending' ? 'rgba(243,156,18,0.08)' : (idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'),
                  borderLeft: row.status === 'pending' ? '3px solid #f39c12' : '3px solid transparent',
                  alignItems: 'center'
                }}
              >
                <div>{row.date}</div>
                <div>{row.timeStart} - {row.timeEnd}</div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background:
                        row.status === 'pending' ? 'rgba(243,156,18,0.15)' :
                        row.status === 'confirmed' ? 'rgba(46,204,113,0.15)' :
                        row.status === 'blocked' ? 'rgba(230, 126, 34, 0.15)' :
                        'rgba(231,76,60,0.15)',
                      color:
                        row.status === 'pending' ? '#f39c12' :
                        row.status === 'confirmed' ? '#2ecc71' :
                        row.status === 'blocked' ? '#e67e22' :
                        '#e74c3c'
                    }}
                  >
                    {row.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>{appointmentType?.appName || '—'}</div>
                <div>{row.name} {row.surname}</div>
                <div>{row.email}</div>
                <div>{row.phone || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </div>
              </div>
              );
            })}
            {!loading && sorted.length === 0 && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#7f8c8d',
                fontStyle: 'italic'
              }}>
                No appointments in the selected window
              </div>
            )}
          </div>
        </div>
        )}

        {!isMobile && (
        <div style={{ flexShrink: 0, display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '2px solid #e0e0e0' }}>
          <button 
            onClick={() => handleBulkAction('confirm')}
            disabled={selectedIds.size === 0}
            style={{ 
              flex: 1,
              padding: '0.75rem',
              background: selectedIds.size === 0 ? '#ccc' : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: selectedIds.size === 0 ? 'none' : '0 4px 12px rgba(46,204,113,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            ✓ Confirm Selected
          </button>
          <button 
            onClick={() => handleBulkAction('cancel')}
            disabled={selectedIds.size === 0}
            style={{ 
              flex: 1,
              padding: '0.75rem',
              background: selectedIds.size === 0 ? '#ccc' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: selectedIds.size === 0 ? 'none' : '0 4px 12px rgba(231,76,60,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            ✕ Cancel Selected
          </button>
        </div>
        )}

        {!isMobile && (
        <div style={{ 
          flexShrink: 0,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '2px solid #e0e0e0',
          background: 'white'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 0.75rem',
              background: hideBlocked ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)' : 'white',
              border: hideBlocked ? '2px solid #667eea' : '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#2c3e50',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="checkbox" 
                checked={hideBlocked} 
                onChange={(e) => setHideBlocked(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#667eea' }}
              />
              🚫 Hide blocked users
            </label>
            <label style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 0.75rem',
              background: hidePast ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)' : 'white',
              border: hidePast ? '2px solid #667eea' : '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#2c3e50',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="checkbox" 
                checked={hidePast} 
                onChange={(e) => setHidePast(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#667eea' }}
              />
              📅 Hide past
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowPendingOnly(true)}
              style={{ 
                padding: '0.5rem 1.5rem',
                background: showPendingOnly ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' : 'white',
                color: showPendingOnly ? 'white' : '#2c3e50',
                border: showPendingOnly ? 'none' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: showPendingOnly ? '0 4px 12px rgba(243,156,18,0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              ⏳ Pending Only
            </button>
            <button
              onClick={() => setShowPendingOnly(false)}
              style={{ 
                padding: '0.5rem 1.5rem',
                background: !showPendingOnly ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: !showPendingOnly ? 'white' : '#2c3e50',
                border: !showPendingOnly ? 'none' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: !showPendingOnly ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Show All
            </button>
          </div>
        </div>
        )}
      </div>
    </Modal>
    {/* Confirmation Modal for blocking a user and all their appointments */}
    <Modal
      isOpen={!!confirmBlock}
      onClose={() => setConfirmBlock(null)}
      title="🚫 Block User"
      maxWidth="520px"
    >
      {confirmBlock && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="error-message" style={{ margin: 0 }}>
            You are about to block this user and mark all their appointments as blocked. This frees the time slots.
          </div>
          <div className="preview-box">
            <div className="preview-title">User</div>
            <p className="preview-text" style={{ margin: 0 }}>
              {confirmBlock.name} {confirmBlock.surname}
              {confirmBlock.email ? ` · ${confirmBlock.email}` : ''}
            </p>
          </div>
          <div className="info-box" style={{ marginTop: '-0.5rem' }}>
            <span className="info-icon">ℹ️</span>
            <span className="info-text">
              {items.filter(i => i.userId === confirmBlock.userId).length} appointment(s) will be marked as blocked.
            </span>
          </div>
          <div className="action-buttons">
            <button className="hover-gradient-button" onClick={() => setConfirmBlock(null)}>Cancel</button>
            <button className="danger-button" onClick={confirmBlockAll}>Block all</button>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
}

export default AdminAppointments;