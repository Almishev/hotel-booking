'use client';

import { useState } from 'react';
import ApiService from '@/lib/service/ApiService';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import '@/lib/i18n';

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const { name, email, password, phoneNumber } = formData;
        if (!name || !email || !password || !phoneNumber) {
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setErrorMessage(t('register.fillAllFields'));
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }
        try {
            const response = await ApiService.registerUser(formData);

            if (response.statusCode === 200) {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phoneNumber: ''
                });
                setSuccessMessage(t('register.success'));
                setTimeout(() => {
                    setSuccessMessage('');
                    router.push('/home');
                }, 3000);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    return (
        <div className="auth-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
            <h2>{t('register.title')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('register.name')}:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>{t('register.email')}:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>{t('register.phoneNumber') || 'Phone Number'}:</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>{t('register.password')}:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <button type="submit">{t('register.submit')}</button>
            </form>
            <p className="register-link">
                {t('register.alreadyAccount') || 'Already have an account?'} <Link href="/login">{t('navbar.login')}</Link>
            </p>
        </div>
    );
}

