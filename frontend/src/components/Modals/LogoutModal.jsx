import React from "react";
import "./ProfileModal.css"; // Reuse modal CSS!
export default function LogoutModal({ open, onClose, onConfirm }) {
    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <h3>Confirm Logout?</h3>
                <div className="modal-actions">
                    <button className="modal-btn" style={{ background: "var(--error)" }} onClick={onConfirm}>Yes, Logout</button>
                    <button className="modal-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}