import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import ProfileModal from "./Modals/ProfileModal";
import ChangePasswordModal from "./Modals/ChangePasswordModal";
import LogoutModal from "./Modals/LogoutModal";

const AvatarDropdown = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    const [changePwdModal, setChangePwdModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);

    const handleLogout = () => {
        // Clear localStorage and sessionStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        sessionStorage.clear();
        
        // Update context
        setUser(null);
        
        // Redirect to login
        navigate('/login');
    };

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return (user.first_name[0] + user.last_name[0]).toUpperCase();
        }
        return user?.username ? user.username[0].toUpperCase() : 'U';
    };

    return (
        <>
            <div className="avatar-dropdown">
                <div
                    className="avatar-img"
                    onClick={() => setOpen(!open)}
                    title={user?.first_name || user?.username}
                >
                    {getInitials()}
                </div>
                {open && (
                    <>
                        <div className="dropdown-backdrop" onClick={() => setOpen(false)}></div>
                        <div className="dropdown-menu">
                            <div 
                                onClick={() => { setProfileModal(true); setOpen(false); }}
                                className="dropdown-item"
                            >
                                <i className="fa fa-user-circle"></i> Profile
                            </div>
                            <div 
                                onClick={() => { setChangePwdModal(true); setOpen(false); }}
                                className="dropdown-item"
                            >
                                <i className="fa fa-lock"></i> Change Password
                            </div>
                            <div className="dropdown-divider"></div>
                            <div 
                                onClick={() => { setLogoutModal(true); setOpen(false); }}
                                className="dropdown-item logout"
                            >
                                <i className="fa fa-sign-out"></i> Logout
                            </div>
                        </div>
                    </>
                )}
            </div>
            <ProfileModal 
                open={profileModal} 
                onClose={() => setProfileModal(false)} 
                user={{
                    name: user?.first_name || user?.username || "User",
                    email: user?.email || "",
                    phone: user?.phone || "",
                    avatar: user?.avatar || ""
                }}
                onSave={() => setProfileModal(false)} 
            />
            <ChangePasswordModal 
                open={changePwdModal} 
                onClose={() => setChangePwdModal(false)} 
                onSave={() => setChangePwdModal(false)} 
            />
            <LogoutModal 
                open={logoutModal} 
                onClose={() => setLogoutModal(false)} 
                onConfirm={handleLogout}
            />
        </>
    );
};

export default AvatarDropdown;