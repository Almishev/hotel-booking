import React, { useState } from "react";
import { useNavigate,useLocation, Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useTranslation } from 'react-i18next';

function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

    const handleSubmit = async (e) => {
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
                navigate(from, { replace: true });
            }
        } catch (error) {
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
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{t('login.submit')}</button>
            </form>

            <p className="register-link">
                {t('login.noAccount')} <Link to={"/register"} >{t('navbar.register')}</Link>
            </p>
        </div>
    );
}

export default LoginPage;
