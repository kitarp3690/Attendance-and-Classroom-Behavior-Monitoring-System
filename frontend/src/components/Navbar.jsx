import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Notifications from "./Notifications";
import AvatarDropdown from "./AvatarDropdown";
import DarkLightToggle from "./DarkLightToggle";
import "./Navbar.css";

export default function Navbar({ theme, onToggleTheme }) {
    const { user } = useContext(AuthContext);

    const getRoleLabel = (role) => {
        const roleMap = {
            admin: 'Administrator',
            teacher: 'Teacher',
            hod: 'Head of Department',
            student: 'Student'
        };
        return roleMap[role] || role;
    };

    const getRoleIcon = (role) => {
        const roleIconMap = {
            admin: 'fa-shield',
            teacher: 'fa-chalkboard-user',
            hod: 'fa-users',
            student: 'fa-user-graduate'
        };
        return roleIconMap[role] || 'fa-user';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <i className="fa fa-graduation-cap"></i>
                </div>
                <div className="navbar-title-group">
                    <span className="navbar-title">Khwopa</span>
                    <span className="navbar-subtitle">
                        <i className={`fa ${getRoleIcon(user?.role)}`}></i>
                        {getRoleLabel(user?.role)}
                    </span>
                </div>
            </div>
            
            <div className="navbar-right">
                <div className="navbar-search">
                    <input 
                        type="search" 
                        placeholder="Search classes, records..." 
                        aria-label="Global search"
                    />
                    <i className="fa fa-search"></i>
                </div>

                <div className="navbar-divider"></div>

                {user && (
                    <div className="navbar-user-info">
                        <div className="user-details">
                            <span className="user-name">{user.first_name || user.username || 'User'}</span>
                            <span className="user-role">{getRoleLabel(user.role)}</span>
                        </div>
                    </div>
                )}

                <DarkLightToggle theme={theme} onToggle={onToggleTheme} />
                <Notifications role={user?.role} />
                <AvatarDropdown role={user?.role} />
            </div>
        </nav>
    );
}