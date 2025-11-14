import React from "react";
import Notifications from "./Notifications";
import AvatarDropdown from "./AvatarDropdown";
import DarkLightToggle from "./DarkLightToggle";
import "./Navbar.css";

export default function Navbar({ role, setRole, theme, onToggleTheme }) {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <i className="fa fa-graduation-cap"></i>
                </div>
                <span className="navbar-title">Attendance System</span>
            </div>
            <div className="navbar-right">
                <div className="navbar-search">
                    <input type="search" placeholder="Search..." aria-label="Global search" />
                    <i className="fa fa-search"></i>
                </div>
                <DarkLightToggle theme={theme} onToggle={onToggleTheme} />
                <Notifications role={role} />
                <AvatarDropdown role={role} setRole={setRole} />
            </div>
        </nav>
    );
}