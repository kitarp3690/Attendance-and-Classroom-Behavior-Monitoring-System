import React, { useState } from "react";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyStudentData } from "../../utils/dummyData";
import "./StudentDashboard.css";

const StudentDashboard = () => {
    const [subject, setSubject] = useState(dummyStudentData.subjects[0]);
    const [viewMode, setViewMode] = useState('calendar');
    
    const attendancePercentage = ((dummyStudentData.summary.present / dummyStudentData.summary.totalClasses) * 100).toFixed(1);
    const isLowAttendance = attendancePercentage < 75;

    return (
        <div className="student-dashboard">
            <div className="student-header">
                <div className="student-profile">
                    <div className="profile-avatar">
                        <i className="fa fa-user-graduate"></i>
                    </div>
                    <div className="profile-info">
                        <h1>John Doe</h1>
                        <p>Roll No: 2025001 | Class: Computer Science A</p>
                    </div>
                </div>
                <div className="attendance-badge-container">
                    <div className={`attendance-percentage-badge ${isLowAttendance ? 'low' : 'good'}`}>
                        <div className="percentage-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="circle-bg"/>
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    className="circle-progress"
                                    style={{strokeDashoffset: `${283 - (283 * attendancePercentage / 100)}`}}
                                />
                            </svg>
                            <div className="percentage-text">
                                <span className="number">{attendancePercentage}%</span>
                                <span className="label">Attendance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLowAttendance && (
                <div className="warning-alert">
                    <i className="fa fa-exclamation-triangle"></i>
                    <div>
                        <h4>Low Attendance Warning</h4>
                        <p>Your attendance is below 75%. Please maintain regular attendance to avoid academic penalties.</p>
                    </div>
                </div>
            )}

            <div className="student-stats-grid">
                <div className="student-stat-box present">
                    <div className="stat-icon"><i className="fa fa-check-circle"></i></div>
                    <div className="stat-content">
                        <h3>{dummyStudentData.summary.present}</h3>
                        <p>Classes Attended</p>
                    </div>
                </div>

                <div className="student-stat-box absent">
                    <div className="stat-icon"><i className="fa fa-times-circle"></i></div>
                    <div className="stat-content">
                        <h3>{dummyStudentData.summary.absent}</h3>
                        <p>Classes Missed</p>
                    </div>
                </div>

                <div className="student-stat-box late">
                    <div className="stat-icon"><i className="fa fa-clock"></i></div>
                    <div className="stat-content">
                        <h3>{dummyStudentData.summary.late}</h3>
                        <p>Late Arrivals</p>
                    </div>
                </div>

                <div className="student-stat-box total">
                    <div className="stat-icon"><i className="fa fa-calendar-check"></i></div>
                    <div className="stat-content">
                        <h3>{dummyStudentData.summary.totalClasses}</h3>
                        <p>Total Classes</p>
                    </div>
                </div>
            </div>

            <div className="subject-filter-section">
                <div className="filter-header">
                    <div className="filter-label">
                        <i className="fa fa-filter"></i>
                        <span>Filter by Subject:</span>
                    </div>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="subject-select">
                        <option value="all">All Subjects</option>
                        {dummyStudentData.subjects.map(subj => <option key={subj} value={subj}>{subj}</option>)}
                    </select>
                </div>
                <div className="view-mode-toggle">
                    <button 
                        className={viewMode === 'calendar' ? 'active' : ''} 
                        onClick={() => setViewMode('calendar')}
                    >
                        <i className="fa fa-calendar"></i> Calendar View
                    </button>
                    <button 
                        className={viewMode === 'list' ? 'active' : ''} 
                        onClick={() => setViewMode('list')}
                    >
                        <i className="fa fa-list"></i> List View
                    </button>
                </div>
            </div>

            <div className="attendance-sections">
                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-calendar-alt"></i> Attendance Calendar</h2>
                        <span className="month-label">November 2025</span>
                    </div>
                    <div className="attendance-calendar">
                        <div className="calendar-legend">
                            <span className="legend-item present">
                                <span className="dot"></span> Present
                            </span>
                            <span className="legend-item absent">
                                <span className="dot"></span> Absent
                            </span>
                            <span className="legend-item late">
                                <span className="dot"></span> Late
                            </span>
                        </div>
                        <div className="calendar-grid">
                            {dummyStudentData.detail.map((day, index) => (
                                <div 
                                    key={day.date} 
                                    className={`calendar-day ${day.status.toLowerCase()}`}
                                    title={`${day.date} - ${day.status}`}
                                >
                                    <span className="day-number">{index + 1}</span>
                                    <span className="day-status">
                                        {day.status === 'Present' && <i className="fa fa-check"></i>}
                                        {day.status === 'Absent' && <i className="fa fa-times"></i>}
                                        {day.status === 'Late' && <i className="fa fa-clock"></i>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="attendance-list">
                            {dummyStudentData.detail.map(day => (
                                <div key={day.date} className={`attendance-list-item ${day.status.toLowerCase()}`}>
                                    <div className="list-date">
                                        <i className="fa fa-calendar-day"></i>
                                        <span>{day.date}</span>
                                    </div>
                                    <div className={`list-status status-${day.status.toLowerCase()}`}>
                                        {day.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-chart-line"></i> Attendance Trends</h2>
                    </div>
                    <AttendanceChart data={dummyStudentData.charts} role="student" />
                    
                    <div className="insights-section">
                        <h3><i className="fa fa-lightbulb"></i> Insights</h3>
                        <div className="insight-item">
                            <i className="fa fa-trending-up"></i>
                            <p>Your attendance improved by 5% this month!</p>
                        </div>
                        <div className="insight-item">
                            <i className="fa fa-trophy"></i>
                            <p>You've maintained 100% attendance for Mathematics.</p>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-book-open"></i> Subject-wise Breakdown</h2>
                    </div>
                    <div className="subject-breakdown">
                        <div className="subject-row">
                            <div className="subject-name">
                                <i className="fa fa-calculator"></i>
                                <span>Mathematics</span>
                            </div>
                            <div className="subject-stats">
                                <span className="stat-value">45/50</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{width: '90%'}}></div>
                                </div>
                                <span className="percentage">90%</span>
                            </div>
                        </div>

                        <div className="subject-row">
                            <div className="subject-name">
                                <i className="fa fa-flask"></i>
                                <span>Physics</span>
                            </div>
                            <div className="subject-stats">
                                <span className="stat-value">38/50</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{width: '76%'}}></div>
                                </div>
                                <span className="percentage">76%</span>
                            </div>
                        </div>

                        <div className="subject-row">
                            <div className="subject-name">
                                <i className="fa fa-atom"></i>
                                <span>Chemistry</span>
                            </div>
                            <div className="subject-stats">
                                <span className="stat-value">42/50</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{width: '84%'}}></div>
                                </div>
                                <span className="percentage">84%</span>
                            </div>
                        </div>

                        <div className="subject-row">
                            <div className="subject-name">
                                <i className="fa fa-laptop-code"></i>
                                <span>Computer Science</span>
                            </div>
                            <div className="subject-stats">
                                <span className="stat-value">47/50</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{width: '94%'}}></div>
                                </div>
                                <span className="percentage">94%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-bell"></i> Recent Notifications</h2>
                    </div>
                    <div className="notifications-list">
                        <div className="notification-item new">
                            <div className="notif-icon"><i className="fa fa-check-circle"></i></div>
                            <div className="notif-content">
                                <h4>Attendance Marked</h4>
                                <p>Your attendance for Mathematics class has been marked as Present.</p>
                                <span className="notif-time">2 hours ago</span>
                            </div>
                        </div>

                        <div className="notification-item">
                            <div className="notif-icon"><i className="fa fa-exclamation-circle"></i></div>
                            <div className="notif-content">
                                <h4>Attendance Alert</h4>
                                <p>Your Physics attendance is below 75%. Please attend regularly.</p>
                                <span className="notif-time">1 day ago</span>
                            </div>
                        </div>

                        <div className="notification-item">
                            <div className="notif-icon"><i className="fa fa-calendar-plus"></i></div>
                            <div className="notif-content">
                                <h4>New Class Scheduled</h4>
                                <p>Extra class for Chemistry on Friday at 2:00 PM.</p>
                                <span className="notif-time">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;