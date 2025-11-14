import React from "react";
import "./AttendanceChart.css";
// For starter, you can just visualize via text; for real charts, use Chart.js react-chartjs-2.
export default function AttendanceChart({ data }) {
    return (
        <div className="attendance-chart">
            <h4>Attendance Trends</h4>
            <div className="attendance-bars">
                {data.labels.map((lbl, i) => (
                    <div key={lbl} className="attendance-bar-row">
                        <span className="bar-label">{lbl}</span>
                        <span className="bar-green" style={{ width: data.present[i] * 2 }}>{data.present[i]}</span>
                        <span className="bar-red" style={{ width: data.absent[i] * 2 }}>{data.absent[i]}</span>
                        <span className="bar-yellow" style={{ width: data.late[i] * 2 }}>{data.late[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}