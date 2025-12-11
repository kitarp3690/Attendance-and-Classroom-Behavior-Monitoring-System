import React, { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import "./ProfileModal.css";

export default function ChangePasswordModal({ open, onClose }) {
    const [form, setForm] = useState({ old: "", new1: "", new2: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            // Reset form when opened
            setForm({ old: "", new1: "", new2: "" });
            setError("");
            setSuccess("");
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        console.log("=== Form Validation ===");
        console.log("Old password length:", form.old?.length || 0);
        console.log("New password length:", form.new1?.length || 0);
        console.log("Confirm password length:", form.new2?.length || 0);
        
        if (!form.old || !form.new1 || !form.new2) {
            setError("❌ All fields are required");
            return;
        }
        
        if (form.new1 !== form.new2) {
            setError("❌ New password and confirmation password do not match");
            return;
        }

        if (form.new1.length < 8) {
            setError("❌ New password must be at least 8 characters long");
            return;
        }

        if (form.old === form.new1) {
            setError("❌ New password must be different from current password");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                old_password: form.old,
                new_password: form.new1
            };
            
            console.log("=== Password Change Request ===");
            console.log("Payload:", payload);
            console.log("Token:", localStorage.getItem('access_token') ? 'Present' : 'Missing');
            
            const response = await userAPI.changePassword(payload);
            
            console.log("=== Password Change Success ===");
            console.log("Response:", response.data);
            
            setSuccess("✅ Password changed successfully!");
            setForm({ old: "", new1: "", new2: "" });
            
            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("=== Password Change Error ===");
            console.error("Full error:", err);
            console.error("Error response:", err.response);
            console.error("Error data:", err.response?.data);
            console.error("Error status:", err.response?.status);
            console.error("Error message:", err.message);
            
            if (err.response?.status === 400) {
                const errorMsg = err.response.data?.error;
                if (errorMsg) {
                    if (errorMsg.toLowerCase().includes('old password')) {
                        setError("❌ Current password is incorrect");
                    } else if (errorMsg.toLowerCase().includes('required')) {
                        setError("❌ All fields are required");
                    } else {
                        setError(`❌ ${errorMsg}`);
                    }
                } else if (err.response.data?.old_password) {
                    setError("❌ Current password is incorrect");
                } else if (err.response.data?.new_password) {
                    setError(`❌ ${err.response.data.new_password[0]}`);
                } else {
                    setError("❌ Invalid password. Please check your inputs.");
                }
            } else if (err.response?.status === 401) {
                setError("❌ Session expired. Please login again.");
            } else if (err.response?.status === 500) {
                setError("❌ Server error. Please try again later.");
            } else {
                setError("❌ Failed to change password. Please check your network connection.");
            }
        } finally {
            setLoading(false);
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

                {error && (
                    <div style={{ 
                        color: '#ef4444', 
                        padding: '14px 20px', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                        margin: '0 20px 15px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div style={{ 
                        color: '#10b981', 
                        padding: '14px 20px', 
                        fontSize: '14px',
                        fontWeight: '500', 
                        backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                        margin: '0 20px 15px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa fa-check-circle"></i>
                        <span>{success}</span>
                    </div>
                )}

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
                    <button type="submit" className="modal-btn save-btn" disabled={loading}>
                        <i className={loading ? "fa fa-spinner fa-spin" : "fa fa-check"}></i> {loading ? "Updating..." : "Update Password"}
                    </button>
                    <button type="button" className="modal-btn cancel-btn" onClick={onClose} disabled={loading}>
                        <i className="fa fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}