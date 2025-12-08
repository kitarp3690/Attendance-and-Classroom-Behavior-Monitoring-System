import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkLightToggle from "../components/DarkLightToggle";
import { authAPI } from "../services/api";
import "./LoginPage.css";

export default function LoginPage({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "", rememberMe: false });
    const [error, setError] = useState("");
    const [showForgot, setShowForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = e => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            console.log('Attempting login with:', form.username);
            
            // Call real backend API
            const response = await authAPI.login({
                username: form.username,
                password: form.password
            });

            console.log('Login successful, tokens received');

            // Store tokens
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch user info to get role
            console.log('Fetching user profile...');
            const userResponse = await authAPI.getMe();
            const userRole = userResponse.data.role;
            
            console.log('User role:', userRole);

            localStorage.setItem('user_role', userRole);
            window.sessionStorage.setItem("role", userRole);
            
            if (form.rememberMe) {
                window.localStorage.setItem("rememberedUser", form.username);
            }

            // Redirect based on role
            console.log('Redirecting to:', `/${userRole}`);
            navigate(`/${userRole}`);
            
            // Reload to trigger AuthContext refresh
            window.location.reload();
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || "Invalid credentials. Please check your username and password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-theme-toggle">
                <DarkLightToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            <div className="login-container">
                <div className="login-info">
                    <div className="login-info-content">
                        <h1 className="login-info-title">Welcome Back!</h1>
                        <p className="login-info-subtitle">Automated Attendance System with AI-Powered Face Recognition</p>
                        <div className="login-features">
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Real-time Face Recognition</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Automated Attendance Tracking</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Comprehensive Analytics</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Multi-Role Dashboard</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="login-form-container">
                    <form className="login-card" onSubmit={handleLogin}>
                        <div className="login-header">
                            <div className="login-icon">
                                <i className="fa fa-user-graduate"></i>
                            </div>
                            <h2 className="login-title">Sign In</h2>
                            <p className="login-subtitle">Access your attendance dashboard (Student / Teacher / HOD / Admin)</p>
                            <div className="login-roles">
                            <p className="login-subtitle">Enter your credentials to access your account</p>
                            </div>
                            </div>
                        <div className="login-group">
                            <label htmlFor="username"><i className="fa fa-user"></i> Username</label>
                            <input
                                className="login-input"
                                id="username"
                                name="username"
                                type="text"
                                autoFocus
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="login-group">
                            <label htmlFor="password"><i className="fa fa-lock"></i> Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    className="login-input password-input"
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="login-options">
                            <label className="remember-me">
                                <input 
                                    type="checkbox" 
                                    name="rememberMe" 
                                    checked={form.rememberMe}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span>Remember me</span>
                            </label>
                            <button className="login-link" type="button" onClick={() => setShowForgot(true)} disabled={isLoading}>
                                Forgot Password?
                            </button>
                        </div>
                        {error && <div className="login-error"><i className="fa fa-exclamation-circle"></i> {error}</div>}
                        <button className="login-btn" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-sign-in-alt"></i>
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                        <div className="login-divider">
                            <span>Quick Access</span>
                        </div>
                        <div className="demo-accounts">
                            <button type="button" className="demo-btn" onClick={() => setForm({...form, username: "admin", password: "admin123456"})} disabled={isLoading}>
                                <i className="fa fa-user-shield"></i> Admin
                            </button>
                            <button type="button" className="demo-btn" onClick={() => setForm({...form, username: "teacher", password: "demo"})} disabled={isLoading}>
                                <i className="fa fa-chalkboard-teacher"></i> Teacher
                            </button>
                            <button type="button" className="demo-btn" onClick={() => setForm({...form, username: "student", password: "demo"})} disabled={isLoading}>
                                <i className="fa fa-user-graduate"></i> Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showForgot && (
                <div className="login-modal" onClick={() => setShowForgot(false)}>
                    <div className="login-modal-content" onClick={e => e.stopPropagation()}>
                        <h5>Forgot Password</h5>
                        <p>Contact your administrator.</p>
                        <button className="login-btn-inline" onClick={() => setShowForgot(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}