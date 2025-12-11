import React, { useState } from "react";
import "./ProfileModal.css";

export default function ChangePasswordModal({ open, onClose, onSave }) {
    const [form, setForm] = useState({ old: "", new1: "", new2: "" });
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.old && form.new1 && form.new2) {
            if (form.new1 === form.new2) {
                onSave(form);
                setForm({ old: "", new1: "", new2: "" });
                setError("");
            } else {
                setError("New passwords do not match");
            }
        } else {
            setError("All fields are required");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="profile-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h3><i className="fa fa-lock"></i> Change Password</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                {error && <div style={{ color: '#ef4444', padding: '12px 20px', fontSize: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', margin: '0 20px 15px', borderRadius: '8px' }}>{error}</div>}

                <div className="form-group">
                    <label htmlFor="old">
                        <i className="fa fa-key"></i> Current Password
                    </label>
                    <input 
                        id="old"
                        name="old" 
                        type="password"
                        value={form.old}
                        onChange={e => { setForm({ ...form, old: e.target.value }); setError(""); }}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="new1">
                        <i className="fa fa-lock-open"></i> New Password
                    </label>
                    <input 
                        id="new1"
                        name="new1" 
                        type="password"
                        value={form.new1}
                        onChange={e => { setForm({ ...form, new1: e.target.value }); setError(""); }}
                        placeholder="Enter new password"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="new2">
                        <i className="fa fa-check-circle"></i> Confirm New Password
                    </label>
                    <input 
                        id="new2"
                        name="new2" 
                        type="password"
                        value={form.new2}
                        onChange={e => { setForm({ ...form, new2: e.target.value }); setError(""); }}
                        placeholder="Confirm new password"
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button type="submit" className="modal-btn save-btn">
                        <i className="fa fa-check"></i> Update Password
                    </button>
                    <button type="button" className="modal-btn cancel-btn" onClick={onClose}>
                        <i className="fa fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}