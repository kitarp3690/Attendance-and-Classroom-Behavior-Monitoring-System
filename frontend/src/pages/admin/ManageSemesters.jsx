import React, { useState, useEffect } from 'react';
import { semesterAPI, departmentAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageSemesters() {
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  
  // Navigation state
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  const [formData, setFormData] = useState({
    number: 1,
    department: '',
    academic_year: '2024-2025',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [semesterRes, departmentRes] = await Promise.all([
        semesterAPI.getAll({ page_size: 500 }),
        departmentAPI.getAll({ page_size: 100 })
      ]);
      
      setSemesters(semesterRes.data.results || semesterRes.data || []);
      setDepartments(departmentRes.data.results || departmentRes.data || []);
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSemester = async () => {
    if (!formData.department || !formData.start_date || !formData.end_date) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingSemester) {
        await semesterAPI.update(editingSemester.id, formData);
        alert('Semester updated successfully!');
      } else {
        await semesterAPI.create(formData);
        alert('Semester created successfully!');
      }
      setShowModal(false);
      setFormData({
        number: 1,
        department: '',
        academic_year: '2024-2025',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      setEditingSemester(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setFormData({
      number: semester.number,
      department: semester.department,
      academic_year: semester.academic_year,
      start_date: semester.start_date,
      end_date: semester.end_date,
      status: semester.status
    });
    setShowModal(true);
  };

  const handleDeleteSemester = async (semesterId) => {
    if (!window.confirm('Delete this semester?')) return;

    try {
      await semesterAPI.delete(semesterId);
      fetchData();
      alert('Semester deleted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSemester(null);
    setFormData({
      number: 1,
      department: '',
      academic_year: '2024-2025',
      start_date: '',
      end_date: '',
      status: 'active'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'badge-success';
      case 'completed': return 'badge-secondary';
      case 'upcoming': return 'badge-info';
      default: return 'badge-default';
    }
  };
  
  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
  };
  
  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };
  
  const getDepartmentSemesters = () => {
    if (!selectedDepartment) return [];
    return semesters.filter(sem => sem.department === selectedDepartment.id);
  };

  if (loading) return <div className="loading-container"><p>⏳ Loading...</p></div>;

  const departmentSemesters = getDepartmentSemesters();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🗓️ Manage Semesters</h1>
          <p className="subtitle">Manage academic semesters by department</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Semester
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Navigation Breadcrumb */}
      {selectedDepartment && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-sm btn-secondary" 
            onClick={handleBackToDepartments}
            style={{ padding: '6px 12px' }}
          >
            🏠 All Departments
          </button>
          <span style={{ color: '#666' }}>›</span>
          <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{selectedDepartment.name}</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="page-section">
        {/* Show Departments Grid (Initial View) */}
        {!selectedDepartment && (
          <>
            <h2>Select Department</h2>
            <p className="subtitle">Choose a department to view and manage its semesters</p>
            <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {departments.map(dept => {
                const deptSemesters = semesters.filter(s => s.department === dept.id);
                const activeSems = deptSemesters.filter(s => s.status === 'active');
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
                        📚 {deptSemesters.length} Total Semesters
                      </p>
                      <p style={{ margin: '8px 0', color: '#28a745' }}>
                        ✓ {activeSems.length} Active
                      </p>
                      <p style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
                        Click to manage semesters →
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Show Semesters for Selected Department */}
        {selectedDepartment && (
          <>
            <h2>📚 {selectedDepartment.name} - Semesters ({departmentSemesters.length})</h2>
            {departmentSemesters.length === 0 ? (
              <p className="empty-state">No semesters found for this department. Create one!</p>
            ) : (
              <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {departmentSemesters
                  .sort((a, b) => a.number - b.number)
                  .map(semester => (
                    <div key={semester.id} className="grid-card">
                      <div className="card-header">
                        <h3 style={{ fontSize: '20px' }}>📖 Semester {semester.number}</h3>
                        <span className={`badge ${getStatusBadgeClass(semester.status)}`}>
                          {semester.status_display || semester.status}
                        </span>
                      </div>
                      <div className="card-body">
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          <strong>📅 Academic Year:</strong> {semester.academic_year}
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          <strong>📆 Start:</strong> {new Date(semester.start_date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          <strong>📆 End:</strong> {new Date(semester.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="card-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-sm btn-info"
                          onClick={() => handleEditSemester(semester)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleDeleteSemester(semester.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Semester Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSemester ? '✏️ Edit Semester' : '➕ Add New Semester'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Semester Number *</label>
                <select
                  name="number"
                    className="form-control"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                    className="form-control"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Academic Year *</label>
                <input
                  type="text"
                  name="academic_year"
                    className="form-control"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  placeholder="2024-2025"
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                    className="form-control"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="end_date"
                    className="form-control"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                    className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn-primary" onClick={handleAddSemester} disabled={loading}>
                  {loading ? '⏳ Saving...' : (editingSemester ? '✓ Update Semester' : '✓ Create Semester')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
