import React, { useState, useEffect } from "react";
import { subjectAPI } from "../../../services/api";
import "./AdminPages.css";

const defaultSubject = {
    name: "",
    code: "",
    credits: 3,
    description: ""
};

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [newSubject, setNewSubject] = useState({ ...defaultSubject });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await subjectAPI.getAll({ page_size: 1000 });
            setSubjects(response.data.results || response.data || []);
        } catch (err) {
            console.error("Error fetching subjects:", err);
            setError("Failed to load subjects. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubjects = subjects.filter(subject => {
        const search = searchTerm.toLowerCase();
        return (subject.name || "").toLowerCase().includes(search) ||
               (subject.code || "").toLowerCase().includes(search);
    });

    const openAddModal = () => {
        setEditingSubject(null);
        setNewSubject({ ...defaultSubject });
        setShowAddModal(true);
    };

    const handleAddSubject = async () => {
        if (!(newSubject.name && newSubject.code)) {
            setError("Subject name and code are required.");
            return;
        }

        try {
            setLoading(true);
            await subjectAPI.create(newSubject);
            setNewSubject({ ...defaultSubject });
            setShowAddModal(false);
            fetchSubjects();
        } catch (err) {
            console.error("Error creating subject:", err);
            setError("Failed to create subject. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject.id);
        setShowAddModal(true);
        setNewSubject({
            name: subject.name || "",
            code: subject.code || "",
            credits: subject.credits || 3,
            description: subject.description || ""
        });
    };

    const handleUpdateSubject = async () => {
        try {
            setLoading(true);
            await subjectAPI.update(editingSubject, newSubject);
            setEditingSubject(null);
            setNewSubject({ ...defaultSubject });
            setShowAddModal(false);
            fetchSubjects();
        } catch (err) {
            console.error("Error updating subject:", err);
            setError("Failed to update subject. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;

        try {
            setLoading(true);
            await subjectAPI.delete(id);
            fetchSubjects();
        } catch (err) {
            console.error("Error deleting subject:", err);
            setError("Failed to delete subject. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingSubject(null);
        setNewSubject({ ...defaultSubject });
        setShowAddModal(false);
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-book"></i> Manage Subjects</h1>
                <button className="btn-primary" onClick={openAddModal} disabled={loading}>
                    <i className="fa fa-plus"></i> Add Subject
                </button>
            </div>

            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Search by name or code..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={loading}
                />
                <button
                    onClick={fetchSubjects}
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

            <div className="subjects-grid">
                {loading && subjects.length === 0 ? (
                    <div className="empty-message">Loading subjects...</div>
                ) : filteredSubjects.length > 0 ? (
                    filteredSubjects.map(subject => (
                        <div key={subject.id} className="subject-card">
                            <div className="subject-header">
                                <h3>{subject.name}</h3>
                                <span className="subject-code">{subject.code}</span>
                            </div>
                            <div className="subject-details">
                                <p><strong>Credits:</strong> {subject.credits || 'N/A'}</p>
                                <p><strong>Description:</strong> {subject.description || 'N/A'}</p>
                            </div>
                            <div className="subject-actions">
                                <button className="btn-icon btn-edit" title="Edit" onClick={() => handleEditSubject(subject)} disabled={loading}>
                                    <i className="fa fa-edit"></i>
                                </button>
                                <button className="btn-icon btn-delete" onClick={() => handleDeleteSubject(subject.id)} title="Delete" disabled={loading}>
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-message">No subjects found</div>
                )}
            </div>

            {(showAddModal || editingSubject) && (
                <div className="modal-backdrop" onClick={handleCancelEdit}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                            <button className="btn-close" onClick={handleCancelEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <input 
                                type="text" 
                                placeholder="Subject Name" 
                                value={newSubject.name}
                                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                                className="modal-input"
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Subject Code" 
                                value={newSubject.code}
                                onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                                className="modal-input"
                                required
                            />
                            <input 
                                type="number" 
                                placeholder="Credits" 
                                value={newSubject.credits}
                                onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value) || 3})}
                                className="modal-input"
                                min="1"
                                max="6"
                            />
                            <textarea
                                placeholder="Description"
                                value={newSubject.description}
                                onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                                className="modal-input"
                                rows="3"
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCancelEdit} disabled={loading}>Cancel</button>
                            <button className="btn-primary" onClick={editingSubject ? handleUpdateSubject : handleAddSubject} disabled={loading}>
                                {loading ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;
