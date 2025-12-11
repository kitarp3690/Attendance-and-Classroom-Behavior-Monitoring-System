import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DarkLightToggle from "../components/DarkLightToggle";
import { authAPI } from "../services/api";
import "./LoginPage.css";

export default function LoginPage({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "", rememberMe: false });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForgot, setShowForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [userRole, setUserRole] = useState(null);

    // Load remembered username on mount
    useEffect(() => {
        const remembered = localStorage.getItem("rememberedUser");
        if (remembered) {
            setForm(prev => ({ ...prev, username: remembered, rememberMe: true }));
        }
    }, []);

    const validateForm = () => {
        const errors = {};
        
        if (!form.username.trim()) {
            errors.username = "Username is required";
        }
        if (!form.password) {
            errors.password = "Password is required";
        }
        if (form.password && form.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = e => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
        setError("");
        
        // Clear validation error for this field
        if (validationErrors[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: ""
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        
        try {
            console.log('🔐 Attempting login with:', form.username);
            
            // Call real backend API
            const response = await authAPI.login({
                username: form.username,
                password: form.password
            });

            console.log('✓ Login successful, tokens received');

            // Store tokens
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch user info to get role and details
            console.log('📋 Fetching user profile...');
            const userResponse = await authAPI.getMe();
            const userData = userResponse.data;
            const role = userData.role;
            
            console.log('👤 User role:', role, '| Department:', userData.department);

            // Store user info
            localStorage.setItem('user_role', role);
            localStorage.setItem('user_id', userData.id);
            localStorage.setItem('user_data', JSON.stringify(userData));
            window.sessionStorage.setItem("role", role);
            setUserRole(role);
            
            // Handle remember me
            if (form.rememberMe) {
                window.localStorage.setItem("rememberedUser", form.username);
            } else {
                window.localStorage.removeItem("rememberedUser");
            }

            setSuccessMessage(`Welcome ${userData.first_name || userData.username}! Redirecting...`);

            // Redirect based on role with small delay for success message
            setTimeout(() => {
                console.log('→ Redirecting to:', `/${role}`);
                navigate(`/${role}`);
                window.location.reload();
            }, 800);
            
        } catch (err) {
            console.error('❌ Login error:', err);
            
            // More detailed error messages
            if (err.response?.status === 401) {
                setError("Invalid username or password. Please try again.");
            } else if (err.response?.status === 403) {
                setError("Your account has been disabled. Contact administrator.");
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.username) {
                setError("Invalid username format.");
            } else if (err.response?.data?.password) {
                setError("Password does not meet requirements.");
            } else if (err.message === 'Network Error') {
                setError("Network error. Please check your connection and try again.");
            } else {
                setError("Login failed. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-theme-toggle">
                <DarkLightToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            
            {/* Header removed */}

            <div className="login-container">
                <div className="login-info">
                    <div className="login-info-content">
                        <div className="login-info-title">
                            <i className="fa fa-graduation-cap"></i>
                            Welcome Back
                        </div>
                        <div className="login-info-subtitle">
                            Access your attendance records and classroom information
                        </div>
                        <div className="login-features">
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Real-time attendance tracking</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>AI-powered face recognition</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Department-wide reports</span>
                            </div>
                            <div className="feature-item">
                                <i className="fa fa-check-circle"></i>
                                <span>Instant notifications</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-form-container">
                    <form className="login-card" onSubmit={handleLogin}>
                        <div className="login-header">
                            <div className="login-icon">
                                <i className="fa fa-user-circle"></i>
                            </div>
                            <h2 className="login-title">Sign In</h2>
                            <p className="login-subtitle">Enter your credentials to access your account</p>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="login-success">
                                <i className="fa fa-check-circle"></i>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Username Input */}
                        <div className="login-group">
                            <label htmlFor="username">
                                <i className="fa fa-user"></i> Username
                            </label>
                            <input
                                className={`login-input ${validationErrors.username ? 'input-error' : ''}`}
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
                                aria-label="Username"
                            />
                            {validationErrors.username && (
                                <span className="field-error">
                                    <i className="fa fa-exclamation-circle"></i> {validationErrors.username}
                                </span>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="login-group">
                            <label htmlFor="password">
                                <i className="fa fa-lock"></i> Password
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    className={`login-input password-input ${validationErrors.password ? 'input-error' : ''}`}
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    aria-label="Password"
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                    disabled={isLoading}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {validationErrors.password && (
                                <span className="field-error">
                                    <i className="fa fa-exclamation-circle"></i> {validationErrors.password}
                                </span>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="login-options">
                            <label className="remember-me">
                                <input 
                                    type="checkbox" 
                                    name="rememberMe" 
                                    checked={form.rememberMe}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    aria-label="Remember me"
                                />
                                <span>Remember me</span>
                            </label>
                            <button 
                                className="login-link" 
                                type="button" 
                                onClick={() => setShowForgot(true)} 
                                disabled={isLoading}
                                title="Click to reset your password"
                            >
                                <i className="fa fa-question-circle"></i> Forgot Password?
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="login-error">
                                <i className="fa fa-exclamation-circle"></i>
                                <div className="error-content">
                                    <strong>Login Failed</strong>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            className="login-btn" 
                            type="submit" 
                            disabled={isLoading}
                            aria-busy={isLoading}
                        >
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
                    </form>

                    {/* Status Indicator */}
                    <div className="login-status-indicator">
                        <div className="status-dot"></div>
                        <span>System Online</span>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div className="login-modal" onClick={() => setShowForgot(false)}>
                    <div className="login-modal-content" onClick={e => e.stopPropagation()}>
                        <button 
                            className="modal-close-btn" 
                            onClick={() => setShowForgot(false)}
                            title="Close"
                        >
                            <i className="fa fa-times"></i>
                        </button>
                        <div className="modal-icon">
                            <i className="fa fa-key"></i>
                        </div>
                        <h5 className="modal-title">Password Reset</h5>
                        <p className="modal-description">
                            To reset your password, please contact your department administrator or the IT office.
                        </p>
                        <div className="modal-contact">
                            <p>
                                <strong>Admin Email:</strong> admin@college.edu<br/>
                                <strong>IT Office:</strong> it@college.edu<br/>
                                <strong>Phone:</strong> +977-1-XXX-XXXX
                            </p>
                        </div>
                        <button 
                            className="login-btn-inline" 
                            onClick={() => setShowForgot(false)}
                        >
                            <i className="fa fa-check"></i> Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}