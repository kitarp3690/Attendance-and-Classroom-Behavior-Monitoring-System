import React from "react";
const DarkLightToggle = () => {
    const toggleTheme = () => {
        const current = window.localStorage.getItem("theme") || "light";
        const next = current === "light" ? "dark" : "light";
        window.localStorage.setItem("theme", next);
        document.querySelector("body").setAttribute("data-theme", next);
    };
    return (
        <span
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
            style={{ cursor: "pointer", fontSize: 24, marginRight: 12 }}
            role="img"
            aria-label="theme"
        >
            {window.localStorage.getItem("theme") === "dark" ? "🌙" : "☀️"}
        </span>
    );
};
export default DarkLightToggle;