 import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const NotificationBell = () => {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // ============================================
  // STYLES OBJECT
  // ============================================
  const styles = {
    wrapper: { position: 'relative' },
    bellBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '8px', position: 'relative', fontSize: '20px'
    },
    badge: {
      position: 'absolute', top: '2px', right: '2px',
      background: '#ef4444', color: '#fff', borderRadius: '50%',
      width: '18px', height: '18px', fontSize: '11px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    dropdown: {
      position: 'absolute', top: '45px', right: '0',
      width: '360px', maxHeight: '450px', background: '#fff',
      borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px', borderBottom: '1px solid #f3f4f6'
    },
    headerTitle: { fontWeight: '700', fontSize: '15px', color: '#111827' },
    markAllBtn: {
      background: 'none', border: 'none', color: '#1e3a8a',
      fontSize: '12px', fontWeight: '600', cursor: 'pointer'
    },
    list: { maxHeight: '380px', overflowY: 'auto' },
    empty: {
      padding: '40px 20px', textAlign: 'center',
      color: '#6b7280', fontSize: '14px'
    },
    item: (read) => ({
      padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
      cursor: read ? 'default' : 'pointer',
      background: read ? '#fff' : '#eff6ff'
    }),
    itemRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
    dot: (read) => ({
      width: '8px', height: '8px', borderRadius: '50%',
      background: read ? '#d1d5db' : '#3b82f6',
      marginTop: '6px', flexShrink: 0
    }),
    title: (read) => ({
      fontSize: '13px', fontWeight: read ? '500' : '700',
      color: '#111827', marginBottom: '2px', lineHeight: '1.4'
    }),
    msg: {
      fontSize: '12px', color: '#4b5563',
      lineHeight: '1.4', marginBottom: '4px'
    },
    time: { fontSize: '11px', color: '#9ca3af' }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div ref={dropdownRef} style={styles.wrapper}>
      <button onClick={() => setOpen(!open)} style={styles.bellBtn}>
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={styles.markAllBtn}>
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>🔔 No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
                  style={styles.item(n.read)}
                >
                  <div style={styles.itemRow}>
                    <div style={styles.dot(n.read)} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.title(n.read)}>{n.title}</div>
                      <div style={styles.msg}>{n.message}</div>
                      <div style={styles.time}>{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;