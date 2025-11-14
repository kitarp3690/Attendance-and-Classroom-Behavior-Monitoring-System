import React from "react";
import "./AttendanceChart.css";
// For starter, you can just visualize via text; for real charts, use Chart.js react-chartjs-2.
export default function AttendanceChart({ data }) {
    return (
        <div className="attendance-chart">
            <h4>Attendance Trends</h4>
            <div className="attendance-bars">
                {data.labels.map((label, i) => {
                    const present = data.present[i] ?? 0;
                    const absent = data.absent[i] ?? 0;
                    const late = data.late[i] ?? 0;
                    const widthMultiplier = 9;

                    return (
                        <div key={label} className="attendance-bar-row">
                            <span className="bar-label">{label}</span>
                            <div className="bar-track">
                                <span
                                    className="bar-token bar-green"
                                    style={{ width: Math.max(present * widthMultiplier, 48) }}
                                >
                                    {present}
                                </span>
                                <span
                                    className="bar-token bar-red"
                                    style={{ width: Math.max(absent * widthMultiplier, 48) }}
                                >
                                    {absent}
                                </span>
                                <span
                                    className="bar-token bar-yellow"
                                    style={{ width: Math.max(late * widthMultiplier, 48) }}
                                >
                                    {late}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}