import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import TeacherDashboard from "./components/Dashboard/TeacherDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import { getRoleFromSession } from "./utils/role";
import "./styles/global.css";
import "./styles/themes.css";

function App() {
    const [role, setRole] = useState(null);
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        const stored = window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", stored);
            document.body.setAttribute("data-theme", stored);
        }
        return stored;
    });

    useEffect(() => {
        setRole(getRoleFromSession());
    }, []);

    useEffect(() => {
        const resolved = theme === "dark" ? "dark" : "light";
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", resolved);
            document.body.setAttribute("data-theme", resolved);
        }
        if (typeof window !== "undefined") {
            window.localStorage.setItem("theme", resolved);
        }
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

    if (!role) {
        return <LoginPage setRole={setRole} theme={theme} onToggleTheme={handleToggleTheme} />;
    }

    return (
        <div className="app-container">
            <Navbar role={role} setRole={setRole} theme={theme} onToggleTheme={handleToggleTheme} />
            <div className="main-layout">
                <Sidebar role={role} />
                <main className="dashboard-content">
                    {role === "admin" && <AdminDashboard />}
                    {role === "teacher" && <TeacherDashboard />}
                    {role === "student" && <StudentDashboard />}
                </main>
            </div>
        </div>
    );
}
export default App;