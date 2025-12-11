import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, attendanceAPI, classStudentAPI } from '../../services/api';
import './TeacherPages.css';

export default function MarkAttendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await sessionAPI.getById(sessionId);
      setSession(sessionRes.data);

      const classId = sessionRes.data.class_assigned;
      const studentsRes = await classStudentAPI.getByClass(classId);
      const studentList = studentsRes.data.results || studentsRes.data || [];
      setStudents(studentList);

      // Load existing attendance
      const attendanceRes = await attendanceAPI.getBySession(sessionId);
      const existingAttendance = {};
      (attendanceRes.data.results || attendanceRes.data || []).forEach(record => {
        existingAttendance[record.student] = record.status;
      });
      setAttendance(existingAttendance);
    } catch (err) {
      setError('Error loading data: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Bulk save attendance
      for (const [studentId, status] of Object.entries(attendance)) {
        await attendanceAPI.create({
          session: sessionId,
          student: parseInt(studentId),
          status: status
        });
      }
      setSaved(true);
      alert('Attendance saved successfully!');
    } catch (err) {
      setError('Error saving attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const present = Object.values(attendance).filter(s => s === 'present').length;
  const absent = Object.values(attendance).filter(s => s === 'absent').length;
  const late = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div className="teacher-page">
      <div className="page-header">
        <div>
          <h1>✅ Mark Attendance</h1>
          {session && <p className="subtitle">{session.class_name} - {session.subject_name}</p>}
        </div>
        <button className="btn-secondary" onClick={() => navigate('/teacher/sessions')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {saved && <div className="alert alert-success">Attendance saved successfully!</div>}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card present">
          <div className="stat-value">{present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card late">
          <div className="stat-value">{late}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Attendance Marking */}
      <div className="page-section">
        <h2>Student Attendance</h2>
        {students.length === 0 ? (
          <p className="empty-state">No students in this class</p>
        ) : (
          <div className="attendance-grid">
            {students.map(student => (
              <div key={student.id} className="attendance-card">
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p className="student-id">ID: {student.enrollment_number}</p>
                </div>
                <div className="attendance-buttons">
                  <button
                    className={`btn-attendance ${attendance[student.id] === 'present' ? 'active' : ''}`}
                    onClick={() => handleAttendanceChange(student.id, 'present')}
                  >
                    ✓ Present
                  </button>
                  <button
                    className={`btn-attendance ${attendance[student.id] === 'absent' ? 'active' : ''}`}
                    onClick={() => handleAttendanceChange(student.id, 'absent')}
                  >
                    ✕ Absent
                  </button>
                  <button
                    className={`btn-attendance ${attendance[student.id] === 'late' ? 'active' : ''}`}
                    onClick={() => handleAttendanceChange(student.id, 'late')}
                  >
                    ⏱ Late
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="page-actions">
        <button className="btn-secondary" onClick={() => navigate('/teacher/sessions')}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          💾 Save Attendance
        </button>
      </div>
    </div>
  );
}
