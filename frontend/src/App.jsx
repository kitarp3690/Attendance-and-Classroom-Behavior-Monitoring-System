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

    useEffect(() => {
        setRole(getRoleFromSession());
    }, []);

    if (!role) return <LoginPage setRole={setRole} />;

    return (
        <div className="app-container" data-theme={window.localStorage.getItem("theme") || "light"}>
            <Navbar role={role} setRole={setRole} />
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