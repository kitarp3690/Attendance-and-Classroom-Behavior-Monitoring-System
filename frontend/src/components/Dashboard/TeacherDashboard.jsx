import React, { useState } from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyTeacherData } from "../../utils/dummyData";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedClass, setSelectedClass] = useState("Class A");
    const [selectedSubject, setSelectedSubject] = useState("Mathematics");
    const [showStartModal, setShowStartModal] = useState(false);

    const handleStartSession = () => {
        setSessionActive(true);
        setShowStartModal(false);
        // Simulate session timer
    };

    const handleEndSession = () => {
        if (window.confirm("Are you sure you want to end this session?")) {
            setSessionActive(false);
        }
    };

    const attendanceRate = ((dummyTeacherData.attendanceToday / dummyTeacherData.totalStudents) * 100).toFixed(1);

    return (
        <div className="teacher-dashboard">
            <div className="dashboard-welcome">
                <div className="welcome-content">
                    <h1><i className="fa fa-chalkboard-teacher"></i> Teacher Dashboard</h1>
                    <p>Manage your classes and track student attendance</p>
                </div>
                {sessionActive ? (
                    <div className="session-indicator active">
                        <div className="pulse-dot"></div>
                        <span>Session Active</span>
                        <span className="session-time">00:45:32</span>
                    </div>
                ) : (
                    <div className="session-indicator inactive">
                        <i className="fa fa-pause-circle"></i>
                        <span>No Active Session</span>
                    </div>
                )}
            </div>

            <div className="teacher-stats">
                <div className="teacher-stat-card primary">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-users"></i>
                    </div>
                    <div>
                        <h3>{dummyTeacherData.totalStudents}</h3>
                        <p>Total Students</p>
                        <span className="stat-detail">Across all classes</span>
                    </div>
                </div>

                <div className="teacher-stat-card success">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-user-check"></i>
                    </div>
                    <div>
                        <h3>{dummyTeacherData.attendanceToday}</h3>
                        <p>Present Today</p>
                        <span className="stat-detail">{attendanceRate}% attendance</span>
                    </div>
                </div>

                <div className="teacher-stat-card warning">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-book"></i>
                    </div>
                    <div>
                        <h3>5</h3>
                        <p>Classes Today</p>
                        <span className="stat-detail">3 completed, 2 pending</span>
                    </div>
                </div>

                <div className="teacher-stat-card info">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-clipboard-list"></i>
                    </div>
                    <div>
                        <h3>12</h3>
                        <p>Pending Reviews</p>
                        <span className="stat-detail">Attendance to verify</span>
                    </div>
                </div>
            </div>

            <div className="session-control-panel">
                <div className="session-config">
                    <div className="config-group">
                        <label><i className="fa fa-door-open"></i> Class</label>
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option>Class A</option>
                            <option>Class B</option>
                            <option>Class C</option>
                        </select>
                    </div>
                    <div className="config-group">
                        <label><i className="fa fa-book-open"></i> Subject</label>
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option>Mathematics</option>
                            <option>Physics</option>
                            <option>Chemistry</option>
                        </select>
                    </div>
                </div>

                {!sessionActive ? (
                    <button className="session-btn start-btn" onClick={() => setShowStartModal(true)}>
                        <i className="fa fa-play-circle"></i>
                        <span>Start Class Session</span>
                    </button>
                ) : (
                    <button className="session-btn end-btn" onClick={handleEndSession}>
                        <i className="fa fa-stop-circle"></i>
                        <span>End Class Session</span>
                    </button>
                )}
            </div>

            {sessionActive && (
                <div className="live-session-panel">
                    <div className="live-header">
                        <h3><i className="fa fa-video"></i> Live Session Monitoring</h3>
                        <span className="live-badge">LIVE</span>
                    </div>
                    <div className="live-stats">
                        <div className="live-stat">
                            <i className="fa fa-eye"></i>
                            <span>65 Students Detected</span>
                        </div>
                        <div className="live-stat">
                            <i className="fa fa-check-double"></i>
                            <span>58 Recognized</span>
                        </div>
                        <div className="live-stat">
                            <i className="fa fa-question-circle"></i>
                            <span>7 Unrecognized</span>
                        </div>
                    </div>
                    <div className="recognition-preview">
                        <div className="preview-placeholder">
                            <i className="fa fa-camera"></i>
                            <p>Camera feed would display here</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content-grid">
                <div className="content-section full">
                    <div className="section-title">
                        <h2><i className="fa fa-table"></i> Attendance Records</h2>
                        <button className="export-btn">
                            <i className="fa fa-file-excel"></i> Export
                        </button>
                    </div>
                    <AttendanceTable
                        filterOptions={dummyTeacherData.filterOptions}
                        data={dummyTeacherData.attendance}
                        role="teacher"
                    />
                </div>

                <div className="content-section">
                    <div className="section-title">
                        <h2><i className="fa fa-chart-line"></i> Attendance Trends</h2>
                    </div>
                    <AttendanceChart data={dummyTeacherData.charts} role="teacher" />
                </div>

                <div className="content-section">
                    <div className="section-title">
                        <h2><i className="fa fa-calendar-week"></i> Weekly Schedule</h2>
                    </div>
                    <div className="schedule-list">
                        <div className="schedule-item">
                            <div className="schedule-time">09:00 AM</div>
                            <div className="schedule-details">
                                <h4>Mathematics - Class A</h4>
                                <p>Room 101</p>
                            </div>
                        </div>
                        <div className="schedule-item">
                            <div className="schedule-time">11:00 AM</div>
                            <div className="schedule-details">
                                <h4>Physics - Class B</h4>
                                <p>Lab 201</p>
                            </div>
                        </div>
                        <div className="schedule-item active">
                            <div className="schedule-time">02:00 PM</div>
                            <div className="schedule-details">
                                <h4>Chemistry - Class A</h4>
                                <p>Lab 202</p>
                            </div>
                            <span className="now-badge">NOW</span>
                        </div>
                    </div>
                </div>
            </div>

            {showStartModal && (
                <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
                    <div className="start-session-modal" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fa fa-play-circle"></i> Start Class Session</h3>
                        <div className="modal-info">
                            <div className="info-row">
                                <span>Class:</span>
                                <strong>{selectedClass}</strong>
                            </div>
                            <div className="info-row">
                                <span>Subject:</span>
                                <strong>{selectedSubject}</strong>
                            </div>
                            <div className="info-row">
                                <span>Expected Students:</span>
                                <strong>70</strong>
                            </div>
                        </div>
                        <p className="modal-note">
                            <i className="fa fa-info-circle"></i>
                            Face recognition will start automatically. Make sure camera is connected.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn confirm" onClick={handleStartSession}>
                                <i className="fa fa-check"></i> Start Session
                            </button>
                            <button className="modal-btn cancel" onClick={() => setShowStartModal(false)}>
                                <i className="fa fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;