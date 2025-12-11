import React, { useState, useEffect } from 'react';
import { subjectAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectAPI.getAll({ page_size: 100 });
      setSubjects(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading subjects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = async () => {
    if (!formData.name || !formData.code) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingSubject) {
        await subjectAPI.update(editingSubject.id, formData);
        alert('Subject updated successfully!');
      } else {
        await subjectAPI.create(formData);
        alert('Subject created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Delete this subject?')) return;

    try {
      await subjectAPI.delete(subjectId);
      fetchSubjects();
      alert('Subject deleted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({ name: '', code: '', description: '' });
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📚 Manage Subjects</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Subject
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        {subjects.length === 0 ? (
          <p className="empty-state">No subjects found</p>
        ) : (
          <div className="grid-container">
            {subjects.map(subject => (
              <div key={subject.id} className="card">
                <div className="card-header">
                  <h3>{subject.name}</h3>
                  <span className="badge badge-success">{subject.code}</span>
                </div>
                <div className="card-body">
                  <p>{subject.description || 'No description'}</p>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn-sm btn-info"
                    onClick={() => handleEditSubject(subject)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="form-group">
                <label>Subject Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., MATH101"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleAddSubject}>
                {editingSubject ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
