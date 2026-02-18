import React, { useState, useEffect } from "react";
import { userAPI, classAPI, departmentAPI, attendanceAPI, authAPI } from "../../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminInfo, setAdminInfo] = useState({ name: "Loading...", email: "" });
    
    // Data
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    
    // UI State
    const [activeTab, setActiveTab] = useState("users");
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // Form Data
    const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "", role: "student", password: "" });
    const [departmentForm, setDepartmentForm] = useState({ name: "", code: "" });
    const [classForm, setClassForm] = useState({ name: "", semester: "", department: "" });
    
    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalDepartments: 0,
        averageAttendance: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch admin info
            const userResponse = await authAPI.getCurrentUser();
            setAdminInfo({
                name: `${userResponse.data.first_name} ${userResponse.data.last_name}`,
                email: userResponse.data.email
            });

            // Fetch all data
            const [usersRes, deptsRes, classesRes, attendanceRes] = await Promise.all([
                userAPI.getAll(),
                departmentAPI.getAll(),
                classAPI.getAll(),
                attendanceAPI.getAll()
            ]);

            const usersData = usersRes.data.results || [];
            const deptsData = deptsRes.data.results || [];
            const classesData = classesRes.data.results || [];
            const attendanceData = attendanceRes.data.results || [];

            setUsers(usersData);
            setDepartments(deptsData);
            setClasses(classesData);
            setAttendanceRecords(attendanceData);

            // Calculate stats
            const students = usersData.filter(u => u.role === 'student');
            const teachers = usersData.filter(u => u.role === 'teacher');
            const avgAttendance = attendanceData.length > 0
                ? ((attendanceData.filter(r => r.status === 'present').length / attendanceData.length) * 100).toFixed(1)
                : 0;

            setStats({
                totalUsers: usersData.length,
                totalStudents: students.length,
                totalTeachers: teachers.length,
                totalClasses: classesData.length,
                totalDepartments: deptsData.length,
                averageAttendance: avgAttendance
            });

        } catch (err) {
            console.error("Error fetching admin dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        try {
            if (!userForm.first_name || !userForm.email) {
                alert("Please fill in all required fields");
                return;
            }
            await userAPI.create(userForm);
            alert("User added successfully");
            setShowUserModal(false);
            setUserForm({ first_name: "", last_name: "", email: "", role: "student", password: "" });
            fetchDashboardData();
        } catch (err) {
            alert("Failed to add user");
        }
    };

    const handleAddDepartment = async () => {
        try {
            if (!departmentForm.name || !departmentForm.code) {
                alert("Please fill in all fields");
                return;
            }
            await departmentAPI.create(departmentForm);
            alert("Department added successfully");
            setShowDepartmentModal(false);
            setDepartmentForm({ name: "", code: "" });
            fetchDashboardData();
        } catch (err) {
            alert("Failed to add department");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await userAPI.delete(userId);
                alert("User deleted successfully");
                fetchDashboardData();
            } catch (err) {
                alert("Failed to delete user");
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    <div>
                        <h4>Error</h4>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="admin-avatar">
                            {adminInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="admin-info">
                            <h1>{adminInfo.name}</h1>
                            <p>{adminInfo.email}</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-btn btn-secondary" onClick={() => window.location.reload()}>
                            <i className="fa fa-sync-alt"></i> Refresh
                        </button>
                        <button className="header-btn btn-primary">
                            <i className="fa fa-download"></i> Export Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-users"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalUsers}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon students">
                            <i className="fa fa-user-graduate"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalStudents}</div>
                            <div className="stat-label">Students</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon teachers">
                            <i className="fa fa-chalkboard-teacher"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalTeachers}</div>
                            <div className="stat-label">Teachers</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-door-open"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalClasses}</div>
                            <div className="stat-label">Classes</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-building"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalDepartments}</div>
                            <div className="stat-label">Departments</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon attendance">
                            <i className="fa fa-chart-pie"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.averageAttendance}%</div>
                            <div className="stat-label">Avg Attendance</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <i className="fa fa-users"></i> Manage Users
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
                        onClick={() => setActiveTab("departments")}
                    >
                        <i className="fa fa-building"></i> Departments
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "classes" ? "active" : ""}`}
                        onClick={() => setActiveTab("classes")}
                    >
                        <i className="fa fa-door-open"></i> Classes
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
                        onClick={() => setActiveTab("attendance")}
                    >
                        <i className="fa fa-calendar-check"></i> Attendance
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-users"></i>
                                User Management
                            </h3>
                            <button className="btn-primary" onClick={() => setShowUserModal(true)}>
                                <i className="fa fa-user-plus"></i> Add User
                            </button>
                        </div>

                        {users.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No users found</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 15).map(user => (
                                            <tr key={user.id}>
                                                <td><strong>{user.first_name} {user.last_name}</strong></td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge role-${user.role}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="action-btn edit" title="Edit">
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        title="Delete"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Departments Tab */}
                {activeTab === "departments" && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-building"></i>
                                Department Management
                            </h3>
                            <button className="btn-primary" onClick={() => setShowDepartmentModal(true)}>
                                <i className="fa fa-plus"></i> Add Department
                            </button>
                        </div>

                        {departments.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No departments found</p>
                            </div>
                        ) : (
                            <div className="departments-grid">
                                {departments.map(dept => (
                                    <div key={dept.id} className="department-card">
                                        <div className="dept-header">
                                            <h4>{dept.name}</h4>
                                            <span className="dept-code">{dept.code}</span>
                                        </div>
                                        <div className="dept-actions">
                                            <button className="action-btn">Edit</button>
                                            <button className="action-btn">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Classes Tab */}
                {activeTab === "classes" && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-door-open"></i>
                                Class Management
                            </h3>
                            <button className="btn-primary" onClick={() => setShowClassModal(true)}>
                                <i className="fa fa-plus"></i> Add Class
                            </button>
                        </div>

                        {classes.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No classes found</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Class Name</th>
                                            <th>Semester</th>
                                            <th>Students</th>
                                            <th>Department</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map(cls => (
                                            <tr key={cls.id}>
                                                <td><strong>{cls.name}</strong></td>
                                                <td>{cls.semester || 'N/A'}</td>
                                                <td>{cls.students?.length || 0}</td>
                                                <td>{cls.department?.name || 'N/A'}</td>
                                                <td>
                                                    <button className="action-btn edit" title="Edit">
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button className="action-btn delete" title="Delete">
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === "attendance" && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-calendar-check"></i>
                                Attendance Records
                            </h3>
                        </div>

                        {attendanceRecords.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No attendance records found</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student</th>
                                            <th>Class</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords.slice(0, 15).map(record => (
                                            <tr key={record.id}>
                                                <td>{new Date(record.marked_at).toLocaleDateString()}</td>
                                                <td>{record.student?.first_name} {record.student?.last_name}</td>
                                                <td>{record.session?.class?.name || 'N/A'}</td>
                                                <td>
                                                    <span className={`status-badge status-${record.status}`}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New User</h3>
                            <button className="modal-close" onClick={() => setShowUserModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>First Name</label>
                                <input 
                                    type="text" 
                                    value={userForm.first_name}
                                    onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input 
                                    type="text"
                                    value={userForm.last_name}
                                    onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="hod">HOD</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowUserModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleAddUser}>
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Department Modal */}
            {showDepartmentModal && (
                <div className="modal-overlay" onClick={() => setShowDepartmentModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Department</h3>
                            <button className="modal-close" onClick={() => setShowDepartmentModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Department Name</label>
                                <input 
                                    type="text"
                                    value={departmentForm.name}
                                    onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Department Code</label>
                                <input 
                                    type="text"
                                    value={departmentForm.code}
                                    onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDepartmentModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleAddDepartment}>
                                Add Department
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;