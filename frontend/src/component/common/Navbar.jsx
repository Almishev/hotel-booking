import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

function Navbar() {
    const isAuthenticated = ApiService.isAuthenticated();
    const isAdmin = ApiService.isAdmin();
    const isUser = ApiService.isUser();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        const isLogout = window.confirm('Are you sure you want to logout this user?');
        if (isLogout) {
            ApiService.logout();
            navigate('/home');
        }
    };

    const handleNavClick = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/home">Phegon Hotel</NavLink>
            </div>
            <button
                className="navbar-burger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? '✖' : '☰'}
            </button>
            <ul className={`navbar-ul${menuOpen ? ' open' : ''}`}>
                <li><NavLink to="/home" activeclassname="active" onClick={handleNavClick}>Home</NavLink></li>
                <li><NavLink to="/rooms" activeclassname="active" onClick={handleNavClick}>Rooms</NavLink></li>
                <li><NavLink to="/find-booking" activeclassname="active" onClick={handleNavClick}>Find my Booking</NavLink></li>
                {isUser && <li><NavLink to="/profile" activeclassname="active" onClick={handleNavClick}>Profile</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" activeclassname="active" onClick={handleNavClick}>Admin</NavLink></li>}
                {!isAuthenticated && <li><NavLink to="/login" activeclassname="active" onClick={handleNavClick}>Login</NavLink></li>}
               {/* {!isAuthenticated && <li><NavLink to="/register" activeclassname="active" onClick={handleNavClick}>Register</NavLink></li>} */}
                {isAuthenticated && <li onClick={() => { handleLogout(); handleNavClick(); }} style={{cursor:'pointer'}}>Logout</li>}
            </ul>
        </nav>
    );
}

export default Navbar;
