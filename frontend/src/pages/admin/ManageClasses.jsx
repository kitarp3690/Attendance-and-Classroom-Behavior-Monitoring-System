import React, { useState, useEffect } from 'react';
import { departmentAPI, userAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageClasses() {
  const [departments, setDepartments] = useState([]);
  const [hodUsers, setHodUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_email: '',
    hod: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const [deptRes, userRes] = await Promise.all([
        departmentAPI.getAll({ page_size: 200 }),
        userAPI.getAll({ page_size: 500 })
      ]);
      setDepartments(deptRes.data.results || deptRes.data || []);
      // HOD role users for assignment reference
      const allUsers = userRes.data.results || userRes.data || [];
      setHodUsers(allUsers.filter(u => u.role === 'hod'));
      setError(null);
    } catch (err) {
      setError('Error loading departments: ' + err.message);
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
      errors.name = 'Department name must be at least 2 characters';
    }
    
    if (!formData.code || formData.code.trim().length < 2) {
      errors.code = 'Department code must be at least 2 characters';
    }
    if (!formData.hod) {
      errors.hod = 'HOD is required';
    }
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = 'Enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDepartment = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.hod) delete payload.hod;

      if (editingDept) {
        await departmentAPI.update(editingDept.id, payload);
        alert('✓ Department updated successfully!');
      } else {
        await departmentAPI.create(payload);
        alert('✓ Department created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '', code: '', contact_email: '', hod: '' });
      setEditingDept(null);
      setValidationErrors({});
      await fetchDepartments();
    } catch (err) {
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.name?.[0]
        || err.response?.data?.code?.[0]
        || err.message;
      alert('❌ Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      contact_email: dept.contact_email || '',
      hod: dept.hod || ''
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (!window.confirm(`⚠️ Delete department "${deptName}"?\n\nThis action cannot be undone.`)) return;

    try {
      setLoading(true);
      await departmentAPI.delete(deptId);
      alert('✓ Department deleted successfully!');
      await fetchDepartments();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert('❌ Error deleting department: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
    setValidationErrors({});
    setFormData({ name: '', code: '', contact_email: '', hod: '' });
  };

  const getFilteredDepartments = () => {
    if (!searchQuery) return departments;
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) return <div className="loading-container"><p>⏳ Loading...</p></div>;

  const filteredDepartments = getFilteredDepartments();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🏫 Manage Departments</h1>
          <p className="subtitle">Manage all academic departments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Department
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Bar */}
      <div className="page-section">
        <div className="form-group">
          <label>🔍 Search Departments</label>
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
        <h2>Departments ({filteredDepartments.length})</h2>
        {filteredDepartments.length === 0 ? (
          <p className="empty-state">
            {searchQuery 
              ? 'No departments match your search' 
              : 'No departments found. Create your first department!'}
          </p>
        ) : (
          <div className="cards-grid">
            {filteredDepartments.map(dept => {
              const hodName = hodUsers.find(h => h.id === dept.hod);
              return (
              <div key={dept.id} className="grid-card">
                <div className="card-header">
                  <h3>{dept.name}</h3>
                  <span className="badge badge-info">{dept.code}</span>
                </div>
                <div className="card-body">
                  <p>{dept.contact_email || 'No contact email added'}</p>
                  <p><small>HOD: {hodName ? `${hodName.first_name} ${hodName.last_name}` : 'Not assigned'}</small></p>
                </div>
                <div className="card-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-sm btn-info"
                    onClick={() => handleEditDepartment(dept)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Department Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDept ? '✏️ Edit Department' : '➕ Add New Department'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Engineering"
                />
                {validationErrors.name && (
                  <small className="text-danger">⚠️ {validationErrors.name}</small>
                )}
              </div>
              <div className="form-group">
                <label>Department Code *</label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., COMP"
                />
                {validationErrors.code && (
                  <small className="text-danger">⚠️ {validationErrors.code}</small>
                )}
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  className="form-control"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="dept@example.com"
                />
                {validationErrors.contact_email && (
                  <small className="text-danger">⚠️ {validationErrors.contact_email}</small>
                )}
              </div>
              <div className="form-group">
                <label>Assign HOD *</label>
                <select
                  name="hod"
                  className="form-control"
                  value={formData.hod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select HOD --</option>
                  {hodUsers.map(hod => (
                    <option key={hod.id} value={hod.id}>
                      {hod.first_name} {hod.last_name} ({hod.username})
                    </option>
                  ))}
                </select>
                {validationErrors.hod && (
                  <small className="text-danger">⚠️ {validationErrors.hod}</small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleAddDepartment} disabled={loading}>
                {loading ? '⏳ Saving...' : (editingDept ? '✓ Update Department' : '✓ Create Department')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
