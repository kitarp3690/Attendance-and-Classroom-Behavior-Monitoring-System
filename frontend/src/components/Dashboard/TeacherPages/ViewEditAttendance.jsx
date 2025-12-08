import React, { useState } from "react";
import "./TeacherPages.css";

const ViewEditAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([
        { id: 1, student: "John Doe", rollNo: "2025001", date: "2024-11-14", status: "Present", subject: "Mathematics" },
        { id: 2, student: "Jane Smith", rollNo: "2025002", date: "2024-11-14", status: "Absent", subject: "Mathematics" },
        { id: 3, student: "Mike Johnson", rollNo: "2025003", date: "2024-11-13", status: "Late", subject: "Mathematics" },
        { id: 4, student: "Sarah Williams", rollNo: "2025004", date: "2024-11-14", status: "Present", subject: "Mathematics" },
        { id: 5, student: "David Brown", rollNo: "2025005", date: "2024-11-13", status: "Present", subject: "Mathematics" },
    ]);

    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredData = attendanceData.filter(record => record.date === filterDate);

    const handleEdit = (id, currentStatus) => {
        setEditingId(id);
        setEditStatus(currentStatus);
    };

    const handleSave = (id) => {
        setAttendanceData(attendanceData.map(record => 
            record.id === id ? {...record, status: editStatus} : record
        ));
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this record?")) {
            setAttendanceData(attendanceData.filter(record => record.id !== id));
        }
    };

    return (
        <div className="teacher-page">
            <div className="page-header">
                <h1><i className="fa fa-edit"></i> View/Edit Attendance</h1>
                <button className="btn-primary"><i className="fa fa-download"></i> Export</button>
            </div>

            <div className="filters-section">
                <div className="filter-item">
                    <label>Filter by Date</label>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="filter-stats">
                    <div className="stat">
                        <strong>{filteredData.length}</strong> Total Records
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--success)'}}>{filteredData.filter(d => d.status === 'Present').length}</strong> Present
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--danger)'}}>{filteredData.filter(d => d.status === 'Absent').length}</strong> Absent
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--warning)'}}>{filteredData.filter(d => d.status === 'Late').length}</strong> Late
                    </div>
                </div>
            </div>

            <div className="attendance-edit-table-wrapper">
                <table className="attendance-edit-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map(record => (
                                <tr key={record.id}>
                                    <td>{record.rollNo}</td>
                                    <td>{record.student}</td>
                                    <td>{record.date}</td>
                                    <td>
                                        {editingId === record.id ? (
                                            <select 
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                                className="edit-status-select"
                                            >
                                                <option value="Present">Present</option>
                                                <option value="Absent">Absent</option>
                                                <option value="Late">Late</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge status-${record.status.toLowerCase()}`}>
                                                {record.status}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === record.id ? (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon btn-save"
                                                    onClick={() => handleSave(record.id)}
                                                    title="Save"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn-icon btn-cancel"
                                                    onClick={handleCancel}
                                                    title="Cancel"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon btn-edit"
                                                    onClick={() => handleEdit(record.id, record.status)}
                                                    title="Edit"
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(record.id)}
                                                    title="Delete"
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="empty-message">No attendance records for this date</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewEditAttendance;
