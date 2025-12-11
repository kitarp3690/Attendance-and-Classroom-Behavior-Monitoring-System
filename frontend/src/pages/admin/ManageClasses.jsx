import React, { useState, useEffect } from 'react';
import { classAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classAPI.getAll({ page_size: 100 });
      setClasses(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading classes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClass = async () => {
    if (!formData.name || !formData.code) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingClass) {
        await classAPI.update(editingClass.id, formData);
        alert('Class updated successfully!');
      } else {
        await classAPI.create(formData);
        alert('Class created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingClass(null);
      fetchClasses();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      code: cls.code,
      description: cls.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class?')) return;

    try {
      await classAPI.delete(classId);
      fetchClasses();
      alert('Class deleted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ name: '', code: '', description: '' });
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🏫 Manage Classes</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Class
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        {classes.length === 0 ? (
          <p className="empty-state">No classes found</p>
        ) : (
          <div className="grid-container">
            {classes.map(cls => (
              <div key={cls.id} className="card">
                <div className="card-header">
                  <h3>{cls.name}</h3>
                  <span className="badge badge-info">{cls.code}</span>
                </div>
                <div className="card-body">
                  <p>{cls.description || 'No description'}</p>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn-sm btn-info"
                    onClick={() => handleEditClass(cls)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => handleDeleteClass(cls.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Class Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Class 10-A"
                />
              </div>
              <div className="form-group">
                <label>Class Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., 10A"
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
              <button className="btn-primary" onClick={handleAddClass}>
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
