import React, { useState, useEffect } from 'react';
import { subjectAPI, semesterAPI, departmentAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
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
      const [subjRes, semRes, deptRes] = await Promise.all([
        subjectAPI.getAll({ page_size: 500 }),
        semesterAPI.getAll({ page_size: 100 }),
        departmentAPI.getAll({ page_size: 100 })
      ]);
      setSubjects(subjRes.data.results || subjRes.data || []);
      setSemesters(semRes.data.results || semRes.data || []);
      setDepartments(deptRes.data.results || deptRes.data || []);
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
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Subject name must be at least 2 characters';
    }
    if (!formData.code || formData.code.trim().length < 2) {
      errors.code = 'Subject code must be at least 2 characters';
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
      setFormData({ name: '', code: '', semester: '', description: '', credits: 3 });
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
      semester: subject.semester || '',
      description: subject.description || '',
      credits: subject.credits || 3
    });
    setValidationErrors({});
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
    setFormData({ name: '', code: '', semester: '', description: '', credits: 3 });
  };

  const getFilteredSubjects = () => {
    if (!searchQuery) return subjects;
    return subjects.filter(subj => 
      subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

      <div className="page-section">
        <h2>Subjects ({filteredSubjects.length})</h2>
        {filteredSubjects.length === 0 ? (
          <p className="empty-state">
            {searchQuery ? 'No subjects match your search' : 'No subjects found. Create your first subject!'}
          </p>
        ) : (
          <div className="cards-grid">
            {filteredSubjects.map(subject => {
              const semester = semesters.find(s => s.id === subject.semester);
              return (
                <div key={subject.id} className="grid-card">
                  <div className="card-header">
                    <h3>{subject.name}</h3>
                    <span className="badge badge-success">{subject.code}</span>
                  </div>
                  <div className="card-body">
                    <p>{subject.description || 'No description available'}</p>
                    {semester && <p><small>📖 Semester {semester.number}</small></p>}
                    {subject.credits && <p><small>🎓 {subject.credits} Credits</small></p>}
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
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures"
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
                  placeholder="e.g., CS201"
                />
                {validationErrors.code && (
                  <small className="text-danger">⚠️ {validationErrors.code}</small>
                )}
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  className="form-control"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  <option value="">Select Semester (Optional)</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>
                      Semester {sem.number} - {sem.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input
                  type="number"
                  name="credits"
                  className="form-control"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter subject description..."
                  rows="4"
                />
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
