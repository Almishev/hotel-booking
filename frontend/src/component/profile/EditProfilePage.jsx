import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import { useTranslation } from 'react-i18next';

const EditProfilePage = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await ApiService.getUserProfile();
                setUser(response.user);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleDeleteProfile = async () => {
        if (!window.confirm(t('profile.confirmDelete'))) {
            return;
        }
        try {
            await ApiService.deleteUser(user.id);
            navigate('/signup');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="edit-profile-page">
            <h2>{t('profile.editProfile')}</h2>
            {error && <p className="error-message">{error}</p>}
            {user && (
                <div className="profile-details">
                    <p><strong>{t('profile.name')}:</strong> {user.name}</p>
                    <p><strong>{t('profile.email')}:</strong> {user.email}</p>
                    <p><strong>{t('profile.phoneNumber')}:</strong> {user.phoneNumber}</p>
                    <button className="delete-profile-button" onClick={handleDeleteProfile}>{t('profile.deleteProfile')}</button>
                </div>
            )}
        </div>
    );
};

export default EditProfilePage;
