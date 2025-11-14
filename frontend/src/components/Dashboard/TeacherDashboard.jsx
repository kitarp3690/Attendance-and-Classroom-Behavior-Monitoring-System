import React from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyTeacherData } from "../../utils/dummyData";

const TeacherDashboard = () => (
    <div className="teacher-dashboard">
        <div className="cards-widget">
            <div className="card">Total Students: {dummyTeacherData.totalStudents}</div>
            <div className="card attended">Attendance Today: {dummyTeacherData.attendanceToday}</div>
        </div>
        {/* Session start/end placeholder */}
        <button className="session-btn">Start/End Session</button>
        <AttendanceTable
            filterOptions={dummyTeacherData.filterOptions}
            data={dummyTeacherData.attendance}
            role="teacher"
        />
        <AttendanceChart data={dummyTeacherData.charts} role="teacher" />
    </div>
);
export default TeacherDashboard;