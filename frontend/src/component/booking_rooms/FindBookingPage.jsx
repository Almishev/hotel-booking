import React, { useState } from 'react';
import ApiService from '../../service/ApiService'; // Assuming your service is in a file called ApiService.js
import { useTranslation } from 'react-i18next';

const FindBookingPage = () => {
    const { t } = useTranslation();
    const [confirmationCode, setConfirmationCode] = useState(''); // State variable for confirmation code
    const [bookingDetails, setBookingDetails] = useState(null); // State variable for booking details
    const [error, setError] = useState(null); // Track any errors

    const handleSearch = async () => {
        if (!confirmationCode.trim()) {
            setError(t('findBooking.fillCode'));
            setTimeout(() => setError(''), 5000);
            return;
        }
        try {
            // Call API to get booking details
            const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
            setBookingDetails(response.booking);
            setError(null); // Clear error if successful
        } catch (error) {
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
                        <img src={bookingDetails.room.roomPhotoUrl} alt="" sizes="" srcSet="" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBookingPage;
