import React, { useState, useEffect } from "react";
import { attendanceAPI, classAPI, subjectAPI } from "../../../services/api";
import "./AdminPages.css";

const Reports = () => {
    const [reportType, setReportType] = useState("attendance");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [format, setFormat] = useState("csv");

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const [classRes, subjectRes] = await Promise.all([
                classAPI.getAll({ page_size: 1000 }),
                subjectAPI.getAll({ page_size: 1000 })
            ]);
            setClasses(classRes.data.results || classRes.data || []);
            setSubjects(subjectRes.data.results || subjectRes.data || []);
        } catch (err) {
            console.error("Error fetching filters:", err);
        }
    };

    const generateReport = async () => {
        if (!dateRange.from || !dateRange.to) {
            setError("Please select both start and end dates.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Fetch attendance data with filters
            const params = {
                page_size: 10000,
                date_from: dateRange.from,
                date_to: dateRange.to
            };
            
            if (selectedClass) params.class_id = selectedClass;
            if (selectedSubject) params.subject_id = selectedSubject;

            const attendanceRes = await attendanceAPI.getAll(params);
            const records = attendanceRes.data.results || attendanceRes.data || [];

            // Process report based on type
            let processedData = {};
            if (reportType === "attendance") {
                processedData = generateAttendanceReport(records);
            } else {
                // Other report types could be added here
                processedData = records;
            }

            setReportData(processedData);
        } catch (err) {
            console.error("Error generating report:", err);
            setError("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const generateAttendanceReport = (records) => {
        const stats = {
            totalRecords: records.length,
            present: records.filter(r => r.status?.toLowerCase() === 'present').length,
            absent: records.filter(r => r.status?.toLowerCase() === 'absent').length,
            late: records.filter(r => r.status?.toLowerCase() === 'late').length,
            records: records
        };
        return stats;
    };

    const downloadReport = () => {
        if (!reportData) return;

        let csvContent = "";
        
        if (reportType === "attendance") {
            csvContent = "Student,Username,Class,Subject,Date,Status\n";
            reportData.records.forEach(r => {
                const row = [
                    `${r.student?.first_name} ${r.student?.last_name}`,
                    r.student?.username || '',
                    r.session?.class_assigned?.name || '',
                    r.session?.subject?.name || '',
                    r.marked_at?.split('T')[0] || '',
                    r.status || ''
                ];
                csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
            });
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `report_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`);
        link.click();
    };

    const reportCategories = [
        { id: "attendance", label: "Attendance Report", icon: "fa fa-calendar-check" },
        { id: "behavior", label: "Behavior Report", icon: "fa fa-bar-chart" },
        { id: "performance", label: "Performance Report", icon: "fa fa-chart-line" },
        { id: "academic", label: "Academic Report", icon: "fa fa-graduation-cap" },
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-file"></i> Generate Reports</h1>
                <button className="btn-primary" onClick={downloadReport} disabled={!reportData || loading}><i className="fa fa-download"></i> Download</button>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="reports-container">
                <div className="report-controls">
                    <h2>Report Configuration</h2>
                    
                    <div className="control-group">
                        <label>Report Type</label>
                        <div className="report-type-grid">
                            {reportCategories.map(cat => (
                                <div 
                                    key={cat.id}
                                    className={`report-type-card ${reportType === cat.id ? 'selected' : ''}`}
                                    onClick={() => setReportType(cat.id)}
                                >
                                    <i className={cat.icon}></i>
                                    <span>{cat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Date Range</label>
                        <div className="date-inputs">
                            <input 
                                type="date" 
                                value={dateRange.from}
                                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                                disabled={loading}
                            />
                            <span className="date-separator">to</span>
                            <input 
                                type="date" 
                                value={dateRange.to}
                                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Class (Optional)</label>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Subject (Optional)</label>
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Export Format</label>
                        <select 
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            disabled={loading}
                        >
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <button className="btn-primary btn-large" onClick={generateReport} disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {reportData && reportType === "attendance" && (
                <div className="report-results">
                    <h2>Report Results</h2>
                    <div className="stats-grid-large">
                        <div className="summary-stat-card">
                            <div className="stat-icon">
                                <i className="fa fa-list"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{reportData.totalRecords}</div>
                                <div className="stat-label">Total Records</div>
                            </div>
                        </div>
                        <div className="summary-stat-card success">
                            <div className="stat-icon">
                                <i className="fa fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{reportData.present}</div>
                                <div className="stat-label">Present</div>
                            </div>
                        </div>
                        <div className="summary-stat-card danger">
                            <div className="stat-icon">
                                <i className="fa fa-times-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{reportData.absent}</div>
                                <div className="stat-label">Absent</div>
                            </div>
                        </div>
                        <div className="summary-stat-card warning">
                            <div className="stat-icon">
                                <i className="fa fa-clock-o"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{reportData.late}</div>
                                <div className="stat-label">Late</div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
