'use client';

import { useState } from 'react';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function FindBookingPage() {
    const { t } = useTranslation();
    const [confirmationCode, setConfirmationCode] = useState('');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!confirmationCode.trim()) {
            setError(t('findBooking.fillCode'));
            setTimeout(() => setError(''), 5000);
            return;
        }
        try {
            const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
            setBookingDetails(response.booking);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="find-booking-page">
            <h2>{t('findBooking.findBooking')}</h2>
            <div className="search-container">
                <input
                    required
                    type="text"
                    placeholder={t('findBooking.enterCode')}
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <button onClick={handleSearch}>{t('findBooking.find')}</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {bookingDetails && (
                <div className="booking-details">
                    <h3>{t('findBooking.bookingDetails')}</h3>
                    <p>{t('findBooking.confirmationCode')}: {bookingDetails.bookingConfirmationCode}</p>
                    <p>{t('findBooking.checkInDate')}: {bookingDetails.checkInDate}</p>
                    <p>{t('findBooking.checkOutDate')}: {bookingDetails.checkOutDate}</p>
                    <p>{t('findBooking.numOfAdults')}: {bookingDetails.numOfAdults}</p>
                    <p>{t('findBooking.numOfChildren')}: {bookingDetails.numOfChildren}</p>

                    <br />
                    <hr />
                    <br />
                    <h3>{t('findBooking.bookerDetails')}</h3>
                    <div>
                        <p> {t('findBooking.name')}: {bookingDetails.user.name}</p>
                        <p> {t('findBooking.email')}: {bookingDetails.user.email}</p>
                        <p> {t('findBooking.phoneNumber')}: {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <br />
                    <hr />
                    <br />
                    <h3>{t('findBooking.roomDetails')}</h3>
                    <div>
                        <p> {t('findBooking.roomType')}: {bookingDetails.room.roomType}</p>
                        <img src={bookingDetails.room.roomPhotoUrl} alt="" />
                    </div>
                </div>
            )}
        </div>
    );
}

