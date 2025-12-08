import React, { useState, useEffect } from "react";
import { userAPI, classAPI } from "../../../services/api";
import "./AdminPages.css";

const defaultUser = {
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "student",
    password: "",
    class_assigned: ""
};

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ ...defaultUser });

    useEffect(() => {
        fetchUsers();
        fetchClasses();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userAPI.getAll();
            setUsers(response.data.results || response.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await classAPI.getAll({ page_size: 1000 });
            setClasses(response.data.results || response.data || []);
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim().toLowerCase();
        const emailVal = (user.email || "").toLowerCase();
        const usernameVal = (user.username || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(search) || emailVal.includes(search) || usernameVal.includes(search);
        const matchesRole = roleFilter === "all" || (user.role || "").toLowerCase() === roleFilter;
        return matchesSearch && matchesRole;
    });

    const openAddModal = () => {
        setEditingUser(null);
        setNewUser({ ...defaultUser });
        setShowAddModal(true);
    };

    const handleAddUser = async () => {
        if (!(newUser.username && newUser.email && newUser.password)) {
            setError("Username, email, and password are required.");
            return;
        }

        try {
            setLoading(true);
            const userData = {
                ...newUser,
                class_assigned: newUser.role === 'student' && newUser.class_assigned
                    ? Number(newUser.class_assigned) : null
            };
            await userAPI.create(userData);
            setNewUser({ ...defaultUser });
            setShowAddModal(false);
            fetchUsers();
        } catch (err) {
            console.error("Error creating user:", err);
            setError("Failed to create user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setShowAddModal(true);
        setNewUser({
            username: user.username || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role || "student",
            password: "",
            class_assigned: user.class_assigned || ""
        });
    };

    const handleUpdateUser = async () => {
        try {
            setLoading(true);
            const userData = {
                ...newUser,
                class_assigned: newUser.role === 'student' && newUser.class_assigned
                    ? Number(newUser.class_assigned) : null
            };
            if (!newUser.password) {
                delete userData.password;
            }
            await userAPI.update(editingUser, userData);
            setEditingUser(null);
            setNewUser({ ...defaultUser });
            setShowAddModal(false);
            fetchUsers();
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Failed to update user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            setLoading(true);
            await userAPI.delete(userId);
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setNewUser({ ...defaultUser });
        setShowAddModal(false);
    };

    const getClassName = (classId) => {
        if (!classId) return '-';
        const match = classes.find(c => c.id === classId);
        return match ? match.name : 'N/A';
    };

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-users"></i> Manage Users</h1>
                <button className="btn-primary" onClick={openAddModal} disabled={loading}>
                    <i className="fa fa-plus"></i> Add User
                </button>
            </div>

            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={loading}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="filter-select"
                    disabled={loading}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>
                <button
                    onClick={fetchUsers}
                    className="btn-secondary"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Class</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && users.length === 0 ? (
                            <tr><td colSpan="8" className="empty-message">Loading users...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {(user.first_name || user.username || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <span>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}</span>
                                        </div>
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${(user.role || '').toLowerCase()}`}>
                                            {(user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1)}
                                        </span>
                                    </td>
                                    <td>{user.role === 'student' ? getClassName(user.class_assigned) : user.role === 'teacher' ? 'N/A' : '-'}</td>
                                    <td>{formatDate(user.date_joined)}</td>
                                    <td>
                                        <button
                                            className="btn-icon btn-edit"
                                            title="Edit"
                                            onClick={() => handleEditUser(user)}
                                            disabled={loading}
                                        >
                                            <i className="fa fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDeleteUser(user.id)}
                                            title="Delete"
                                            disabled={loading}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="8" className="empty-message">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {(showAddModal || editingUser) && (
                <div className="modal-backdrop" onClick={handleCancelEdit}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="btn-close" onClick={handleCancelEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    className="modal-input"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    className="modal-input"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newUser.first_name}
                                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                                    className="modal-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newUser.last_name}
                                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                                    className="modal-input"
                                />
                            </div>
                            <div className="form-row">
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    className="modal-input"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {newUser.role === 'student' && (
                                    <select
                                        value={newUser.class_assigned}
                                        onChange={(e) => setNewUser({...newUser, class_assigned: e.target.value})}
                                        className="modal-input"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <input
                                type="password"
                                placeholder={editingUser ? "New Password (leave empty to keep current)" : "Password"}
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                className="modal-input"
                                required={!editingUser}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={editingUser ? handleUpdateUser : handleAddUser}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
