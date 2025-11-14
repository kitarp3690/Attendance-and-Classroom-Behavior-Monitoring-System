import React, { useState } from "react";
import { getSidebarMenu } from "../utils/role";
import "./Sidebar.css";
export default function Sidebar({ role }) {
    const [collapsed, setCollapsed] = useState(false);
    const menu = getSidebarMenu(role);

    return (
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <button className="collapse-btn" title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(c => !c)}>
                <span className="collapse-icon">{collapsed ? "⮞" : "⮜"}</span>
            </button>
            <ul>
                {menu.map((item, idx) => (
                    <li className={`sidebar-item${item.active ? " active" : ""}`} key={item.text}>
                        <i className={item.icon}></i>
                        {!collapsed && <span className="sidebar-txt">{item.text}</span>}
                    </li>
                ))}
            </ul>
        </aside>
    );
}