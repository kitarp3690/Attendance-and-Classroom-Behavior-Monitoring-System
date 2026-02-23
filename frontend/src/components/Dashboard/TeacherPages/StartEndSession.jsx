import React, { useState } from "react";
import "./TeacherPages.css";

const StartEndSession = () => {
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedClass, setSelectedClass] = useState("CSE A");
    const [selectedSubject, setSelectedSubject] = useState("Mathematics");
    const [sessionTime, setSessionTime] = useState(0);
    const [studentsPresent, setStudentsPresent] = useState(0);

    const classes = ["CSE A", "CSE B", "ECE A"];
    const subjects = ["Mathematics", "Physics", "Data Structures", "Digital Logic"];
    const students = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown"];

    React.useEffect(() => {
        if (!sessionActive) return;
        const interval = setInterval(() => {
            setSessionTime(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionActive]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleStartSession = () => {
        setSessionActive(true);
        setSessionTime(0);
        setStudentsPresent(0);
    };

    const handleEndSession = () => {
        setSessionActive(false);
        alert(`Session ended. ${studentsPresent} students marked present.`);
    };

    return (
        <div className="teacher-page">
            <div className="page-header">
                <h1><i className="fa fa-play"></i> Start/End Class Session</h1>
            </div>

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
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Select Subject</label>
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={sessionActive}
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
                            <button className="btn-success btn-large" onClick={handleStartSession}>
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
                            {students.map((student, idx) => (
                                <div key={idx} className="student-item">
                                    <div className="student-info">
                                        <div className="student-avatar">{student.charAt(0)}</div>
                                        <span className="student-name">{student}</span>
                                    </div>
                                    <div className="student-actions">
                                        <button 
                                            className="btn-mark present"
                                            onClick={() => setStudentsPresent(s => s + 1)}
                                        >
                                            <i className="fa fa-check"></i> Present
                                        </button>
                                        <button className="btn-mark absent">
                                            <i className="fa fa-times"></i> Absent
                                        </button>
                                        <button className="btn-mark late">
                                            <i className="fa fa-clock"></i> Late
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fa fa-info-circle"></i>
                            <p>Start a session to begin marking attendance</p>
                        </div>
                    )}
                    <div className="attendance-summary">
                        <span>Students Present: <strong>{studentsPresent}</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartEndSession;
