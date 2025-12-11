'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { ProtectedRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ProfilePage() {
    const { t } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log("Fetching user profile...");
                const response = await ApiService.getUserProfile();
                console.log("User profile response:", response);
                const userPlusBookings = await ApiService.getUserBookings(response.user.id);
                console.log("User bookings response:", userPlusBookings);
                setUser(userPlusBookings.user);
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                setError(error.response?.data?.message || error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        ApiService.logout();
        router.push('/home');
    };

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    return (
        <ProtectedRoute>
            <div className="profile-page">
                {user && <h2>{t('profile.welcome', { name: user.name })}</h2>}
                <div className="profile-actions">
                    <button className="edit-profile-button" onClick={handleEditProfile}>{t('profile.editProfile')}</button>
                    <button className="logout-button" onClick={handleLogout}>{t('profile.logout')}</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {user && (
                    <div className="profile-details">
                        <h3>{t('profile.myProfileDetails')}</h3>
                        <p><strong>{t('profile.email')}:</strong> {user.email}</p>
                        <p><strong>{t('profile.phoneNumber')}:</strong> {user.phoneNumber}</p>
                    </div>
                )}
                <div className="bookings-section">
                    <h3>{t('profile.myBookingHistory')}</h3>
                    <div className="booking-list">
                        {user && user.bookings && user.bookings.length > 0 ? (
                            user.bookings.map((booking: any) => (
                                <div key={booking.id} className="booking-item">
                                    <p><strong>{t('profile.bookingCode')}:</strong> {booking.bookingConfirmationCode}</p>
                                    <p><strong>{t('profile.checkInDate')}:</strong> {booking.checkInDate}</p>
                                    <p><strong>{t('profile.checkOutDate')}:</strong> {booking.checkOutDate}</p>
                                    <p><strong>{t('profile.totalGuests')}:</strong> {booking.totalNumOfGuest}</p>
                                    <p><strong>{t('profile.roomType')}:</strong> {booking.room.roomType}</p>
                                    <img src={booking.room.roomPhotoUrl} alt="Room" className="room-photo" />
                                </div>
                            ))
                        ) : (
                            <p>{t('profile.noBookings')}</p>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

