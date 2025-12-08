import React, { useState, useEffect } from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyTeacherData } from "../../utils/dummyData";
import StartEndSession from "./TeacherPages/StartEndSession";
import ViewEditAttendance from "./TeacherPages/ViewEditAttendance";
import AttendanceReports from "./TeacherPages/AttendanceReports";
import { sessionAPI, classAPI, subjectAPI, attendanceAPI } from "../../services/api";
import "./TeacherDashboard.css";

const TeacherDashboard = ({ currentPage = "dashboard" }) => {
    // Route pages based on currentPage
    if (currentPage === "start/end-class-session") return <StartEndSession />;
    if (currentPage === "view/edit-attendance") return <ViewEditAttendance />;
    if (currentPage === "attendance-reports") return <AttendanceReports />;

    // Default dashboard view
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [showStartModal, setShowStartModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for API data
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        classesToday: 0,
        pendingReviews: 0
    });
    const [activeSession, setActiveSession] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch classes
            const classesResponse = await classAPI.getAll();
            const classesData = classesResponse.data.results || [];
            setClasses(classesData);
            if (classesData.length > 0 && !selectedClass) {
                setSelectedClass(classesData[0].id.toString());
            }

            // Fetch subjects
            const subjectsResponse = await subjectAPI.getAll();
            const subjectsData = subjectsResponse.data.results || [];
            setSubjects(subjectsData);
            if (subjectsData.length > 0 && !selectedSubject) {
                setSelectedSubject(subjectsData[0].id.toString());
            }

            // Fetch attendance records
            const attendanceResponse = await attendanceAPI.getAll();
            setAttendanceRecords(attendanceResponse.data.results || []);

            // Fetch active session
            const sessionsResponse = await sessionAPI.getAll();
            const activeSessions = sessionsResponse.data.results?.filter(s => s.is_active) || [];
            if (activeSessions.length > 0) {
                setActiveSession(activeSessions[0]);
                setSessionActive(true);
            }

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = attendanceResponse.data.results?.filter(r => 
                r.marked_at?.startsWith(today)
            ) || [];
            
            setDashboardStats({
                totalStudents: classesData.reduce((sum, cls) => sum + (cls.student_count || 0), 0),
                presentToday: todayRecords.filter(r => r.status === 'present').length,
                classesToday: 5, // Hardcoded for now
                pendingReviews: todayRecords.filter(r => !r.verified).length
            });

        } catch (err) {
            console.error("Error fetching teacher dashboard data:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = async () => {
        try {
            const response = await sessionAPI.startSession({
                subject: parseInt(selectedSubject),
                class_assigned: parseInt(selectedClass)
            });
            setActiveSession(response.data);
            setSessionActive(true);
            setShowStartModal(false);
        } catch (err) {
            console.error("Error starting session:", err);
            alert("Failed to start session. Please try again.");
        }
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end this session?")) {
            try {
                if (activeSession?.id) {
                    await sessionAPI.endSession(activeSession.id);
                }
                setSessionActive(false);
                setActiveSession(null);
                fetchDashboardData();
            } catch (err) {
                console.error("Error ending session:", err);
                alert("Failed to end session. Please try again.");
            }
        }
    };

    const attendanceRate = dashboardStats.totalStudents > 0 
        ? ((dashboardStats.presentToday / dashboardStats.totalStudents) * 100).toFixed(1)
        : 0;

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
                        <h3>{loading ? "..." : dashboardStats.totalStudents}</h3>
                        <p>Total Students</p>
                        <span className="stat-detail">Across all classes</span>
                    </div>
                </div>

                <div className="teacher-stat-card success">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-user-check"></i>
                    </div>
                    <div>
                        <h3>{loading ? "..." : dashboardStats.presentToday}</h3>
                        <p>Present Today</p>
                        <span className="stat-detail">{attendanceRate}% attendance</span>
                    </div>
                </div>

                <div className="teacher-stat-card warning">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-book"></i>
                    </div>
                    <div>
                        <h3>{loading ? "..." : dashboardStats.classesToday}</h3>
                        <p>Classes Today</p>
                        <span className="stat-detail">Schedule based</span>
                    </div>
                </div>

                <div className="teacher-stat-card info">
                    <div className="stat-icon-wrapper">
                        <i className="fa fa-clipboard-list"></i>
                    </div>
                    <div>
                        <h3>{loading ? "..." : dashboardStats.pendingReviews}</h3>
                        <p>Pending Reviews</p>
                        <span className="stat-detail">Attendance to verify</span>
                    </div>
                </div>
            </div>

            <div className="session-control-panel">
                <div className="session-config">
                    <div className="config-group">
                        <label><i className="fa fa-door-open"></i> Class</label>
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={loading}>
                            {classes.length === 0 ? (
                                <option>No classes available</option>
                            ) : (
                                classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="config-group">
                        <label><i className="fa fa-book-open"></i> Subject</label>
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={loading}>
                            {subjects.length === 0 ? (
                                <option>No subjects available</option>
                            ) : (
                                subjects.map(subj => (
                                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                                ))
                            )}
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
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '40px'}}>Loading attendance records...</div>
                    ) : attendanceRecords.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px'}}>No attendance records found</div>
                    ) : (
                        <AttendanceTable
                            filterOptions={dummyTeacherData.filterOptions}
                            data={attendanceRecords}
                            role="teacher"
                        />
                    )}
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
                                <strong>{classes.find(c => c.id == selectedClass)?.name || "N/A"}</strong>
                            </div>
                            <div className="info-row">
                                <span>Subject:</span>
                                <strong>{subjects.find(s => s.id == selectedSubject)?.name || "N/A"}</strong>
                            </div>
                            <div className="info-row">
                                <span>Expected Students:</span>
                                <strong>{classes.find(c => c.id == selectedClass)?.student_count || "N/A"}</strong>
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