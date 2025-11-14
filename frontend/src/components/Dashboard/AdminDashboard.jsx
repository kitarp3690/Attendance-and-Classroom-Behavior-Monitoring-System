import React from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyAdminData } from "../../utils/dummyData";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <div className="dashboard-cards">
                <div className="dashboard-card">Total Students<br /><span>{dummyAdminData.totalStudents}</span></div>
                <div className="dashboard-card">Total Teachers<br /><span>{dummyAdminData.totalTeachers}</span></div>
                <div className="dashboard-card">Total Classes<br /><span>{dummyAdminData.totalClasses}</span></div>
                <div className="dashboard-card attended">Attendance Today<br /><span>{dummyAdminData.attendanceToday}</span></div>
                <div className="dashboard-card alert">{dummyAdminData.alerts}</div>
            </div>
            <AttendanceTable filterOptions={dummyAdminData.filterOptions} data={dummyAdminData.attendance} role="admin" />
            <AttendanceChart data={dummyAdminData.charts} role="admin" />
        </div>
    );
}