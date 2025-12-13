import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService'; // Assuming your service is in a file called ApiService.js
import { useTranslation } from 'react-i18next';

const EditBookingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { bookingCode } = useParams();
    const [bookingDetails, setBookingDetails] = useState(null); // State variable for booking details
    const [error, setError] = useState(null); // Track any errors
    const [success, setSuccessMessage] = useState(null); // Track any errors



    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await ApiService.getBookingByConfirmationCode(bookingCode);
                setBookingDetails(response.booking);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchBookingDetails();
    }, [bookingCode]);


    const acheiveBooking = async (bookingId) => {
        if (!window.confirm(t('admin.confirmAcheive'))) {
            return; // Do nothing if the user cancels
        }

        try {
            const response = await ApiService.cancelBooking(bookingId);
            if (response.statusCode === 200) {
                setSuccessMessage(t('admin.successAcheive'))
                
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/admin/manage-bookings');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="find-booking-page">
            <h2>{t('admin.editBooking')}</h2>
            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}
            {bookingDetails && (
                <div className="booking-details">
                    <h3>{t('admin.bookingDetails')}</h3>
                    <p>{t('admin.bookingCode')}: {bookingDetails.bookingConfirmationCode}</p>
                    <p>{t('admin.checkInDate')}: {bookingDetails.checkInDate}</p>
                    <p>{t('admin.checkOutDate')}: {bookingDetails.checkOutDate}</p>
                    <p>{t('rooms.numOfAdults')}: {bookingDetails.numOfAdults}</p>
                    <p>{t('rooms.numOfChildren')}: {bookingDetails.numOfChildren}</p>
                    <p>{t('profile.email')}: {bookingDetails.guestEmail}</p>

                    <br />
                    <hr />
                    <br />
                    <h3>{t('admin.bookerDetails')}</h3>
                    <div>
                        <p>{t('profile.name')}: {bookingDetails.user.name}</p>
                        <p>{t('profile.email')}: {bookingDetails.user.email}</p>
                        <p>{t('profile.phoneNumber')}: {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <br />
                    <hr />
                    <br />
                    <h3>{t('rooms.roomDetails')}</h3>
                    <div>
                        <p>{t('rooms.roomType')}: {bookingDetails.room.roomType}</p>
                        <p>{t('rooms.price')}: €{bookingDetails.room.roomPrice}</p>
                        <p>{t('rooms.description')}: {bookingDetails.room.roomDescription}</p>
                        <img src={bookingDetails.room.roomPhotoUrl} alt="" sizes="" srcSet="" />
                    </div>
                    <button
                        className="acheive-booking"
                        onClick={() => acheiveBooking(bookingDetails.id)}>{t('admin.acheiveBooking')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditBookingPage;
