import React, { useState } from "react";
import "./AttendanceTable.css";

export default function AttendanceTable({ filterOptions, data, role }) {
    const [filters, setFilters] = useState({});
    const [search, setSearch] = useState("");

    return (
        <div className="attendance-table-container">
            <div className="table-filters">
                {Object.keys(filterOptions).map((filter) => (
                    <select key={filter} style={{ marginRight: 7 }} onChange={e => setFilters({ ...filters, [filter]: e.target.value })}>
                        {filterOptions[filter].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                ))}
                <input type="text" placeholder="Search..." value={search} style={{ marginLeft: 10 }}
                    onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="attendance-table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data
                            .filter(row => row.studentName.toLowerCase().includes(search.toLowerCase()))
                            .map(row => (
                                <tr key={row.id}>
                                    <td>{row.studentName}</td>
                                    <td>{row.class}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.teacher}</td>
                                    <td>{row.date}</td>
                                    <td>
                                        <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
                                    </td>
                                    <td>
                                        {role !== "student" && (
                                            <>
                                                <button className="edit-btn" type="button">Edit</button>
                                                <button className="delete-btn" type="button">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <span>Page 1 of N</span>
            </div>
        </div>
    );
}