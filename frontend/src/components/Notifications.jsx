import React, { useState, useEffect, useRef } from "react";

const Notifications = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Mock notifications - replace with actual API call
        const mockNotifications = [
            {
                id: 1,
                type: 'warning',
                title: 'Low Attendance Alert',
                message: 'Student John Doe has 65% attendance in Mathematics',
                timestamp: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'info',
                title: 'New Attendance Record',
                message: 'Attendance marked for CS101 - Introduction to Programming',
                timestamp: '5 hours ago',
                read: false
            },
            {
                id: 3,
                type: 'success',
                title: 'Report Generated',
                message: 'Monthly attendance report is ready for download',
                timestamp: '1 day ago',
                read: true
            }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleMarkAsRead = (id) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            error: 'fa-times-circle'
        };
        return iconMap[type] || 'fa-bell';
    };

    return (
        <div className="navbar-notify" ref={dropdownRef}>
            <div 
                className="notification-bell" 
                onClick={toggleDropdown}
                title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            >
                <i className="fa fa-bell" style={{ fontSize: 18, cursor: "pointer" }}></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </div>

            {showDropdown && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="unread-count">{unreadCount} unread</span>
                        )}
                    </div>
                    
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <i className="fa fa-bell-slash"></i>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="notification-icon-wrapper">
                                        <i className={`fa ${getNotificationIcon(notification.type)} notification-icon-${notification.type}`}></i>
                                    </div>
                                    <div className="notification-content">
                                        <h5>{notification.title}</h5>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">{notification.timestamp}</span>
                                    </div>
                                    {!notification.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="notifications-footer">
                            <button className="view-all-btn">View All Notifications</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;