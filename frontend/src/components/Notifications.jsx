import React from "react";

const Notifications = ({ role }) => (
    <div className="navbar-notify" title="Notifications">
        <span role="img" aria-label="bell" style={{ fontSize: 22, cursor: "pointer" }}>🔔</span>
        {/* Optional: Notification count badge */}
    </div>
);

export default Notifications;