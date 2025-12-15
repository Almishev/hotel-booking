'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiService from '@/lib/service/ApiService';
import { StaffRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AdminPage() {
    const { t } = useTranslation();
    const [adminName, setAdminName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
                const fetchAdminName = async () => {
            try {
                const response = await ApiService.getUserProfile();
                setAdminName(response.user.name);
                setIsAdmin(ApiService.isAdmin());
            } catch (error: any) {
                console.error('Error fetching admin details:', error.message);
            }
        };

        fetchAdminName();
    }, []);

    return (
        <StaffRoute>
            <div className="admin-page">
                <h1 className="welcome-message">{t('admin.welcome', { name: adminName })}</h1>
                <div className="admin-actions">
                    {isAdmin && (
                        <button className="admin-button" onClick={() => router.push('/admin/manage-rooms')}>
                            {t('admin.manageRooms')}
                        </button>
                    )}
                    <button className="admin-button" onClick={() => router.push('/admin/manage-bookings')}>
                        {t('admin.manageBookings')}
                    </button>
                    <button className="admin-button" onClick={() => router.push('/admin/add-booking')}>
                        {t('admin.addBooking') || 'Нова резервация от рецепция'}
                    </button>
                    {isAdmin && (
                        <button className="admin-button" onClick={() => router.push('/admin/manage-packages')}>
                            {t('admin.managePackages')}
                        </button>
                    )}
                </div>
            </div>
        </StaffRoute>
    );
}

