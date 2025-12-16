import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { sessionAPI, teacherAssignmentAPI, attendanceAPI } from '../../services/api';
import './TeacherPages.css';

export default function SessionManagement() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [sessionTime, setSessionTime] = useState(new Date().toISOString().slice(0, 16));
  const [gracePeriod, setGracePeriod] = useState(15);
  const [cameraFeedId, setCameraFeedId] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch only teacher's sessions and assignments
      const [sessionRes, assignmentRes] = await Promise.all([
        sessionAPI.getAll({ teacher: user.id, page_size: 100 }),
        teacherAssignmentAPI.getAll({ teacher: user.id, page_size: 100 })
      ]);
      setSessions(sessionRes.data.results || sessionRes.data || []);
      setAssignments(assignmentRes.data.results || assignmentRes.data || []);
      setError(null);
    } catch (err) {
      setError('Error loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedAssignment) {
      setError('Please select a subject assignment');
      return;
    }

    const assignment = assignments.find(a => a.id === parseInt(selectedAssignment));
    if (!assignment) {
      setError('Invalid assignment selected');
      return;
    }

    try {
      setLoading(true);
      await sessionAPI.startSession({
        class_assigned: assignment.class_assigned,
        subject: assignment.subject,
        teacher: user.id,
        start_time: new Date(sessionTime).toISOString(),
        grace_period_minutes: gracePeriod,
        camera_feed_id: cameraFeedId || null, // For AI integration
      });
      setShowModal(false);
      setSelectedAssignment('');
      setSessionTime(new Date().toISOString().slice(0, 16));
      setGracePeriod(15);
      setCameraFeedId('');
      setSuccess('Session started successfully! AI camera feed ready.');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (err) {
      setError('Error starting session: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to end this session?')) return;

    try {
      setLoading(true);
      await sessionAPI.endSession(sessionId);
      setSuccess('Session ended successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (err) {
      setError('Error ending session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const activeSessions = sessions.filter(s => s.is_active);
  const pastSessions = sessions.filter(s => !s.is_active);

  return (
    <div className="teacher-page">
      <div className="page-header">
        <h1>📚 Session Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={loading}>
          + Start New Session
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        <strong>❌ Error:</strong> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>
        <strong>✅ Success:</strong> {success}
      </div>}

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
                  <th>Duration</th>
                  <th>Grace Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map(s => {
                  const now = new Date();
                  const startTime = new Date(s.start_time);
                  const durationMinutes = Math.floor((now - startTime) / 60000);
                  const gracePeriodEnd = new Date(startTime.getTime() + (s.grace_period_minutes || 15) * 60000);
                  const isGracePeriodActive = now < gracePeriodEnd;
                  
                  return (
                    <tr key={s.id}>
                      <td>{s.class_name || 'N/A'}</td>
                      <td>{s.subject_name || 'N/A'}</td>
                      <td>{startTime.toLocaleString()}</td>
                      <td>
                        <strong>{durationMinutes}</strong> min
                      </td>
                      <td>
                        <span style={{ 
                          backgroundColor: isGracePeriodActive ? '#fff3cd' : '#d4edda',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {isGracePeriodActive ? '⏱ Active' : '✓ Closed'} ({s.grace_period_minutes || 15} min)
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-sm btn-info"
                          onClick={() => navigate(`/teacher/mark-attendance/${s.id}`)}
                          disabled={loading}
                        >
                          Mark Attendance
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleEndSession(s.id)}
                          disabled={loading}
                        >
                          End Session
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              <h2>📅 Start New Session</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Subject Assignment <span style={{ color: 'red' }}>*</span></label>
                <select 
                  value={selectedAssignment} 
                  onChange={e => setSelectedAssignment(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Choose Assignment --</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.subject_name} - {a.class_name} ({a.semester_name})
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Only your assigned subjects are shown
                </small>
              </div>
              <div className="form-group">
                <label>Session Time</label>
                <input 
                  type="datetime-local" 
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Grace Period (minutes)</label>
                <input 
                  type="number" 
                  value={gracePeriod}
                  onChange={e => setGracePeriod(parseInt(e.target.value))}
                  min="5"
                  max="60"
                  disabled={loading}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Students can join during this period (AI face detection active)
                </small>
              </div>
              <div className="form-group">
                <label>AI Camera Feed ID (Optional)</label>
                <input 
                  type="text" 
                  value={cameraFeedId}
                  onChange={e => setCameraFeedId(e.target.value)}
                  placeholder="e.g., camera_01, rtsp://..."
                  disabled={loading}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Leave empty for manual attendance only
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleStartSession} disabled={loading}>
                {loading ? 'Starting...' : '▶️ Start Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
