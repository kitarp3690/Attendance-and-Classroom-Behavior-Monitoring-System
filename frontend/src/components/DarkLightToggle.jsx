import React from "react";

const DarkLightToggle = ({ theme, onToggle }) => {
    const resolvedTheme = theme || (typeof window !== "undefined" ? window.localStorage.getItem("theme") || "light" : "light");
    const isDark = resolvedTheme === "dark";

    const fallbackToggle = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const current = window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        window.localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
        document.body.setAttribute("data-theme", next);
    };

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            fallbackToggle();
        }
    };

    return (
        <button
            type="button"
            className="theme-toggle-btn"
            onClick={handleToggle}
            aria-label={`Activate ${isDark ? "light" : "dark"} theme`}
        >
            <i className={`fa ${isDark ? "fa-moon" : "fa-sun"}`} aria-hidden="true"></i>
        </button>
    );
};

export default DarkLightToggle;