import React, { useState, useEffect } from "react";
import { attendanceAPI } from "../../services/api";
import "./AttendanceChart.css";

export default function AttendanceChart({ data, classId, subjectId, dateRange }) {
    const [chartData, setChartData] = useState(data || {
        labels: [],
        present: [],
        absent: [],
        late: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!data) {
            fetchAttendanceStatistics();
        } else {
            setChartData(data);
        }
    }, [data, classId, subjectId, dateRange]);

    const fetchAttendanceStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (classId) params.class_id = classId;
            if (subjectId) params.subject_id = subjectId;
            if (dateRange) {
                params.start_date = dateRange.start;
                params.end_date = dateRange.end;
            }

            const response = await attendanceAPI.getStatistics(params);

            // Transform API response to chart format
            const stats = response.data;
            const labels = stats.map(item => item.date || item.subject || item.class_name || item.period);
            const present = stats.map(item => item.present_count || 0);
            const absent = stats.map(item => item.absent_count || 0);
            const late = stats.map(item => item.late_count || 0);

            setChartData({
                labels,
                present,
                absent,
                late
            });
        } catch (err) {
            console.error("Error fetching attendance statistics:", err);
            setError("Failed to load attendance statistics");
            // Fallback to dummy data if API fails
            setChartData({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                present: [25, 28, 22, 30, 26],
                absent: [3, 2, 5, 1, 4],
                late: [2, 0, 3, 2, 0]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="attendance-chart">
                <h4>Attendance Trends</h4>
                <div className="loading">Loading statistics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="attendance-chart">
                <h4>Attendance Trends</h4>
                <div className="error-message">{error}</div>
                <button onClick={fetchAttendanceStatistics} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="attendance-chart">
            <h4>Attendance Trends</h4>
            <div className="attendance-bars">
                {chartData.labels.map((label, i) => {
                    const present = chartData.present[i] ?? 0;
                    const absent = chartData.absent[i] ?? 0;
                    const late = chartData.late[i] ?? 0;
                    const widthMultiplier = 9;

                    return (
                        <div key={label} className="attendance-bar-row">
                            <span className="bar-label">{label}</span>
                            <div className="bar-track">
                                <span
                                    className="bar-token bar-green"
                                    style={{ width: Math.max(present * widthMultiplier, 48) }}
                                    title={`Present: ${present}`}
                                >
                                    {present}
                                </span>
                                <span
                                    className="bar-token bar-red"
                                    style={{ width: Math.max(absent * widthMultiplier, 48) }}
                                    title={`Absent: ${absent}`}
                                >
                                    {absent}
                                </span>
                                <span
                                    className="bar-token bar-yellow"
                                    style={{ width: Math.max(late * widthMultiplier, 48) }}
                                    title={`Late: ${late}`}
                                >
                                    {late}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="chart-legend">
                <div className="legend-item">
                    <span className="legend-color bar-green"></span>
                    <span>Present</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color bar-red"></span>
                    <span>Absent</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color bar-yellow"></span>
                    <span>Late</span>
                </div>
            </div>
        </div>
    );
}