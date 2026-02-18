import React, { useState, useEffect } from 'react';
import { departmentAPI, semesterAPI, subjectAPI, userAPI, teacherAssignmentAPI } from '../../services/api';
import './AdminPages.css';

export default function AssignTeachers() {
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchSemesters(selectedDept);
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects(selectedSemester);
    } else {
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedSemester]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments
      const deptRes = await departmentAPI.getAll({ page_size: 100 });
      setDepartments(deptRes.data.results || deptRes.data || []);

      // Fetch all teachers
      const userRes = await userAPI.getAll({ page_size: 100 });
      const userData = userRes.data.results || userRes.data || [];
      setTeachers(userData.filter(u => u.role === 'teacher'));

      // Fetch all assignments
      const assignRes = await teacherAssignmentAPI.getAll({ page_size: 1000 });
      setAssignments(assignRes.data.results || assignRes.data || []);

    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async (deptId) => {
    try {
      const res = await semesterAPI.getByDepartment(deptId);
      setSemesters(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setSemesters([]);
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await subjectAPI.getBySemester(semesterId);
      setSubjects(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedSubject || !selectedTeacher) {
      alert('Please select both subject and teacher');
      return;
    }

    try {
      await teacherAssignmentAPI.create({
        subject: selectedSubject,
        teacher: selectedTeacher
      });
      alert('Teacher assigned successfully!');
      setSelectedSubject('');
      setSelectedTeacher('');
      
      // Refresh assignments
      const assignRes = await teacherAssignmentAPI.getAll({ page_size: 1000 });
      setAssignments(assignRes.data.results || assignRes.data || []);
    } catch (err) {
      alert('Error assigning teacher: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Remove this teacher assignment?')) return;

    try {
      await teacherAssignmentAPI.delete(assignmentId);
      alert('Assignment removed successfully!');
      
      // Refresh assignments
      const assignRes = await teacherAssignmentAPI.getAll({ page_size: 1000 });
      setAssignments(assignRes.data.results || assignRes.data || []);
    } catch (err) {
      alert('Error removing assignment: ' + err.message);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>👨‍🏫 Assign Teachers to Subjects</h1>
          <p className="subtitle">Manage teacher-subject assignments across departments and semesters</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Assignment Form */}
      <div className="page-section">
        <h2>New Assignment</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>1. Select Department *</label>
            <select 
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">-- Choose Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} {dept.code ? `(${dept.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>2. Select Semester *</label>
            <select 
              className="form-control"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedDept}
            >
              <option value="">-- Choose Semester --</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.name}
                </option>
              ))}
            </select>
            {!selectedDept && <small className="text-muted">Select department first</small>}
          </div>

          <div className="form-group">
            <label>3. Select Subject *</label>
            <select 
              className="form-control"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedSemester}
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>
                  {subj.name} {subj.code ? `(${subj.code})` : ''}
                </option>
              ))}
            </select>
            {!selectedSemester && <small className="text-muted">Select semester first</small>}
          </div>

          <div className="form-group">
            <label>4. Select Teacher *</label>
            <select 
              className="form-control"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name} ({teacher.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn-primary" 
            onClick={handleAssignTeacher}
            disabled={!selectedSubject || !selectedTeacher}
          >
            ✓ Assign Teacher
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="page-section">
        <h2>Current Teacher Assignments ({assignments.length})</h2>
        
        {assignments.length === 0 ? (
          <div className="empty-state">
            <p>No teacher assignments found. Create assignments using the form above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Subject Code</th>
                  <th>Teacher</th>
                  <th>Teacher Email</th>
                  <th>Assigned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => {
                  const teacher = teachers.find(t => t.id === assignment.teacher);
                  const subject = [...subjects].find(s => s.id === assignment.subject);
                  
                  return (
                    <tr key={assignment.id}>
                      <td>
                        <strong>{subject?.name || `Subject #${assignment.subject}`}</strong>
                      </td>
                      <td>{subject?.code || '-'}</td>
                      <td>
                        <span className="badge badge-info">
                          {teacher ? `${teacher.first_name} ${teacher.last_name}` : `Teacher #${assignment.teacher}`}
                        </span>
                      </td>
                      <td>{teacher?.email || '-'}</td>
                      <td>
                        {assignment.assigned_date 
                          ? new Date(assignment.assigned_date).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td>
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          Remove
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

      {/* Available Teachers */}
      <div className="page-section">
        <h2>Available Teachers ({teachers.length})</h2>
        
        {teachers.length === 0 ? (
          <div className="empty-state">
            <p>No teacher users found. Please create users with Teacher role first.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {teachers.map(teacher => {
              const teacherAssignments = assignments.filter(a => a.teacher === teacher.id);
              
              return (
                <div className="grid-card" key={teacher.id}>
                  <div className="card-header">
                    <h3>{teacher.first_name} {teacher.last_name}</h3>
                    <span className="badge badge-primary">{teacher.username}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Email:</strong> {teacher.email}</p>
                    <p><strong>Subjects Assigned:</strong> 
                      <span className="badge badge-success ml-2">{teacherAssignments.length}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
