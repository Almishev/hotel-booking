'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUser, setIsUser] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Function to update authentication state
    const updateAuthState = () => {
        setIsAuthenticated(ApiService.isAuthenticated());
        setIsAdmin(ApiService.isAdmin());
        setIsUser(ApiService.isUser());
    };

    // Only check authentication on client side after mount
    useEffect(() => {
        setMounted(true);
        updateAuthState();
        
        // Load language from localStorage if available
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('i18nextLng');
            if (savedLanguage && ['en', 'bg', 'el'].includes(savedLanguage)) {
                i18n.changeLanguage(savedLanguage);
            }
        }
    }, []);

    // Update authentication state when pathname changes (e.g., after login/logout)
    useEffect(() => {
        if (mounted) {
            updateAuthState();
        }
    }, [pathname, mounted]);

    // Listen for storage changes (when token is set/removed in localStorage)
    useEffect(() => {
        if (!mounted) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'role') {
                updateAuthState();
            }
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events (for same-tab updates)
        const handleCustomStorageChange = () => {
            updateAuthState();
        };
        window.addEventListener('auth-change', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleCustomStorageChange);
        };
    }, [mounted]);

    const handleLogout = () => {
        const isLogout = window.confirm('Are you sure you want to logout this user?');
        if (isLogout) {
            ApiService.logout();
            router.push('/home');
        }
    };

    const handleNavClick = () => setMenuOpen(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        
        // Store language in localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('i18nextLng', lng);
        }
        
        // Don't change URL - just update i18n language
        // The language will be sent to backend when booking is made
        // URL stays the same to avoid 404 errors
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link href="/home">Phegon Hotel</Link>
            </div>
            <button
                className="navbar-burger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? '✖' : '☰'}
            </button>
            <ul className={`navbar-ul${menuOpen ? ' open' : ''}`}>
                <li><Link href="/home" className={isActive('/home') ? "active" : ""} onClick={handleNavClick}>{t('navbar.home')}</Link></li>
                <li><Link href="/rooms" className={isActive('/rooms') ? "active" : ""} onClick={handleNavClick}>{t('navbar.rooms')}</Link></li>
                <li><Link href="/find-booking" className={isActive('/find-booking') ? "active" : ""} onClick={handleNavClick}>{t('navbar.findBooking')}</Link></li>
                {mounted && isUser && <li><Link href="/profile" className={isActive('/profile') ? "active" : ""} onClick={handleNavClick}>{t('navbar.profile')}</Link></li>}
                {mounted && isAdmin && <li><Link href="/admin" className={isActive('/admin') ? "active" : ""} onClick={handleNavClick}>{t('navbar.admin')}</Link></li>}
                {mounted && !isAuthenticated && <li><Link href="/login" className={isActive('/login') ? "active" : ""} onClick={handleNavClick}>{t('navbar.login')}</Link></li>}
                {mounted && isAuthenticated && <li onClick={() => { handleLogout(); handleNavClick(); }} style={{cursor:'pointer'}}>{t('navbar.logout')}</li>}
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

