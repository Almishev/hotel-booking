'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApiService from "@/lib/service/ApiService";
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import '@/lib/i18n';

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/home';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError(t('login.fillAllFields'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        try {
            const response = await ApiService.loginUser({email, password});
            console.log("Login response:", response);
            if (response.statusCode === 200) {
                console.log("Setting token:", response.token);
                console.log("Setting role:", response.role);
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                router.push(from);
            }
        } catch (error: any) {
            console.error("Login error:", error);
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="auth-container">
            <h2>{t('login.title')}</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('login.email')}: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>{t('login.password')}: </label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "●" : "○"}
                        </button>
                    </div>
                </div>
                <button type="submit">{t('login.submit')}</button>
            </form>

            <p className="register-link">
                {t('login.noAccount')} <Link href="/register">{t('navbar.register')}</Link>
            </p>
        </div>
    );
}

