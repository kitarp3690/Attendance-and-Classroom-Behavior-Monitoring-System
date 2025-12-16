import React, { useState, useEffect } from 'react';
import { attendanceAPI, departmentAPI, semesterAPI, subjectAPI, userAPI } from '../../services/api';
import './AdminPages.css';

export default function ViewReports() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    department: 'all',
    semester: 'all',
    subject: 'all',
    teacher: 'all',
    student: 'all'
  });

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

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const stats = getStatistics();
  const filteredReports = getFilteredReports();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📊 Advanced Attendance Reports</h1>
          <p className="subtitle">Filter and analyze attendance across all departments</p>
        </div>
        <button className="btn-primary" onClick={generateCSV}>
          📥 Export CSV
        </button>
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
              <option value="all">All Departments</option>
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
              <option value="all">All Semesters</option>
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
              <option value="all">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Teacher</label>
            <select 
              className="form-control"
              value={filters.teacher} 
              onChange={e => handleFilterChange('teacher', e.target.value)}
            >
              <option value="all">All Teachers</option>
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
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-value">{stats.totalPresent}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats.totalAbsent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.totalLate}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{stats.totalRecords}</div>
          <div className="stat-label">Total Records</div>
        </div>
      </div>

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
