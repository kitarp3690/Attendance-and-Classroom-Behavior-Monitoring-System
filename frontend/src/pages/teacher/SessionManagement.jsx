import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, classAPI, subjectAPI, classStudentAPI, attendanceAPI } from '../../services/api';
import './TeacherPages.css';

export default function SessionManagement() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionRes, classRes, subjectRes] = await Promise.all([
        sessionAPI.getAll({ page_size: 100 }),
        classAPI.getAll({ page_size: 100 }),
        subjectAPI.getAll({ page_size: 100 })
      ]);
      setSessions(sessionRes.data.results || sessionRes.data || []);
      setClasses(classRes.data.results || classRes.data || []);
      setSubjects(subjectRes.data.results || subjectRes.data || []);
    } catch (err) {
      setError('Error loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedClass || !selectedSubject) {
      alert('Please select both class and subject');
      return;
    }

    try {
      await sessionAPI.startSession({
        class_assigned: selectedClass,
        subject: selectedSubject
      });
      setShowModal(false);
      setSelectedClass('');
      setSelectedSubject('');
      fetchData();
      alert('Session started successfully!');
    } catch (err) {
      alert('Error starting session: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('End this session?')) return;

    try {
      await sessionAPI.endSession(sessionId);
      fetchData();
      alert('Session ended successfully!');
    } catch (err) {
      alert('Error ending session: ' + err.message);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const activeSessions = sessions.filter(s => s.is_active);
  const pastSessions = sessions.filter(s => !s.is_active);

  return (
    <div className="teacher-page">
      <div className="page-header">
        <h1>📚 Session Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Start New Session
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Active Sessions */}
      <div className="page-section">
        <h2>🟢 Active Sessions ({activeSessions.length})</h2>
        {activeSessions.length === 0 ? (
          <p className="empty-state">No active sessions</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Started At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.class_name || 'N/A'}</td>
                    <td>{s.subject_name || 'N/A'}</td>
                    <td>{new Date(s.start_time).toLocaleString()}</td>
                    <td>
                      <button 
                        className="btn-sm btn-info"
                        onClick={() => navigate(`/teacher/mark-attendance/${s.id}`)}
                      >
                        Mark Attendance
                      </button>
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => handleEndSession(s.id)}
                      >
                        End Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="page-section">
        <h2>📋 Past Sessions ({pastSessions.length})</h2>
        {pastSessions.length === 0 ? (
          <p className="empty-state">No past sessions</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.slice(0, 20).map(s => {
                  const duration = s.end_time 
                    ? Math.floor((new Date(s.end_time) - new Date(s.start_time)) / 60000)
                    : 0;
                  return (
                    <tr key={s.id}>
                      <td>{s.class_name || 'N/A'}</td>
                      <td>{s.subject_name || 'N/A'}</td>
                      <td>{new Date(s.start_time).toLocaleString()}</td>
                      <td>{s.end_time ? new Date(s.end_time).toLocaleString() : 'N/A'}</td>
                      <td>{duration} minutes</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start New Session</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Class</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Subject</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStartSession}>Start Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
