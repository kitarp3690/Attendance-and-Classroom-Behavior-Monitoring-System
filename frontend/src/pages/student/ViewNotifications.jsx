import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import './StudentPages.css';

export default function ViewNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      setNotifications(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="student-page">
      <div className="page-header">
        <h1>🔔 Notifications</h1>
        {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} Unread</span>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        {notifications.length === 0 ? (
          <p className="empty-state">No notifications</p>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.type && (
                    <span className={`badge badge-${notification.type}`}>
                      {notification.type.toUpperCase()}
                    </span>
                  )}
                </div>
                {!notification.is_read && (
                  <button
                    className="btn-sm btn-info"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
