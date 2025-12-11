import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import './TeacherPages.css';

export default function ViewReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getAll({ page_size: 1000 });
      const data = res.data.results || res.data || [];
      
      // Process data for reports
      const processed = processReportData(data);
      setReports(processed);
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
    let csv = 'Student,Class,Present,Absent,Late,Total,Percentage\n';
    reports.forEach(r => {
      const percentage = r.total > 0 ? ((r.present + r.late * 0.5) / r.total * 100).toFixed(2) : 0;
      csv += `${r.student},${r.class},${r.present},${r.absent},${r.late},${r.total},${percentage}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="teacher-page">
      <div className="page-header">
        <h1>📊 Attendance Reports</h1>
        <button className="btn-primary" onClick={generateCSV}>
          📥 Download CSV
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        <div className="report-filters">
          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="byclass">By Class</option>
            </select>
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="empty-state">No attendance data available</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Total Sessions</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => {
                  const percentage = r.total > 0 
                    ? ((r.present + r.late * 0.5) / r.total * 100).toFixed(2)
                    : 0;
                  return (
                    <tr key={idx}>
                      <td><strong>{r.student}</strong></td>
                      <td>{r.class}</td>
                      <td className="text-success">{r.present}</td>
                      <td className="text-danger">{r.absent}</td>
                      <td className="text-warning">{r.late}</td>
                      <td>{r.total}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage}%
                          </div>
                        </div>
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
