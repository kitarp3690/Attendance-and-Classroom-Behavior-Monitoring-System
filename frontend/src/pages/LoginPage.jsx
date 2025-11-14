import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ setRole }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showForgot, setShowForgot] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleLogin = e => {
        e.preventDefault();
        // Production: replace this with backend authentication
        if (form.username === "admin" || form.username === "teacher" || form.username === "student") {
            window.sessionStorage.setItem("role", form.username);
            setRole(form.username);
        } else {
            setError("Invalid credentials.");
        }
    };

    return (
        <div className="login-bg">
            <form className="login-card" onSubmit={handleLogin}>
                <h2 className="login-title">Attendance Management</h2>
                <div className="login-group">
                    <label htmlFor="username">Username</label>
                    <input
                        className="login-input"
                        id="username"
                        name="username"
                        type="text"
                        autoFocus
                        autoComplete="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div className="login-group">
                    <label htmlFor="password">Password</label>
                    <input
                        className="login-input"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />
                </div>
                {error && <div className="login-error">{error}</div>}
                <button className="login-btn" type="submit">Login</button>
                <button
                    type="button"
                    className="login-link"
                    onClick={() => setShowForgot(true)}>
                    Forgot Password?
                </button>
                {showForgot && (
                    <div className="login-modal" onClick={() => setShowForgot(false)}>
                        <div className="login-modal-content" onClick={e => e.stopPropagation()}>
                            <h5>Forgot Password</h5>
                            <p>Contact your administrator.</p>
                            <button className="login-btn-inline" onClick={() => setShowForgot(false)}>OK</button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}