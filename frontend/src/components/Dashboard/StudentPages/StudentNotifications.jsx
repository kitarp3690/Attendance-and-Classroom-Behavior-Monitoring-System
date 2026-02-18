import React, { useState } from "react";
import "./StudentPages.css";

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "attendance",
            title: "Attendance Alert",
            message: "Your attendance in Mathematics is below 75%. Please attend regularly.",
            date: "2024-11-14",
            read: false,
            icon: "fa fa-exclamation-triangle",
            color: "warning"
        },
        {
            id: 2,
            type: "success",
            title: "Attendance Marked",
            message: "Your attendance for Physics class has been marked as Present.",
            date: "2024-11-14",
            read: false,
            icon: "fa fa-check-circle",
            color: "success"
        },
        {
            id: 3,
            type: "info",
            title: "Class Schedule Changed",
            message: "Mathematics class on Nov 15 has been rescheduled to 2:00 PM.",
            date: "2024-11-13",
            read: true,
            icon: "fa fa-clock-o",
            color: "info"
        },
        {
            id: 4,
            type: "achievement",
            title: "Perfect Attendance",
            message: "You have achieved 100% attendance in Data Structures!",
            date: "2024-11-12",
            read: true,
            icon: "fa fa-trophy",
            color: "success"
        },
        {
            id: 5,
            type: "info",
            title: "New Assignment",
            message: "Dr. Smith has posted a new assignment for Mathematics.",
            date: "2024-11-11",
            read: true,
            icon: "fa fa-book",
            color: "info"
        },
    ]);

    const [filter, setFilter] = useState("all");

    const filteredNotifications = filter === "all" 
        ? notifications 
        : filter === "unread" 
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.type === filter);

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? {...n, read: true} : n
        ));
    };

    const handleDelete = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="student-page">
            <div className="page-header">
                <h1><i className="fa fa-bell"></i> My Notifications</h1>
                {unreadCount > 0 && (
                    <button className="btn-secondary" onClick={handleMarkAllAsRead}>
                        <i className="fa fa-check-double"></i> Mark All as Read
                    </button>
                )}
            </div>

            <div className="notifications-filter">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    <span>All</span>
                    {notifications.length > 0 && <span className="count">{notifications.length}</span>}
                </button>
                <button 
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    <span>Unread</span>
                    {unreadCount > 0 && <span className="count unread">{unreadCount}</span>}
                </button>
                <button 
                    className={`filter-btn ${filter === 'attendance' ? 'active' : ''}`}
                    onClick={() => setFilter('attendance')}
                >
                    <span>Attendance</span>
                </button>
                <button 
                    className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
                    onClick={() => setFilter('success')}
                >
                    <span>Achievements</span>
                </button>
                <button 
                    className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
                    onClick={() => setFilter('info')}
                >
                    <span>Announcements</span>
                </button>
            </div>

            <div className="notifications-container">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-card ${notification.color} ${!notification.read ? 'unread' : ''}`}
                        >
                            <div className="notification-icon">
                                <i className={notification.icon}></i>
                            </div>
                            <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <small className="notification-date">
                                    <i className="fa fa-calendar"></i> {notification.date}
                                </small>
                            </div>
                            <div className="notification-actions">
                                {!notification.read && (
                                    <button 
                                        className="btn-icon"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        <i className="fa fa-envelope-open"></i>
                                    </button>
                                )}
                                <button 
                                    className="btn-icon"
                                    onClick={() => handleDelete(notification.id)}
                                    title="Delete"
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <i className="fa fa-bell-slash"></i>
                        <p>No notifications to display</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotifications;
