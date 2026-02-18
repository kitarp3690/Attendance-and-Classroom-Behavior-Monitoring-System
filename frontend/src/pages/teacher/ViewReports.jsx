import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceAPI, sessionAPI, teacherAssignmentAPI } from '../../services/api';
import './TeacherPages.css';

export default function ViewReports() {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lowAttendanceThreshold, setLowAttendanceThreshold] = useState(75);

  useEffect(() => {
    if (user && user.id) {
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchReports();
    }
  }, [user, selectedSubject, startDate, endDate]);

  const fetchAssignments = async () => {
    try {
      const res = await teacherAssignmentAPI.getAll({ teacher: user.id, page_size: 100 });
      setAssignments(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { teacher: user.id, page_size: 1000 };
      if (selectedSubject !== 'all') {
        params.session__subject = selectedSubject;
      }
      if (startDate) {
        params.date_after = startDate;
      }
      if (endDate) {
        params.date_before = endDate;
      }
      
      const res = await attendanceAPI.getAll(params);
      const data = res.data.results || res.data || [];
      
      // Process data for reports
      const processed = processReportData(data);
      setReports(processed);
      setAttendance(data);
    } catch (err) {
      setError('Error loading reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data) => {
    const grouped = {};
    data.forEach(record => {
      const key = `${record.student_name}-${record.class_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          student: record.student_name,
          class: record.class_name,
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }
      grouped[key][record.status]++;
      grouped[key].total++;
    });
    return Object.values(grouped);
  };

  const generateCSV = () => {
    let csv = 'Student,Class,Subject,Present,Absent,Late,Total,Percentage\n';
    reports.forEach(r => {
      const percentage = r.total > 0 ? ((r.present + r.late * 0.5) / r.total * 100).toFixed(2) : 0;
      csv += `${r.student},${r.class},${r.subject || 'N/A'},${r.present},${r.absent},${r.late},${r.total},${percentage}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const lowAttendanceStudents = reports.filter(r => {
    const percentage = r.total > 0 ? ((r.present + r.late * 0.5) / r.total * 100) : 0;
    return percentage < lowAttendanceThreshold;
  });

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="teacher-page">
      <div className="page-header">
        <h1>📊 Attendance Reports</h1>
        <p className="subtitle">Only showing data for your assigned subjects</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        <div className="report-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Subject</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              {assignments.map(a => (
                <option key={a.subject} value={a.subject}>
                  {a.subject_name} - {a.class_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Low Attendance Alert (%)</label>
            <input 
              type="number" 
              value={lowAttendanceThreshold} 
              onChange={e => setLowAttendanceThreshold(parseInt(e.target.value))}
              min="0"
              max="100"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn-primary" onClick={generateCSV} disabled={reports.length === 0}>
            📥 Download CSV Report
          </button>
        </div>

        {/* Low Attendance Alert */}
        {lowAttendanceStudents.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
            <strong>⚠️ Low Attendance Alert:</strong> {lowAttendanceStudents.length} student(s) below {lowAttendanceThreshold}% attendance
          </div>
        )}

        {/* Summary Stats */}
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card blue">
            <div className="stat-content">
              <h3>{reports.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-content">
              <h3>{attendance.filter(a => a.status === 'present').length}</h3>
              <p>Total Present</p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-content">
              <h3>{attendance.filter(a => a.status === 'late').length}</h3>
              <p>Total Late</p>
            </div>
          </div>
          <div className="stat-card red">
            <div className="stat-content">
              <h3>{attendance.filter(a => a.status === 'absent').length}</h3>
              <p>Total Absent</p>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="empty-state">No attendance data for selected filters</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Absent</th>
                  <th>Total Sessions</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => {
                  const percentage = r.total > 0 ? ((r.present + r.late * 0.5) / r.total * 100).toFixed(1) : 0;
                  const isLow = percentage < lowAttendanceThreshold;
                  return (
                    <tr key={idx} style={{ backgroundColor: isLow ? '#fff3cd' : 'transparent' }}>
                      <td>{r.student}</td>
                      <td>{r.class}</td>
                      <td><span className="badge badge-present">{r.present}</span></td>
                      <td><span className="badge badge-late">{r.late}</span></td>
                      <td><span className="badge badge-absent">{r.absent}</span></td>
                      <td>{r.total}</td>
                      <td>
                        <strong style={{ color: isLow ? '#856404' : percentage >= 90 ? 'green' : 'inherit' }}>
                          {percentage}%
                        </strong>
                        {isLow && <span style={{ marginLeft: '5px' }}>⚠️</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
