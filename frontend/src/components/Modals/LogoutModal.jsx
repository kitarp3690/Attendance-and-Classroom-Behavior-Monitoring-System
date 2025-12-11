import React from "react";
import "./ProfileModal.css";

export default function LogoutModal({ open, onClose, onConfirm }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><i className="fa fa-sign-out"></i> Confirm Logout</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <div style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}>
                        <i className="fa fa-exclamation-triangle"></i>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-dark)' }}>
                        Are you sure you want to logout?
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        You will be returned to the login page and your session will be ended.
                    </p>
                </div>

                <div className="modal-actions">
                    <button 
                        type="button" 
                        className="modal-btn save-btn" 
                        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                        onClick={onConfirm}
                    >
                        <i className="fa fa-check"></i> Yes, Logout
                    </button>
                    <button type="button" className="modal-btn cancel-btn" onClick={onClose}>
                        <i className="fa fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}