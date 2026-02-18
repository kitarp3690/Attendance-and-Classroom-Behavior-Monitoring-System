import React, { useState, useEffect } from 'react';
import { departmentAPI, userAPI } from '../../services/api';
import './AdminPages.css';

export default function AssignHOD() {
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedHOD, setSelectedHOD] = useState('');
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments
      const deptRes = await departmentAPI.getAll({ page_size: 100 });
      const deptData = deptRes.data.results || deptRes.data || [];
      setDepartments(deptData);

      // Fetch all HODs (users with role='hod')
      const userRes = await userAPI.getAll({ page_size: 100 });
      const userData = userRes.data.results || userRes.data || [];
      const hodUsers = userData.filter(u => u.role === 'hod');
      setHods(hodUsers);

      // Build assignment map (department -> current HOD)
      const assignmentMap = {};
      deptData.forEach(dept => {
        if (dept.hod) {
          assignmentMap[dept.id] = dept.hod;
        }
      });
      setAssignments(assignmentMap);

    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHOD = async () => {
    if (!selectedDept || !selectedHOD) {
      alert('Please select both department and HOD');
      return;
    }

    try {
      // Update department with HOD assignment
      await departmentAPI.update(selectedDept, { hod: selectedHOD });
      alert('HOD assigned successfully!');
      setSelectedDept('');
      setSelectedHOD('');
      fetchData();
    } catch (err) {
      alert('Error assigning HOD: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveHOD = async (deptId) => {
    if (!window.confirm('Remove HOD from this department?')) return;

    try {
      await departmentAPI.update(deptId, { hod: null });
      alert('HOD removed successfully!');
      fetchData();
    } catch (err) {
      alert('Error removing HOD: ' + err.message);
    }
  };

  const getHODName = (hodId) => {
    const hod = hods.find(h => h.id === hodId);
    return hod ? `${hod.first_name} ${hod.last_name} (${hod.username})` : 'Unknown';
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === parseInt(deptId));
    return dept ? dept.name : '';
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>👤 Assign HOD to Department</h1>
          <p className="subtitle">Assign Head of Department to manage each department</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Assignment Form */}
      <div className="page-section">
        <h2>New Assignment</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Select Department *</label>
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
            <label>Select HOD User *</label>
            <select 
              className="form-control"
              value={selectedHOD}
              onChange={(e) => setSelectedHOD(e.target.value)}
            >
              <option value="">-- Choose HOD --</option>
              {hods.map(hod => (
                <option key={hod.id} value={hod.id}>
                  {hod.first_name} {hod.last_name} ({hod.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={handleAssignHOD}>
            ✓ Assign HOD
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="page-section">
        <h2>Current HOD Assignments</h2>
        
        {departments.length === 0 ? (
          <div className="empty-state">
            <p>No departments found. Please create departments first.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Current HOD</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>
                      <strong>{dept.name}</strong>
                    </td>
                    <td>{dept.code || '-'}</td>
                    <td>
                      {dept.hod ? (
                        <span className="badge badge-info">
                          {getHODName(dept.hod)}
                        </span>
                      ) : (
                        <span className="text-muted">Not assigned</span>
                      )}
                    </td>
                    <td>
                      {dept.hod ? (
                        <span className="status-badge success">Assigned</span>
                      ) : (
                        <span className="status-badge warning">Vacant</span>
                      )}
                    </td>
                    <td>
                      {dept.hod && (
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => handleRemoveHOD(dept.id)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available HODs */}
      <div className="page-section">
        <h2>Available HOD Users ({hods.length})</h2>
        
        {hods.length === 0 ? (
          <div className="empty-state">
            <p>No HOD users found. Please create users with HOD role first.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {hods.map(hod => {
              const assignedDept = departments.find(d => d.hod === hod.id);
              return (
                <div className="grid-card" key={hod.id}>
                  <div className="card-header">
                    <h3>{hod.first_name} {hod.last_name}</h3>
                    <span className="badge badge-primary">{hod.username}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Email:</strong> {hod.email}</p>
                    <p><strong>Status:</strong> 
                      {assignedDept ? (
                        <span className="text-success"> Assigned to {assignedDept.name}</span>
                      ) : (
                        <span className="text-warning"> Not assigned</span>
                      )}
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
