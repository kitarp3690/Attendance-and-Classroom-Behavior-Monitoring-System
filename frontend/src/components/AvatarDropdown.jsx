import React, { useState } from "react";
import ProfileModal from "./Modals/ProfileModal";
import ChangePasswordModal from "./Modals/ChangePasswordModal";
import LogoutModal from "./Modals/LogoutModal";

const AvatarDropdown = ({ role, setRole }) => {
    const [open, setOpen] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    const [changePwdModal, setChangePwdModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);

    return (
        <div className="avatar-dropdown">
            <img
                src="/assets/avatars/default.png"
                className="avatar-img"
                alt="avatar"
                onClick={() => setOpen(!open)}
            />
            {open && (
                <div className="dropdown-menu">
                    <div onClick={() => { setProfileModal(true); setOpen(false); }}>Profile</div>
                    <div onClick={() => { setChangePwdModal(true); setOpen(false); }}>Change Password</div>
                    <div onClick={() => { setLogoutModal(true); setOpen(false); }}>Logout</div>
                </div>
            )}
            <ProfileModal open={profileModal} onClose={() => setProfileModal(false)} user={{ name: "Test User", email: "test@email.com", phone: "1234567890" }} onSave={() => setProfileModal(false)} />
            <ChangePasswordModal open={changePwdModal} onClose={() => setChangePwdModal(false)} onSave={() => setChangePwdModal(false)} />
            <LogoutModal open={logoutModal} onClose={() => setLogoutModal(false)} onConfirm={() => { sessionStorage.clear(); setRole(null); }} />
        </div>
    );
};

export default AvatarDropdown;