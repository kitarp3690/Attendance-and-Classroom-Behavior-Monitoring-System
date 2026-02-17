import React, { useState, useEffect } from 'react';
import { subjectAPI, semesterAPI, departmentAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allSemesters, setAllSemesters] = useState([]); // For display in cards
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters for navigation
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    semester: '',
    description: '',
    credits: 3
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjRes, deptRes, semRes] = await Promise.all([
        subjectAPI.getAll({ page_size: 500 }),
        departmentAPI.getAll({ page_size: 100 }),
        semesterAPI.getAll({ page_size: 500 })
      ]);
      setSubjects(subjRes.data.results || subjRes.data || []);
      setDepartments(deptRes.data.results || deptRes.data || []);
      // Store all semesters for display in cards
      setAllSemesters(semRes.data.results || semRes.data || []);
      setError(null);
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Handle cascading: when department changes, load semesters and reset semester selection
    if (name === 'department') {
      setFormData(prev => ({ ...prev, semester: '' }));
      if (value) {
        fetchSemestersByDepartment(value);
      } else {
        setSemesters([]);
      }
    }
  };
  
  const fetchSemestersByDepartment = async (departmentId) => {
    try {
      const response = await semesterAPI.getByDepartment(departmentId);
      setSemesters(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setSemesters([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Subject name must be at least 2 characters';
    }
    if (!formData.code || formData.code.trim().length < 2) {
      errors.code = 'Subject code must be at least 2 characters';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.semester) {
      errors.semester = 'Semester is required';
    }
    if (!formData.credits || formData.credits < 1) {
      errors.credits = 'Credits must be at least 1';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubject = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (editingSubject) {
        await subjectAPI.update(editingSubject.id, formData);
        alert('✓ Subject updated successfully!');
      } else {
        await subjectAPI.create(formData);
        alert('✓ Subject created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '', code: '', department: '', semester: '', description: '', credits: 3 });
      setEditingSubject(null);
      setValidationErrors({});
      await fetchData();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      department: subject.department || '',
      semester: subject.semester || '',
      description: subject.description || '',
      credits: subject.credits || 3
    });
    setValidationErrors({});
    
    // Load semesters if subject has department
    if (subject.department) {
      fetchSemestersByDepartment(subject.department);
    }
    
    setShowModal(true);
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (!window.confirm(`⚠️ Delete subject "${subjectName}"?\n\nThis action cannot be undone.`)) return;
    try {
      setLoading(true);
      await subjectAPI.delete(subjectId);
      alert('✓ Subject deleted successfully!');
      await fetchData();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setValidationErrors({});
    setFormData({ name: '', code: '', department: '', semester: '', description: '', credits: 3 });
  };

  const getFilteredSubjects = () => {
    let filtered = subjects;
    
    // Filter by selected department and semester
    if (selectedDepartment) {
      filtered = filtered.filter(subj => subj.department === selectedDepartment.id);
    }
    if (selectedSemester) {
      filtered = filtered.filter(subj => subj.semester === selectedSemester.id);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(subj => 
        subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subj.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setSelectedSemester(null); // Reset semester when department changes
  };
  
  const handleSemesterClick = (sem) => {
    setSelectedSemester(sem);
  };
  
  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
    setSelectedSemester(null);
  };
  
  const handleBackToSemesters = () => {
    setSelectedSemester(null);
  };
  
  const getDepartmentSemesters = () => {
    if (!selectedDepartment) return [];
    return allSemesters.filter(sem => sem.department === selectedDepartment.id);
  };

  if (loading) return <div className="loading-container"><p>⏳ Loading...</p></div>;

  const filteredSubjects = getFilteredSubjects();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📚 Manage Subjects</h1>
          <p className="subtitle">Manage all academic subjects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Subject
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Navigation Breadcrumb */}
      {(selectedDepartment || selectedSemester) && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-sm btn-secondary" 
            onClick={handleBackToDepartments}
            style={{ padding: '6px 12px' }}
          >
            🏠 All Departments
          </button>
          {selectedDepartment && (
            <>
              <span style={{ color: '#666' }}>›</span>
              <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{selectedDepartment.name}</span>
            </>
          )}
          {selectedSemester && (
            <>
              <span style={{ color: '#666' }}>›</span>
              <button 
                className="btn-sm btn-secondary" 
                onClick={handleBackToSemesters}
                style={{ padding: '6px 12px' }}
              >
                📚 All Semesters
              </button>
              <span style={{ color: '#666' }}>›</span>
              <span style={{ fontWeight: 'bold', color: '#0066cc' }}>Semester {selectedSemester.number}</span>
            </>
          )}
        </div>
      )}

      {/* Search (only show when viewing subjects) */}
      {selectedSemester && (
        <div className="page-section">
          <div className="form-group">
            <label>🔍 Search Subjects</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="page-section">
        {/* Show Departments Grid (Initial View) */}
        {!selectedDepartment && (
          <>
            <h2>Select Department</h2>
            <p className="subtitle">Choose a department to view its semesters and subjects</p>
            <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {departments.map(dept => {
                const deptSubjects = subjects.filter(s => s.department === dept.id);
                const deptSemesters = allSemesters.filter(s => s.department === dept.id);
                return (
                  <div 
                    key={dept.id} 
                    className="grid-card" 
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #e0e0e0' }}
                    onClick={() => handleDepartmentClick(dept)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-header">
                      <h3 style={{ fontSize: '18px' }}>🏛️ {dept.name}</h3>
                      <span className="badge badge-primary">{dept.code}</span>
                    </div>
                    <div className="card-body">
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        📚 {deptSemesters.length} Semesters
                      </p>
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        📖 {deptSubjects.length} Subjects
                      </p>
                      <p style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
                        Click to view semesters →
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Show Semesters Grid (After Department Selected) */}
        {selectedDepartment && !selectedSemester && (
          <>
            <h2>📚 {selectedDepartment.name} - Semesters</h2>
            <p className="subtitle">Select a semester to view its subjects</p>
            <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {getDepartmentSemesters().map(sem => {
                const semSubjects = subjects.filter(s => s.semester === sem.id);
                return (
                  <div 
                    key={sem.id} 
                    className="grid-card" 
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid #e0e0e0' }}
                    onClick={() => handleSemesterClick(sem)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-header">
                      <h3 style={{ fontSize: '20px' }}>📖 Semester {sem.number}</h3>
                      <span className="badge badge-info">{sem.status}</span>
                    </div>
                    <div className="card-body">
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        📚 {semSubjects.length} Subject{semSubjects.length !== 1 ? 's' : ''}
                      </p>
                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#999' }}>
                        {sem.academic_year}
                      </p>
                      <p style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
                        Click to view subjects →
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Show Subjects Grid (After Semester Selected) */}
        {selectedSemester && (
          <>
            <h2>📖 Subjects - Semester {selectedSemester.number} ({filteredSubjects.length})</h2>
            <h2>📖 Subjects - Semester {selectedSemester.number} ({filteredSubjects.length})</h2>
            {filteredSubjects.length === 0 ? (
              <p className="empty-state">
                {searchQuery ? 'No subjects match your search' : 'No subjects found. Create your first subject!'}
              </p>
            ) : (
              <div className="cards-grid">
                {filteredSubjects.map(subject => {
                  const semester = allSemesters.find(s => s.id === subject.semester);
                  const department = departments.find(d => d.id === subject.department);
                  return (
                    <div key={subject.id} className="grid-card">
                      <div className="card-header">
                        <h3>{subject.name}</h3>
                        <span className="badge badge-success">{subject.code}</span>
                      </div>
                      <div className="card-body">
                        <p>{subject.description || 'No description available'}</p>
                        {department && <p><small>🏛️ {department.name}</small></p>}
                        {semester && <p><small>📖 Semester {semester.number}</small></p>}
                        {subject.credits && <p><small>🎓 {subject.credits} Credit{subject.credits > 1 ? 's' : ''}</small></p>}
                      </div>
                      <div className="card-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-sm btn-info"
                          onClick={() => handleEditSubject(subject)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleDeleteSubject(subject.id, subject.name)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? '✏️ Edit Subject' : '➕ Add New Subject'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Step-by-step guidance */}
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e7f3ff', borderLeft: '4px solid #0066cc', borderRadius: '4px' }}>
                <strong>ℹ️ Subject Information</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Fill in all required fields to create/update a subject</p>
              </div>

              {/* Basic Information */}
              <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                Basic Information
              </h3>

              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures and Algorithms"
                />
                {validationErrors.name && (
                  <small className="text-danger">⚠️ {validationErrors.name}</small>
                )}
              </div>

              <div className="form-group">
                <label>Subject Code *</label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., CS201 or COMP301"
                />
                {validationErrors.code && (
                  <small className="text-danger">⚠️ {validationErrors.code}</small>
                )}
              </div>

              {/* Assignment Information */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                Assignment Details
              </h3>

              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <small className="form-text">Select which department this subject belongs to</small>
                {validationErrors.department && (
                  <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.department}</small>
                )}
              </div>

              <div className="form-group">
                <label>Semester *</label>
                <select
                  name="semester"
                  className="form-control"
                  value={formData.semester}
                  onChange={handleInputChange}
                  disabled={!formData.department}
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>
                      Semester {sem.number}
                    </option>
                  ))}
                </select>
                <small className="form-text">
                  {!formData.department ? 'Select department first' : 'Select which semester this subject is taught in'}
                </small>
                {validationErrors.semester && (
                  <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.semester}</small>
                )}
              </div>

              <div className="form-group">
                <label>Credits *</label>
                <input
                  type="number"
                  name="credits"
                  className="form-control"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  placeholder="e.g., 3"
                />
                <small className="form-text">Credit hours for this subject (typically 1-6)</small>
                {validationErrors.credits && (
                  <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.credits}</small>
                )}
              </div>

              {/* Additional Details */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                Additional Details (Optional)
              </h3>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter subject description, course objectives, prerequisites, etc..."
                  rows="4"
                />
                <small className="form-text">Provide a brief description of the subject content and objectives</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleAddSubject} disabled={loading}>
                {loading ? '⏳ Saving...' : (editingSubject ? '✓ Update Subject' : '✓ Create Subject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
