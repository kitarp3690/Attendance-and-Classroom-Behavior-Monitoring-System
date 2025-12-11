import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Notifications from "./Notifications";
import AvatarDropdown from "./AvatarDropdown";
import DarkLightToggle from "./DarkLightToggle";
import "./Navbar.css";

export default function Navbar({ theme, onToggleTheme }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const getRoleLabel = (role) => {
        const roleMap = {
            admin: 'Administrator',
            teacher: 'Teacher',
            hod: 'Head of Department',
            student: 'Student'
        };
        return roleMap[role] || role;
    };

    const getRoleIcon = (role) => {
        const roleIconMap = {
            admin: 'fa-shield',
            teacher: 'fa-chalkboard-user',
            hod: 'fa-users',
            student: 'fa-user-graduate'
        };
        return roleIconMap[role] || 'fa-user';
    };

    const handleLogoClick = () => {
        // Refresh current user's dashboard
        const role = user?.role || 'student';
        navigate(`/${role}`);
        window.location.reload();
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 0) {
            // Mock search results - replace with actual API call
            const mockResults = [
                { type: 'Class', name: `Search results for "${query}"`, icon: 'fa-chalkboard' },
                { type: 'Student', name: 'No results found', icon: 'fa-user-graduate' },
            ];
            setSearchResults(mockResults);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const handleSearchBlur = () => {
        // Delay to allow click on results
        setTimeout(() => setShowSearchResults(false), 200);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }} title="Refresh Dashboard">
                    <i className="fa fa-graduation-cap"></i>
                </div>
                <div className="navbar-title-group">
                    <span className="navbar-title">Khwopa</span>
                    <span className="navbar-subtitle">
                        <i className={`fa ${getRoleIcon(user?.role)}`}></i>
                        {getRoleLabel(user?.role)}
                    </span>
                </div>
            </div>
            
            <div className="navbar-right">
                <div className="navbar-search">
                    <input 
                        type="search" 
                        placeholder="Search classes, students, records..." 
                        aria-label="Global search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery && setShowSearchResults(true)}
                        onBlur={handleSearchBlur}
                    />
                    <i className="fa fa-search"></i>
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                            {searchResults.map((result, index) => (
                                <div key={index} className="search-result-item">
                                    <i className={`fa ${result.icon}`}></i>
                                    <div className="search-result-info">
                                        <span className="search-result-type">{result.type}</span>
                                        <span className="search-result-name">{result.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="navbar-divider"></div>

                {user && (
                    <div className="navbar-user-info">
                        <div className="user-details">
                            <span className="user-name">{user.first_name || user.username || 'User'}</span>
                            <span className="user-role">{getRoleLabel(user.role)}</span>
                        </div>
                    </div>
                )}

                <DarkLightToggle theme={theme} onToggle={onToggleTheme} />
                <Notifications role={user?.role} />
                <AvatarDropdown role={user?.role} />
            </div>
        </nav>
    );
}