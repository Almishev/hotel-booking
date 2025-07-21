import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import { useTranslation } from 'react-i18next';

function Navbar() {
    const { t, i18n } = useTranslation();
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

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

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
                <li><NavLink to="/home" activeClassName="active" onClick={handleNavClick}>{t('navbar.home')}</NavLink></li>
                <li><NavLink to="/rooms" activeClassName="active" onClick={handleNavClick}>{t('navbar.rooms')}</NavLink></li>
                <li><NavLink to="/find-booking" activeClassName="active" onClick={handleNavClick}>{t('navbar.findBooking')}</NavLink></li>
                {isUser && <li><NavLink to="/profile" activeClassName="active" onClick={handleNavClick}>{t('navbar.profile')}</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" activeClassName="active" onClick={handleNavClick}>{t('navbar.admin')}</NavLink></li>}
                {!isAuthenticated && <li><NavLink to="/login" activeClassName="active" onClick={handleNavClick}>{t('navbar.login')}</NavLink></li>}
                {/* {!isAuthenticated && <li><NavLink to="/register" activeClassName="active" onClick={handleNavClick}>{t('navbar.register')}</NavLink></li>} */}
                {isAuthenticated && <li onClick={() => { handleLogout(); handleNavClick(); }} style={{cursor:'pointer'}}>{t('navbar.logout')}</li>}
                <li className="navbar-flags" style={{marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{background: i18n.language === 'bg' ? '#e0f2f1' : '#f5f5f5', padding: '2px 6px', borderRadius: 5, border: i18n.language === 'bg' ? '2px solid #00796b' : '1px solid #ccc', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => changeLanguage('bg')}>
                        <img src="/assets/flags/bg.svg" alt="BG" style={{width: 28, height: 20, display: 'block'}} />
                    </span>
                    <span style={{background: i18n.language === 'el' ? '#e0f2f1' : '#f5f5f5', padding: '2px 6px', borderRadius: 5, border: i18n.language === 'el' ? '2px solid #00796b' : '1px solid #ccc', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => changeLanguage('el')}>
                        <img src="/assets/flags/gr.svg" alt="EL" style={{width: 28, height: 20, display: 'block'}} />
                    </span>
                    <span style={{background: i18n.language === 'en' ? '#e0f2f1' : '#f5f5f5', padding: '2px 6px', borderRadius: 5, border: i18n.language === 'en' ? '2px solid #00796b' : '1px solid #ccc', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => changeLanguage('en')}>
                        <img src="/assets/flags/gb.svg" alt="EN" style={{width: 28, height: 20, display: 'block'}} />
                    </span>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
