import React, { useState } from "react";
import "./ProfileModal.css";

export default function ProfileModal({ open, onClose, user, onSave }) {
    const [form, setForm] = useState(user);

    if (!open) return null;

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="profile-modal" onClick={e => e.stopPropagation()}>
                <h3>Edit Profile</h3>
                <input name="name" value={form.name} onChange={handleChange} />
                <input name="email" value={form.email} onChange={handleChange} />
                <input name="phone" value={form.phone} onChange={handleChange} />
                {/* Avatar upload style */}
                <input name="avatar" type="file" style={{ margin: "13px 0" }} />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button type="button" className="modal-btn" onClick={() => onSave(form)}>Save</button>
                    <button type="button" className="modal-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
}