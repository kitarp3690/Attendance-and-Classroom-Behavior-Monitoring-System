import React, { useState, useEffect } from "react";
import "./AdminPages.css";

const defaultSettings = {
    systemName: "Attendance & Classroom Monitoring System",
    schoolCode: "EDU-2024-001",
    academicYear: "2024-2025",
    minAttendance: 75,
    workdaysPerWeek: 5,
    maxAbsentesAllowed: 8,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    backupFrequency: "daily",
    sessionTimeout: 30,
};

const Settings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        // Load settings from localStorage
        const saved = localStorage.getItem('systemSettings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (err) {
                console.error("Error loading settings:", err);
            }
        }
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings({...settings, [key]: value});
        setSuccess(false);
    };

    const handleSave = () => {
        try {
            setLoading(true);
            setError(null);
            
            // Save to localStorage
            localStorage.setItem('systemSettings', JSON.stringify(settings));
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving settings:", err);
            setError("Failed to save settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to default?")) {
            setSettings(defaultSettings);
            localStorage.removeItem('systemSettings');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-cog"></i> System Settings</h1>
                <div>
                    <button className="btn-secondary" onClick={handleReset} disabled={loading}><i className="fa fa-refresh"></i> Reset</button>
                    <button className="btn-primary" onClick={handleSave} disabled={loading}><i className="fa fa-save"></i> {loading ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </div>

            {success && (
                <div className="success-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#3c3' }}>
                    ✓ Settings saved successfully!
                </div>
            )}

            {error && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="settings-container">
                <div className="settings-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <i className="fa fa-cog"></i> General
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        <i className="fa fa-calendar-check"></i> Attendance
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <i className="fa fa-bell"></i> Notifications
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backup')}
                    >
                        <i className="fa fa-database"></i> Backup
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h2>General Settings</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>System Name</label>
                                    <input 
                                        type="text" 
                                        value={settings.systemName}
                                        onChange={(e) => handleSettingChange('systemName', e.target.value)}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>School/Institution Code</label>
                                    <input 
                                        type="text" 
                                        value={settings.schoolCode}
                                        onChange={(e) => handleSettingChange('schoolCode', e.target.value)}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>Academic Year</label>
                                    <input 
                                        type="text" 
                                        value={settings.academicYear}
                                        onChange={(e) => handleSettingChange('academicYear', e.target.value)}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>Session Timeout (minutes)</label>
                                    <input 
                                        type="number" 
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.maintenanceMode}
                                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                        />
                                        Maintenance Mode
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="settings-section">
                            <h2>Attendance Settings</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>Minimum Attendance Required (%)</label>
                                    <input 
                                        type="number" 
                                        value={settings.minAttendance}
                                        onChange={(e) => handleSettingChange('minAttendance', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>Workdays Per Week</label>
                                    <input 
                                        type="number" 
                                        value={settings.workdaysPerWeek}
                                        onChange={(e) => handleSettingChange('workdaysPerWeek', parseInt(e.target.value))}
                                        min="1"
                                        max="7"
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>Maximum Absences Allowed (per semester)</label>
                                    <input 
                                        type="number" 
                                        value={settings.maxAbsentesAllowed}
                                        onChange={(e) => handleSettingChange('maxAbsentesAllowed', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="info-box">
                                    <i className="fa fa-info-circle"></i>
                                    <p>These settings will be applied to all students unless overridden at the subject level.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2>Notification Settings</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                        />
                                        Enable Email Notifications
                                    </label>
                                    <small>Send email alerts for low attendance</small>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.smsNotifications}
                                            onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                        />
                                        Enable SMS Notifications
                                    </label>
                                    <small>Send SMS alerts (requires SMS gateway)</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="settings-section">
                            <h2>Database Backup Settings</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>Backup Frequency</label>
                                    <select 
                                        value={settings.backupFrequency}
                                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                                    >
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="backup-actions">
                                    <button className="btn-secondary"><i className="fa fa-backup"></i> Backup Now</button>
                                    <button className="btn-secondary"><i className="fa fa-history"></i> View Backups</button>
                                    <button className="btn-secondary"><i className="fa fa-undo"></i> Restore</button>
                                </div>
                                <div className="info-box">
                                    <i className="fa fa-info-circle"></i>
                                    <p>Last backup: Nov 14, 2024 at 2:30 AM</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
