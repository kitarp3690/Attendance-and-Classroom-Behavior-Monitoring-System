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
  const [filterDepartment, setFilterDepartment] = useState('all');
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
  }, [filterDepartment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [semesterRes, departmentRes] = await Promise.all([
        semesterAPI.getAll({ page_size: 100 }),
        departmentAPI.getAll({ page_size: 100 })
      ]);
      
      let semesterData = semesterRes.data.results || semesterRes.data || [];
      
      // Filter by department if selected
      if (filterDepartment !== 'all') {
        semesterData = semesterData.filter(s => s.department === parseInt(filterDepartment));
      }
      
      setSemesters(semesterData);
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

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🗓️ Manage Semesters</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Semester
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter by Department */}
      <div className="page-section">
        <div className="filter-bar">
          <label>Filter by Department:</label>
          <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {semesters.length === 0 ? (
          <p className="empty-state">No semesters found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Academic Year</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map(semester => (
                  <tr key={semester.id}>
                    <td><strong>Semester {semester.number}</strong></td>
                    <td>{semester.department_name}</td>
                    <td>{semester.academic_year}</td>
                    <td>{new Date(semester.start_date).toLocaleDateString()}</td>
                    <td>{new Date(semester.end_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(semester.status)}`}>
                        {semester.status_display}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-sm btn-info"
                        onClick={() => handleEditSemester(semester)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => handleDeleteSemester(semester.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
