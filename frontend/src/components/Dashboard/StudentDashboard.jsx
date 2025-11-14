import React, { useState } from "react";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyStudentData } from "../../utils/dummyData";

const StudentDashboard = () => {
    const [subject, setSubject] = useState(dummyStudentData.subjects[0]);
    return (
        <div className="student-dashboard">
            <label>
                Subject:
                <select value={subject} onChange={e => setSubject(e.target.value)}>
                    {dummyStudentData.subjects.map(subj => <option key={subj}>{subj}</option>)}
                </select>
            </label>
            <div className="attendance-summary">
                <div>Total Classes: {dummyStudentData.summary.totalClasses}</div>
                <div>Present: {dummyStudentData.summary.present}</div>
                <div>Absent: {dummyStudentData.summary.absent}</div>
                <div>Late: {dummyStudentData.summary.late}</div>
            </div>
            <div className="attendance-detail">
                {/* Weekly/monthly view */}
                {dummyStudentData.detail.map(day => (
                    <div className={`attendance-day ${day.status.toLowerCase()}`} key={day.date}>
                        {day.date} - {day.status}
                    </div>
                ))}
            </div>
            <AttendanceChart data={dummyStudentData.charts} role="student" />
        </div>
    );
};
export default StudentDashboard;