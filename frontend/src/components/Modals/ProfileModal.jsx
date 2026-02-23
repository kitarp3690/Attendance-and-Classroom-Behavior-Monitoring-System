import React, { useState } from "react";
import "./ProfileModal.css";

export default function ProfileModal({ open, onClose, user = { name: "", email: "", phone: "", avatar: "" }, onSave }) {
    const [form, setForm] = useState(user);
    const [previewImage, setPreviewImage] = useState(user.avatar || "");

    if (!open) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setForm({ ...form, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="profile-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h3><i className="fa fa-user-edit"></i> Edit Profile</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <div className="profile-avatar-section">
                    <div className="avatar-preview">
                        {previewImage ? (
                            <img src={previewImage} alt="Avatar" />
                        ) : (
                            <i className="fa fa-user"></i>
                        )}
                    </div>
                    <label className="avatar-upload-btn">
                        <i className="fa fa-camera"></i> Change Photo
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                </div>

                <div className="form-group">
                    <label htmlFor="name">
                        <i className="fa fa-user"></i> Full Name
                    </label>
                    <input 
                        id="name"
                        name="name" 
                        value={form.name} 
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
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
                        value={form.email} 
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
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
                        value={form.phone} 
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                    />
                </div>

                <div className="modal-actions">
                    <button type="submit" className="modal-btn save-btn">
                        <i className="fa fa-check"></i> Save Changes
                    </button>
                    <button type="button" className="modal-btn cancel-btn" onClick={onClose}>
                        <i className="fa fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}