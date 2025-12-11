'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function EditBookingPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const bookingCode = params.bookingCode as string;
    
    const [booking, setBooking] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await ApiService.getBookingByConfirmationCode(bookingCode);
                setBooking(response.booking);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
            }
        };
        fetchBooking();
    }, [bookingCode]);

    const cancelBooking = async () => {
        if (!window.confirm(t('admin.confirmAcheive'))) {
            return;
        }
        try {
            const response = await ApiService.cancelBooking(booking.id);
            if (response.statusCode === 200) {
                setSuccess(t('admin.successAcheive'));
                setTimeout(() => {
                    setSuccess('');
                    router.push('/admin/manage-bookings');
                }, 3000);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!booking) {
        return <div>{t('findBooking.loading')}</div>;
    }

    return (
        <AdminRoute>
            <div className="find-booking-page">
                <h2>{t('admin.editBooking')}</h2>
                {error && <p className='error-message'>{error}</p>}
                {success && <p className='success-message'>{success}</p>}
                {booking && (
                    <div className="booking-details">
                        <h3>{t('admin.bookingDetails')}</h3>
                        <p>{t('admin.bookingCode')}: {booking.bookingConfirmationCode}</p>
                        <p>{t('admin.checkInDate')}: {booking.checkInDate}</p>
                        <p>{t('admin.checkOutDate')}: {booking.checkOutDate}</p>
                        <p>{t('rooms.numOfAdults') || 'Num Of Adults'}: {booking.numOfAdults}</p>
                        <p>{t('rooms.numOfChildren') || 'Num Of Children'}: {booking.numOfChildren}</p>
                        {booking.guestEmail && <p>{t('profile.email')}: {booking.guestEmail}</p>}

                        <br />
                        <hr />
                        <br />
                        <h3>{t('admin.bookerDetails')}</h3>
                        <div>
                            <p>{t('profile.name')}: {booking.user.name}</p>
                            <p>{t('profile.email')}: {booking.user.email}</p>
                            <p>{t('profile.phoneNumber')}: {booking.user.phoneNumber}</p>
                        </div>

                        <br />
                        <hr />
                        <br />
                        <h3>{t('rooms.roomDetails')}</h3>
                        <div>
                            <p>{t('rooms.roomType')}: {booking.room.roomType}</p>
                            <p>{t('rooms.price')}: ${booking.room.roomPrice}</p>
                            <p>{t('rooms.description')}: {booking.room.roomDescription}</p>
                            <img src={booking.room.roomPhotoUrl} alt={booking.room.roomType} />
                        </div>
                        <button
                            className="acheive-booking"
                            onClick={() => cancelBooking()}
                        >
                            {t('admin.acheiveBooking')}
                        </button>
                    </div>
                )}
            </div>
        </AdminRoute>
    );
}

