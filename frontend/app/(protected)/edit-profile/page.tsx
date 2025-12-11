'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { ProtectedRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function EditProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await ApiService.getUserProfile();
                setUser(response.user);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
            }
        };
        fetchUser();
    }, []);

    const handleDelete = async () => {
        if (!window.confirm(t('profile.confirmDelete'))) {
            return;
        }
        try {
            await ApiService.deleteUser(user.id);
            ApiService.logout();
            router.push('/home');
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
        }
    };

    if (!user) {
        return <div>{t('rooms.loading')}</div>;
    }

    return (
        <ProtectedRoute>
            <div className="edit-profile-page">
                <h2>{t('profile.editProfile')}</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="profile-details">
                    <p><strong>{t('profile.name')}:</strong> {user.name}</p>
                    <p><strong>{t('profile.email')}:</strong> {user.email}</p>
                    <p><strong>{t('profile.phoneNumber')}:</strong> {user.phoneNumber}</p>
                </div>
                <button className="delete-profile-button" onClick={handleDelete}>
                    {t('profile.deleteProfile')}
                </button>
            </div>
        </ProtectedRoute>
    );
}

