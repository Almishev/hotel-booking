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
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <button onClick={handleSearch}>{t('findBooking.find')}</button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {bookingDetails && (
                <div className="booking-details">
                    <h3>{t('findBooking.bookingDetails')}</h3>
                    <p><strong>{t('findBooking.confirmationCode')}:</strong> {bookingDetails.bookingConfirmationCode}</p>
                    <p><strong>{t('findBooking.checkInDate')}:</strong> {bookingDetails.checkInDate}</p>
                    <p><strong>{t('findBooking.checkOutDate')}:</strong> {bookingDetails.checkOutDate}</p>
                    <p><strong>{t('findBooking.numOfAdults')}:</strong> {bookingDetails.numOfAdults}</p>
                    <p><strong>{t('findBooking.numOfChildren')}:</strong> {bookingDetails.numOfChildren}</p>

                    <hr />
                    <h3>{t('findBooking.bookerDetails')}</h3>
                    <div>
                        <p><strong>{t('findBooking.name')}:</strong> {bookingDetails.user.name}</p>
                        <p><strong>{t('findBooking.email')}:</strong> {bookingDetails.user.email}</p>
                        <p><strong>{t('findBooking.phoneNumber')}:</strong> {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <hr />
                    <h3>{t('findBooking.roomDetails')}</h3>
                    <div>
                        <p><strong>{t('findBooking.roomType')}:</strong> {bookingDetails.room.roomType}</p>
                        <img src={bookingDetails.room.roomPhotoUrl} alt={bookingDetails.room.roomType} />
                    </div>
                </div>
            )}
        </div>
    );
}

