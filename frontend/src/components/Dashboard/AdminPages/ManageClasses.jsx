import React, { useState, useEffect } from 'react';
import { classAPI, subjectAPI, classStudentAPI } from '../../../services/api';
import './AdminPages.css';

const ManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'manage_students'
    const [selectedClass, setSelectedClass] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', section: '', strength: '' });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSection, setFilterSection] = useState('all');

    useEffect(() => {
        fetchClasses();
        fetchSubjects();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await classAPI.getAll({ page_size: 1000 });
            setClasses(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await subjectAPI.getAll({ page_size: 1000 });
            setSubjects(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleCreateClick = () => {
        setModalType('create');
        setSelectedClass(null);
        setFormData({ name: '', description: '', section: '', strength: '' });
        setShowModal(true);
    };

    const handleEditClick = (classItem) => {
        setModalType('edit');
        setSelectedClass(classItem);
        setFormData({
            name: classItem.name,
            description: classItem.description || '',
            section: classItem.section || '',
            strength: classItem.strength || ''
        });
        setShowModal(true);
    };

    const handleManageStudents = (classItem) => {
        setModalType('manage_students');
        setSelectedClass(classItem);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'create') {
                await classAPI.create(formData);
                alert('Class created successfully');
            } else if (modalType === 'edit') {
                await classAPI.update(selectedClass.id, formData);
                alert('Class updated successfully');
            }
            fetchClasses();
            setShowModal(false);
        } catch (err) {
            console.error('Error:', err);
            alert('Failed to save class');
        }
    };

    const handleDelete = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await classAPI.delete(classId);
                alert('Class deleted successfully');
                fetchClasses();
            } catch (err) {
                console.error('Error:', err);
                alert('Failed to delete class');
            }
        }
    };

    const filteredClasses = classes.filter(classItem => {
        const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.section?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSection = filterSection === 'all' || classItem.section === filterSection;
        return matchesSearch && matchesSection;
    });

    const uniqueSections = [...new Set(classes.map(c => c.section).filter(Boolean))];

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><i className="fa fa-graduation-cap"></i> Manage Classes</h1>
                <p>Create, edit, and manage classes in your institution</p>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    <div>{error}</div>
                </div>
            )}

            {/* Controls */}
            <div className="controls-section">
                <div className="search-box">
                    <i className="fa fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by class name or section..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select 
                    className="filter-select"
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                >
                    <option value="all">All Sections</option>
                    {uniqueSections.map(section => (
                        <option key={section} value={section}>{section}</option>
                    ))}
                </select>

                <button className="btn btn-primary" onClick={handleCreateClick}>
                    <i className="fa fa-plus"></i> New Class
                </button>
            </div>

            {/* Classes Table */}
            <div className="section">
                <div className="section-content">
                    {filteredClasses.length > 0 ? (
                        <div className="classes-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Class Name</th>
                                        <th>Section</th>
                                        <th>Description</th>
                                        <th>Strength</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClasses.map((classItem) => (
                                        <tr key={classItem.id}>
                                            <td>{classItem.name}</td>
                                            <td>{classItem.section || '-'}</td>
                                            <td>{classItem.description || '-'}</td>
                                            <td>{classItem.strength || '-'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-icon btn-edit" 
                                                        title="Edit"
                                                        onClick={() => handleEditClick(classItem)}
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn-icon btn-manage" 
                                                        title="Manage Students"
                                                        onClick={() => handleManageStudents(classItem)}
                                                    >
                                                        <i className="fa fa-users"></i>
                                                    </button>
                                                    <button 
                                                        className="btn-icon btn-delete" 
                                                        title="Delete"
                                                        onClick={() => handleDelete(classItem.id)}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fa fa-inbox"></i>
                            <p>No classes found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {modalType === 'manage_students' ? (
                            <>
                                <div className="modal-header">
                                    <h2>Manage Students - {selectedClass?.name}</h2>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted">Student management interface</p>
                                    <p className="text-muted">Assign/remove students to/from this class</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-header">
                                    <h2>{modalType === 'create' ? 'Create New Class' : 'Edit Class'}</h2>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Class Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., BTech CSE - 4th Year"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Section</label>
                                            <input
                                                type="text"
                                                name="section"
                                                value={formData.section}
                                                onChange={handleInputChange}
                                                placeholder="e.g., A, B, C"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Strength</label>
                                            <input
                                                type="number"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 60"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Class description..."
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {modalType === 'create' ? 'Create Class' : 'Update Class'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageClasses;
