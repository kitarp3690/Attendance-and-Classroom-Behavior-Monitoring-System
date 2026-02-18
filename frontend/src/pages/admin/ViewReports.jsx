import React, { useState, useEffect } from 'react';
import { attendanceAPI, departmentAPI, semesterAPI, subjectAPI, userAPI, classAPI } from '../../services/api';
import './AdminPages.css';

export default function ViewReports() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    department: 'all',
    semester: 'all',
    subject: 'all',
    teacher: 'all',
    student: 'all',
    classId: 'all',
    startDate: '',
    endDate: ''
  });
  
  const [reportStats, setReportStats] = useState(null);
  const [studentSummary, setStudentSummary] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [attendanceRes, deptRes, userRes] = await Promise.all([
        attendanceAPI.getAll({ page_size: 1000 }),
        departmentAPI.getAll({ page_size: 100 }),
        userAPI.getAll({ page_size: 500 })
      ]);

      const attendanceData = attendanceRes.data.results || attendanceRes.data || [];
      setReports(attendanceData);
      
      setDepartments(deptRes.data.results || deptRes.data || []);
      
      const userData = userRes.data.results || userRes.data || [];
      setStudents(userData.filter(u => u.role === 'student'));
      setTeachers(userData.filter(u => u.role === 'teacher'));
      
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Cascade filters
    if (key === 'department' && value !== 'all') {
      try {
        const semRes = await semesterAPI.getByDepartment(value);
        setSemesters(semRes.data.results || semRes.data || []);
      } catch (err) {
        console.error('Error fetching semesters:', err);
      }
    }
    
    if (key === 'semester' && value !== 'all') {
      try {
        const subjRes = await subjectAPI.getBySemester(value);
        setSubjects(subjRes.data.results || subjRes.data || []);
        // Load classes for the selected department & semester (if backend supports filters)
        const classRes = await classAPI.getAll({ page_size: 200 });
        const allClasses = classRes.data.results || classRes.data || [];
        // Client-side filter: match department and semester names if available
        const filteredClasses = allClasses.filter(c => {
          if (filters.department !== 'all' && c.department !== parseInt(filters.department)) return false;
          return true;
        });
        setClasses(filteredClasses);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    }
  };

  const getFilteredReports = () => {
    return reports.filter(record => {
      if (filters.department !== 'all' && record.department !== parseInt(filters.department)) return false;
      if (filters.semester !== 'all' && record.semester !== parseInt(filters.semester)) return false;
      if (filters.subject !== 'all' && record.subject !== parseInt(filters.subject)) return false;
      if (filters.teacher !== 'all' && record.teacher !== parseInt(filters.teacher)) return false;
      if (filters.student !== 'all' && record.student !== parseInt(filters.student)) return false;
      return true;
    });
  };

  const getStatistics = () => {
    const filtered = getFilteredReports();
    return {
      totalPresent: filtered.filter(r => r.status === 'present').length,
      totalAbsent: filtered.filter(r => r.status === 'absent').length,
      totalLate: filtered.filter(r => r.status === 'late').length,
      totalRecords: filtered.length
    };
  };

  const generateCSV = () => {
    const filtered = getFilteredReports();
    let csv = 'Date,Student,Subject,Teacher,Status,Session,Department,Semester\n';
    
    filtered.forEach(r => {
      const date = r.session_date || r.date || '-';
      const student = r.student_name || '-';
      const subject = r.subject_name || '-';
      const teacher = r.teacher_name || '-';
      const status = r.status || '-';
      const session = r.session_id || '-';
      const dept = r.department_name || '-';
      const semester = r.semester_name || '-';
      
      csv += `${date},${student},${subject},${teacher},${status},${session},${dept},${semester}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Admin-specific report: Student attendance for a specific subject (subject belongs to selected semester)
  const generateStudentSubjectReport = async () => {
    try {
      setLoading(true);
      if (filters.subject === 'all') {
        alert('Please select a Subject under a Semester first');
        return;
      }
      const params = { page_size: 2000, session__subject: filters.subject };
      if (filters.student !== 'all') params.student = filters.student;
      if (filters.startDate) params.marked_at__gte = filters.startDate;
      if (filters.endDate) params.marked_at__lte = filters.endDate;
      
      // Fetch attendance records
      const res = await attendanceAPI.getAll(params);
      const data = res.data.results || res.data || [];
      setReports(data);
      
      // Fetch statistics
      const statsParams = { subject_id: filters.subject };
      if (filters.startDate) statsParams.start_date = filters.startDate;
      if (filters.endDate) statsParams.end_date = filters.endDate;
      const statsRes = await attendanceAPI.getStatistics(statsParams);
      setReportStats(statsRes.data);
      
      // Aggregate by student
      const byStudent = {};
      data.forEach(r => {
        const key = r.student || r.student_id;
        if (!byStudent[key]) {
          byStudent[key] = {
            student_name: r.student_name || 'Unknown',
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }
        byStudent[key].total++;
        if (r.status === 'present') byStudent[key].present++;
        else if (r.status === 'absent') byStudent[key].absent++;
        else if (r.status === 'late') byStudent[key].late++;
      });
      setStudentSummary(Object.values(byStudent));
    } catch (err) {
      setError('Error generating student-subject report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin-specific report: Attendance for a specific class (subject taught by teacher)
  const generateClassReport = async () => {
    try {
      setLoading(true);
      if (filters.classId === 'all') {
        alert('Please select a Class in filters');
        return;
      }
      const params = { page_size: 2000 };
      if (filters.startDate) params.marked_at__gte = filters.startDate;
      if (filters.endDate) params.marked_at__lte = filters.endDate;
      
      const res = await attendanceAPI.filterByClass(filters.classId, params);
      const data = res.data.results || res.data || [];
      setReports(data);
      
      // Fetch statistics
      const statsParams = { class_id: filters.classId };
      if (filters.startDate) statsParams.start_date = filters.startDate;
      if (filters.endDate) statsParams.end_date = filters.endDate;
      const statsRes = await attendanceAPI.getStatistics(statsParams);
      setReportStats(statsRes.data);
      
      // Aggregate by student
      const byStudent = {};
      data.forEach(r => {
        const key = r.student || r.student_id;
        if (!byStudent[key]) {
          byStudent[key] = {
            student_name: r.student_name || 'Unknown',
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }
        byStudent[key].total++;
        if (r.status === 'present') byStudent[key].present++;
        else if (r.status === 'absent') byStudent[key].absent++;
        else if (r.status === 'late') byStudent[key].late++;
      });
      setStudentSummary(Object.values(byStudent));
    } catch (err) {
      setError('Error generating class report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const stats = getStatistics();
  const filteredReports = getFilteredReports();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📊 Advanced Attendance Reports</h1>
          <p className="subtitle">Generate and analyze attendance reports by subject, semester, or class</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Multi-Level Filters */}
      <div className="page-section">
        <h2>Filters</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Department</label>
            <select 
              className="form-control"
              value={filters.department} 
              onChange={e => handleFilterChange('department', e.target.value)}
            >
              <option value="all">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester</label>
            <select 
              className="form-control"
              value={filters.semester} 
              onChange={e => handleFilterChange('semester', e.target.value)}
              disabled={filters.department === 'all'}
            >
              <option value="all">-- Select Semester --</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <select 
              className="form-control"
              value={filters.subject} 
              onChange={e => handleFilterChange('subject', e.target.value)}
              disabled={filters.semester === 'all'}
            >
              <option value="all">-- Select Subject --</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Class</label>
            <select
              className="form-control"
              value={filters.classId}
              onChange={e => setFilters(prev => ({ ...prev, classId: e.target.value }))}
            >
              <option value="all">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="Select start date"
            />
          </div>
          
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="Select end date"
            />
          </div>

          <div className="form-group">
            <label>Teacher</label>
            <select 
              className="form-control"
              value={filters.teacher} 
              onChange={e => handleFilterChange('teacher', e.target.value)}
            >
              <option value="all">-- Select Teacher --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Student</label>
            <select 
              className="form-control"
              value={filters.student} 
              onChange={e => handleFilterChange('student', e.target.value)}
            >
              <option value="all">-- Select Student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="page-section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={generateStudentSubjectReport}>
          Generate Student-Subject (Semester) Report
        </button>
        <button className="btn-secondary" onClick={generateClassReport}>
          Generate Class Attendance Report
        </button>
        <button className="btn-primary" onClick={generateCSV}>
          📥 Export Current View CSV
        </button>
      </div>

      {/* Statistics - Only show after report generation */}
      {(reportStats || studentSummary.length > 0) && (
        <div className="stats-grid">
          <div className="stat-card success">
            <div className="stat-value">{reportStats?.present || 0}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{reportStats?.absent || 0}</div>
            <div className="stat-label">Absent</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{reportStats?.late || 0}</div>
            <div className="stat-label">Late</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">{reportStats?.total || 0}</div>
            <div className="stat-label">Total Records</div>
            {reportStats?.percentage !== undefined && (
              <div style={{ fontSize: '14px', marginTop: '8px', color: '#666' }}>
                {reportStats.percentage}% Present
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Student-wise Summary */}
      {studentSummary.length > 0 && (
        <div className="page-section">
          <h2>Student-wise Summary</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Total Sessions</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {studentSummary.map((s, idx) => {
                  const percentage = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={idx}>
                      <td><strong>{s.student_name}</strong></td>
                      <td><span className="badge badge-success">{s.present}</span></td>
                      <td><span className="badge badge-danger">{s.absent}</span></td>
                      <td><span className="badge badge-warning">{s.late}</span></td>
                      <td>{s.total}</td>
                      <td>
                        <strong style={{ color: percentage < 75 ? 'red' : percentage >= 90 ? 'green' : 'inherit' }}>
                          {percentage}%
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="page-section">
        <h2>Attendance Records ({filteredReports.length})</h2>

        {filteredReports.length === 0 ? (
          <p className="empty-state">No attendance records match the selected filters</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((record, idx) => (
                  <tr key={idx}>
                    <td>{record.session_date || record.date || '-'}</td>
                    <td><strong>{record.student_name || '-'}</strong></td>
                    <td>{record.subject_name || '-'}</td>
                    <td>{record.teacher_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${record.status || 'unknown'}`}>
                        {record.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{record.department_name || '-'}</td>
                    <td>{record.semester_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
