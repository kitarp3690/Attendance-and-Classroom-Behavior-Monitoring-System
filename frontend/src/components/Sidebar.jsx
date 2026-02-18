import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSidebarMenu } from "../utils/role";
import "./Sidebar.css";

export default function Sidebar({ user }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const role = user?.role || 'student';
    const menu = getSidebarMenu(role);

    const isActive = (path) => {
        return location.pathname === path || 
               (path !== `/${role}/dashboard` && location.pathname.startsWith(path));
    };

    return (
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <button className="collapse-btn" title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(c => !c)}>
                <span className="collapse-icon">{collapsed ? "⮞" : "⮜"}</span>
            </button>
            <ul>
                {menu && menu.map((item) => (
                    <li className={`sidebar-item${isActive(item.path) ? " active" : ""}`} key={item.text}>
                        <Link to={item.path} className="sidebar-link">
                            <i className={item.icon}></i>
                            {!collapsed && <span className="sidebar-txt">{item.text}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}