import React from "react";
import Notifications from "./Notifications";
import AvatarDropdown from "./AvatarDropdown";
import DarkLightToggle from "./DarkLightToggle";
import "./Navbar.css";

export default function Navbar({ role, setRole }) {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src="/assets/logo.svg" alt="Logo" className="navbar-logo" />
                <span className="navbar-title">Attendance Management</span>
            </div>
            <div className="navbar-right">
                <DarkLightToggle />
                <Notifications role={role} />
                <AvatarDropdown role={role} setRole={setRole} />
            </div>
        </nav>
    );
}