import React from "react";
const EditAttendanceModal = ({ open, onClose, attendance, onSave }) => {
    if (!open) return null;
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Edit Attendance</h3>
                <select defaultValue={attendance.status}>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                </select>
                <button onClick={() => onSave()}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};
export default EditAttendanceModal;