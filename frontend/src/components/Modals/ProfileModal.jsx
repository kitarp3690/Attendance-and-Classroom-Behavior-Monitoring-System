import React, { useEffect } from "react";
import "./ProfileModal.css";

export default function ProfileModal({ open, onClose, user = { name: "", email: "", phone: "", avatar: "" } }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><i className="fa fa-user-circle"></i> View Profile</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <div className="profile-avatar-section">
                    <div className="avatar-preview">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" />
                        ) : (
                            <i className="fa fa-user"></i>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="name">
                        <i className="fa fa-user"></i> Full Name
                    </label>
                    <input 
                        id="name"
                        name="name" 
                        value={user.name} 
                        readOnly
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fa fa-envelope"></i> Email Address
                    </label>
                    <input 
                        id="email"
                        name="email" 
                        type="email"
                        value={user.email} 
                        readOnly
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">
                        <i className="fa fa-phone"></i> Phone Number
                    </label>
                    <input 
                        id="phone"
                        name="phone" 
                        type="tel"
                        value={user.phone || "Not provided"} 
                        readOnly
                        disabled
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-btn cancel-btn" onClick={onClose} style={{flex: 1}}>
                        <i className="fa fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    );
}