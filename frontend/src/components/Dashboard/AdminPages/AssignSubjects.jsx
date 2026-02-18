import React, { useState, useEffect } from "react";
import { teacherAssignmentAPI, userAPI, subjectAPI } from "../../../services/api";
import "./AdminPages.css";

const defaultAssignment = {
    teacher: "",
    subject: ""
};

const AssignSubjects = () => {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ ...defaultAssignment });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [assignRes, teacherRes, subjectRes] = await Promise.all([
                teacherAssignmentAPI.getAll({ page_size: 1000 }),
                userAPI.getAll({ role: 'teacher' }),
                subjectAPI.getAll({ page_size: 1000 })
            ]);
            setAssignments(assignRes.data.results || assignRes.data || []);
            setTeachers(teacherRes.data.results || teacherRes.data || []);
            setSubjects(subjectRes.data.results || subjectRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load assignment data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const search = searchTerm.toLowerCase();
        const teacherName = `${assignment.teacher?.first_name || ''} ${assignment.teacher?.last_name || ''}`.toLowerCase();
        const subjectName = (assignment.subject?.name || '').toLowerCase();
        return teacherName.includes(search) || subjectName.includes(search);
    });

    const handleAddAssignment = async () => {
        if (!(newAssignment.teacher && newAssignment.subject)) {
            setError("Please select both a teacher and subject.");
            return;
        }

        try {
            setLoading(true);
            await teacherAssignmentAPI.create(newAssignment);
            setNewAssignment({ ...defaultAssignment });
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            console.error("Error creating assignment:", err);
            setError("Failed to create assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;

        try {
            setLoading(true);
            await teacherAssignmentAPI.delete(id);
            fetchData();
        } catch (err) {
            console.error("Error deleting assignment:", err);
            setError("Failed to delete assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-random"></i> Assign Subjects to Teachers</h1>
                <button className="btn-primary" onClick={() => setShowAddModal(true)} disabled={loading}>
                    <i className="fa fa-plus"></i> New Assignment
                </button>
            </div>

            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Search by teacher or subject..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={loading}
                />
                <button
                    onClick={fetchData}
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

            <div className="assignments-table-wrapper">
                <table className="assignments-table">
                    <thead>
                        <tr>
                            <th>Teacher Name</th>
                            <th>Subject</th>
                            <th>Subject Code</th>
                            <th>Classes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && assignments.length === 0 ? (
                            <tr><td colSpan="5" className="empty-message">Loading...</td></tr>
                        ) : filteredAssignments.length > 0 ? (
                            filteredAssignments.map(assignment => (
                                <tr key={assignment.id}>
                                    <td>{`${assignment.teacher?.first_name || ''} ${assignment.teacher?.last_name || ''}`.trim() || 'Unknown'}</td>
                                    <td>{assignment.subject?.name || 'N/A'}</td>
                                    <td><strong>{assignment.subject?.code || 'N/A'}</strong></td>
                                    <td>{assignment.classes ? assignment.classes.length : 0}</td>
                                    <td>
                                        <button className="btn-icon btn-delete" onClick={() => handleDeleteAssignment(assignment.id)} title="Delete" disabled={loading}>
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="empty-message">No assignments found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-backdrop" onClick={() => { setShowAddModal(false); setNewAssignment({...defaultAssignment}); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Assignment</h2>
                            <button className="btn-close" onClick={() => { setShowAddModal(false); setNewAssignment({...defaultAssignment}); }}>✕</button>
                        </div>
                        <div className="modal-body">
                            <select 
                                value={newAssignment.teacher}
                                onChange={(e) => setNewAssignment({...newAssignment, teacher: e.target.value})}
                                className="modal-input"
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                            </select>
                            <select 
                                value={newAssignment.subject}
                                onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                                className="modal-input"
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => { setShowAddModal(false); setNewAssignment({...defaultAssignment}); }} disabled={loading}>Cancel</button>
                            <button className="btn-primary" onClick={handleAddAssignment} disabled={loading}>{loading ? 'Saving...' : 'Create Assignment'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignSubjects;
