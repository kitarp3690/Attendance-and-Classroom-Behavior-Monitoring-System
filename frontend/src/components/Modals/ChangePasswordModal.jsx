import React, { useState } from "react";
import "./ProfileModal.css";
export default function ChangePasswordModal({ open, onClose, onSave }) {
    const [form, setForm] = useState({ old: "", new1: "", new2: "" });
    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="profile-modal" onClick={e => e.stopPropagation()}>
                <h3>Change Password</h3>
                <input name="old" type="password" placeholder="Old password" value={form.old} onChange={e => setForm({ ...form, old: e.target.value })} />
                <input name="new1" type="password" placeholder="New password" value={form.new1} onChange={e => setForm({ ...form, new1: e.target.value })} />
                <input name="new2" type="password" placeholder="Confirm new password" value={form.new2} onChange={e => setForm({ ...form, new2: e.target.value })} />
                <div className="modal-actions">
                    <button type="button" className="modal-btn" onClick={() => onSave(form)}>Save</button>
                    <button type="button" className="modal-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
}