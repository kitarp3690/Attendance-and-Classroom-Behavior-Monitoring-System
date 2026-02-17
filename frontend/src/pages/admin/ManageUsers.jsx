import React, { useState, useEffect } from 'react';
import { userAPI, departmentAPI, semesterAPI } from '../../services/api';
import './AdminPages.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    department: '',
    semester: '',
    phone: '',
    password: '',
    password_confirm: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes] = await Promise.all([
        userAPI.getAll({ page_size: 500 }),
        departmentAPI.getAll({ page_size: 100 })
      ]);
      setUsers(userRes.data.results || userRes.data || []);
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
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Handle cascading: when department changes, load semesters
    if (name === 'department' && value) {
      fetchSemestersByDepartment(value);
    }
    
    // Reset dependent fields when role changes
    if (name === 'role') {
      setFormData(prev => ({ 
        ...prev, 
        department: '', 
        semester: '',
        phone: prev.phone 
      }));
      setSemesters([]);
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
    
    // Role is required
    if (!formData.role) {
      errors.role = 'Please select a user role first';
    }
    
    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!formData.first_name || formData.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name || formData.last_name.trim().length === 0) {
      errors.last_name = 'Last name is required';
    }
    
    // Role-specific validation
    if (formData.role === 'hod' && !formData.department) {
      errors.department = 'Department is required for HOD';
    }
    
    if (formData.role === 'teacher' && !formData.department) {
      errors.department = 'Department is required for Teacher';
    }
    
    if (formData.role === 'student') {
      if (!formData.department) {
        errors.department = 'Department is required for Student';
      }
      if (!formData.semester) {
        errors.semester = 'Semester is required for Student';
      }
    }
    
    if (!editingUser) {
      if (!formData.password || formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (!formData.password_confirm) {
        errors.password_confirm = 'Please confirm the password';
      }
      if (formData.password && formData.password_confirm && formData.password !== formData.password_confirm) {
        errors.password_confirm = 'Passwords do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data - remove password if editing and empty
      const submitData = { ...formData };
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingUser) {
        await userAPI.update(editingUser.id, submitData);
        alert('✓ User updated successfully!');
      } else {
        await userAPI.create(submitData);
        alert('✓ User created successfully!');
      }
      
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: '',
        department: '',
        semester: '',
        phone: '',
        password: '',
        password_confirm: ''
      });
      setEditingUser(null);
      setValidationErrors({});
      setSemesters([]);
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.username?.[0]
        || err.response?.data?.email?.[0]
        || err.message;
      alert('❌ Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department || '',
      semester: user.semester || '',
      phone: user.phone || '',
      password: '',
      password_confirm: ''
    });
    setValidationErrors({});
    
    // Load semesters if user has department
    if (user.department) {
      fetchSemestersByDepartment(user.department);
    }
    
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`⚠️ Delete user "${username}"?\n\nThis action cannot be undone.`)) return;

    try {
      setLoading(true);
      await userAPI.delete(userId);
      alert('✓ User deleted successfully!');
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert('❌ Error deleting user: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setValidationErrors({});
    setSemesters([]);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      department: '',
      semester: '',
      phone: '',
      password: '',
      password_confirm: ''
    });
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  };

  if (loading) return <div className="loading-container"><p>⏳ Loading...</p></div>;

  const filteredUsers = getFilteredUsers();

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>👥 Manage Users</h1>
          <p className="subtitle">Create, edit, and manage all system users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search and Filter */}
      <div className="page-section">
        <div className="form-grid">
          <div className="form-group">
            <label>🔍 Search Users</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by username, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Filter by Role</label>
            <select 
              className="form-control"
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="hod">HOD</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      <div className="page-section">
        <h2>Users ({filteredUsers.length})</h2>
        {filteredUsers.length === 0 ? (
          <p className="empty-state">
            {searchQuery || filterRole !== 'all' 
              ? 'No users match your search criteria' 
              : 'No users found. Create your first user!'}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const dept = departments.find(d => d.id === user.department);
                  return (
                    <tr key={user.id}>
                      <td><strong>{user.username}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>
                        <span className={`badge badge-${user.role}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{dept ? dept.name : '-'}</td>
                      <td>{user.semester_display || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'success' : 'danger'}`}>
                          {user.is_active ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-sm btn-info"
                          onClick={() => handleEditUser(user)}
                          style={{ marginRight: '8px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                        >
                          🗑️ Delete
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

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Step 1: Select Role First */}
              <div className="form-group" style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <label style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Step 1: Select User Role *
                </label>
                <select 
                  name="role" 
                  className="form-control"
                  value={formData.role} 
                  onChange={handleInputChange}
                  disabled={editingUser ? true : false}
                  style={{ fontSize: '15px', padding: '10px' }}
                >
                  <option value="">-- Select User Role --</option>
                  <option value="student">👨‍🎓 Student</option>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="hod">👔 HOD (Head of Department)</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
                {validationErrors.role && (
                  <small className="text-danger">⚠️ {validationErrors.role}</small>
                )}
              </div>

              {/* Show rest of form only after role is selected */}
              {formData.role && (
                <>
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e7f3ff', borderLeft: '4px solid #0066cc', borderRadius: '4px' }}>
                    <strong>ℹ️ Adding: {formData.role === 'student' ? 'Student' : formData.role === 'teacher' ? 'Teacher' : formData.role === 'hod' ? 'HOD' : 'Admin'}</strong>
                  </div>

                  {/* Basic Information */}
                  <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                    Step 2: Basic Information
                  </h3>
                  
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username (min 3 characters)"
                      disabled={editingUser ? true : false}
                    />
                    {validationErrors.username && (
                      <small className="text-danger">⚠️ {validationErrors.username}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                    />
                    {validationErrors.email && (
                      <small className="text-danger">⚠️ {validationErrors.email}</small>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                      {validationErrors.first_name && (
                        <small className="text-danger">⚠️ {validationErrors.first_name}</small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                      {validationErrors.last_name && (
                        <small className="text-danger">⚠️ {validationErrors.last_name}</small>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9841234567"
                    />
                  </div>

                  {/* Role-Specific Fields */}
                  <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                    Step 3: {formData.role === 'student' ? 'Student Details' : formData.role === 'teacher' ? 'Teacher Assignment' : formData.role === 'hod' ? 'Department Assignment' : 'Admin Details'}
                  </h3>

                  {/* For HOD - Department Required */}
                  {formData.role === 'hod' && (
                    <div className="form-group">
                      <label>Assign to Department *</label>
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
                      <small className="form-text">HOD will manage this department only</small>
                      {validationErrors.department && (
                        <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.department}</small>
                      )}
                    </div>
                  )}

                  {/* For Teacher - Department Required */}
                  {formData.role === 'teacher' && (
                    <div className="form-group">
                      <label>Primary Department *</label>
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
                      <small className="form-text">Teacher can be assigned subjects across departments later</small>
                      {validationErrors.department && (
                        <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.department}</small>
                      )}
                    </div>
                  )}

                  {/* For Student - Department + Semester Required */}
                  {formData.role === 'student' && (
                    <>
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
                        {validationErrors.department && (
                          <small className="text-danger">⚠️ {validationErrors.department}</small>
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
                            <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                          ))}
                        </select>
                        <small className="form-text">
                          {!formData.department ? 'Select department first' : 'Student will be enrolled in this semester'}
                        </small>
                        {validationErrors.semester && (
                          <small className="text-danger" style={{ display: 'block' }}>⚠️ {validationErrors.semester}</small>
                        )}
                      </div>
                    </>
                  )}

                  {/* Password Field */}
                  <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                    Step 4: Set Password
                  </h3>

                  {!editingUser ? (
                    <>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password (min 8 characters)"
                        />
                        {validationErrors.password && (
                          <small className="text-danger">⚠️ {validationErrors.password}</small>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                          type="password"
                          name="password_confirm"
                          className="form-control"
                          value={formData.password_confirm}
                          onChange={handleInputChange}
                          placeholder="Confirm password"
                        />
                        {validationErrors.password_confirm && (
                          <small className="text-danger">⚠️ {validationErrors.password_confirm}</small>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password (optional, min 8 characters)"
                      />
                      {validationErrors.password && (
                        <small className="text-danger">⚠️ {validationErrors.password}</small>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleAddUser} disabled={loading}>
                {loading ? '⏳ Saving...' : (editingUser ? '✓ Update User' : '✓ Create User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
