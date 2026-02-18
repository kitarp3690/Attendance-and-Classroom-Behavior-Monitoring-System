import React, { useState, useEffect } from "react";
import { sessionAPI, classAPI, subjectAPI, classStudentAPI, attendanceAPI } from "../../../services/api";
import "./TeacherPages.css";

const StartEndSession = () => {
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [sessionTime, setSessionTime] = useState(0);
    const [studentsPresent, setStudentsPresent] = useState(0);
    const [currentSession, setCurrentSession] = useState(null);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!sessionActive) return;
        const interval = setInterval(() => {
            setSessionTime(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionActive]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [classesRes, subjectsRes] = await Promise.all([
                classAPI.getAll({ page_size: 100 }),
                subjectAPI.getAll({ page_size: 100 })
            ]);
            setClasses(classesRes.data.results || classesRes.data || []);
            setSubjects(subjectsRes.data.results || subjectsRes.data || []);
            if (classesRes.data.results?.length > 0) {
                setSelectedClass(classesRes.data.results[0].id);
            }
            if (subjectsRes.data.results?.length > 0) {
                setSelectedSubject(subjectsRes.data.results[0].id);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load classes and subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass);
        }
    }, [selectedClass]);

    const fetchStudents = async (classId) => {
        try {
            const response = await classStudentAPI.getAll({ class_assigned: classId, page_size: 100 });
            const studentList = response.data.results || response.data || [];
            setStudents(studentList);
            const attendanceMap = {};
            studentList.forEach(student => {
                attendanceMap[student.id] = false;
            });
            setStudentAttendance(attendanceMap);
            setStudentsPresent(0);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleStartSession = async () => {
        try {
            const response = await sessionAPI.startSession({
                class_assigned: selectedClass,
                subject: selectedSubject,
                start_time: new Date().toISOString()
            });
            setCurrentSession(response.data);
            setSessionActive(true);
            setSessionTime(0);
            setStudentsPresent(0);
        } catch (err) {
            console.error('Error starting session:', err);
            alert('Failed to start session');
        }
    };

    const handleEndSession = async () => {
        try {
            if (currentSession) {
                await sessionAPI.endSession(currentSession.id);
            }
            
            // Mark attendance for all present students
            const attendanceRecords = Object.entries(studentAttendance)
                .filter(([_, isPresent]) => isPresent)
                .map(([studentId, _]) => ({
                    student: studentId,
                    session: currentSession?.id,
                    status: 'present'
                }));

            if (attendanceRecords.length > 0) {
                await attendanceAPI.markMultiple({ records: attendanceRecords });
            }

            setSessionActive(false);
            setCurrentSession(null);
            alert(`Session ended. ${studentsPresent} students marked present.`);
            fetchStudents(selectedClass);
        } catch (err) {
            console.error('Error ending session:', err);
            alert('Error ending session');
        }
    };

    const handleToggleAttendance = (studentId) => {
        setStudentAttendance(prev => {
            const newState = { ...prev, [studentId]: !prev[studentId] };
            const newCount = Object.values(newState).filter(Boolean).length;
            setStudentsPresent(newCount);
            return newState;
        });
    };

    if (loading) {
        return (
            <div className="teacher-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading classes and subjects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-page">
            <div className="page-header">
                <h1><i className="fa fa-play"></i> Start/End Class Session</h1>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <div className="session-container">
                <div className="session-control">
                    <h2>Session Control</h2>
                    
                    <div className="control-group">
                        <label>Select Class</label>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={sessionActive}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Select Subject</label>
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={sessionActive}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="session-display">
                        <div className={`session-status ${sessionActive ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            <span>{sessionActive ? 'Session Active' : 'Session Inactive'}</span>
                        </div>
                        <div className="session-timer">{formatTime(sessionTime)}</div>
                    </div>

                    <div className="control-buttons">
                        {!sessionActive ? (
                            <button className="btn-success btn-large" onClick={handleStartSession} disabled={!selectedClass || !selectedSubject}>
                                <i className="fa fa-play"></i> Start Session
                            </button>
                        ) : (
                            <button className="btn-danger btn-large" onClick={handleEndSession}>
                                <i className="fa fa-stop"></i> End Session
                            </button>
                        )}
                    </div>
                </div>

                <div className="attendance-marking">
                    <h2>Mark Attendance</h2>
                    {sessionActive ? (
                        <div className="students-list">
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <div key={student.id} className="student-item">
                                        <div className="student-info">
                                            <div className="student-avatar">{student.student?.first_name?.charAt(0) || '?'}</div>
                                            <div>
                                                <span className="student-name">{student.student?.first_name} {student.student?.last_name}</span>
                                                <span className="student-roll">{student.student?.student_id}</span>
                                            </div>
                                        </div>
                                        <div className="student-actions">
                                            <button 
                                                className={`btn-attendance ${studentAttendance[student.id] ? 'present-active' : 'present'}`}
                                                onClick={() => handleToggleAttendance(student.id)}
                                            >
                                                <i className="fa fa-check"></i> {studentAttendance[student.id] ? 'Present' : 'Mark'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fa fa-info-circle"></i>
                                    <p>No students in this class</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fa fa-info-circle"></i>
                            <p>Start a session to begin marking attendance</p>
                        </div>
                    )}
                    <div className="attendance-summary">
                        <span>Students Present: <strong>{studentsPresent}</strong> / {students.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartEndSession;
