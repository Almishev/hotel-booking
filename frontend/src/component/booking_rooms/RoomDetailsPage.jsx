import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService'; // Assuming your service is in a file called ApiService.js
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
// import 'react-datepicker/dist/react-datepicker.css';

const RoomDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Access the navigate function to navigate
  const { roomId } = useParams(); // Get room ID from URL parameters
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track any errors
  const [checkInDate, setCheckInDate] = useState(null); // State variable for check-in date
  const [checkOutDate, setCheckOutDate] = useState(null); // State variable for check-out date
  const [numAdults, setNumAdults] = useState(1); // State variable for number of adults
  const [numChildren, setNumChildren] = useState(0); // State variable for number of children
  const [totalPrice, setTotalPrice] = useState(0); // State variable for total booking price
  const [totalGuests, setTotalGuests] = useState(1); // State variable for total number of guests
  const [showDatePicker, setShowDatePicker] = useState(false); // State variable to control date picker visibility
  const [userId, setUserId] = useState(''); // Set user id
  const [showMessage, setShowMessage] = useState(false); // State variable to control message visibility
  const [confirmationCode, setConfirmationCode] = useState(''); // State variable for booking confirmation code
  const [errorMessage, setErrorMessage] = useState(''); // State variable for error message

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Set loading state to true
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
        const userProfile = await ApiService.getUserProfile();
        setUserId(userProfile.user.id);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching or error
      }
    };
    fetchData();
  }, [roomId]); // Re-run effect when roomId changes

  // Calculate price and guests whenever dates or guest numbers change
  useEffect(() => {
    if (checkInDate && checkOutDate && roomDetails) {
      // Calculate total number of days
      const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;

      // Calculate total number of guests
      const totalGuests = numAdults + numChildren;

      // Calculate total price
      const roomPricePerNight = roomDetails.roomPrice;
      const totalPrice = roomPricePerNight * totalDays;

      setTotalPrice(totalPrice);
      setTotalGuests(totalGuests);
    }
  }, [checkInDate, checkOutDate, numAdults, numChildren, roomDetails]);

  const acceptBooking = async () => {
    // Check if check-in and check-out dates are selected
    if (!checkInDate || !checkOutDate) {
      setErrorMessage(t('rooms.selectCheckIn') + ' / ' + t('rooms.selectCheckOut'));
      setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
      return;
    }

    // Check if number of adults and children are valid
    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage(t('rooms.booking') + ': ' + t('login.fillAllFields'));
      setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
      return;
    }

    try {
      // Ensure checkInDate and checkOutDate are Date objects
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      // Convert dates to YYYY-MM-DD format, adjusting for time zone differences
      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      // Create booking object
      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        numOfAdults: numAdults,
        numOfChildren: numChildren
      };
      // Make booking
      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode); // Set booking confirmation code
        setShowMessage(true); // Show message
        // Hide message and navigate to homepage after 5 seconds
        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms'); // Navigate to rooms
        }, 10000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
    }
  };

  if (isLoading) {
    return <p className='room-detail-loading'>{t('rooms.loading')}</p>;
  }

  if (error) {
    return <p className='room-detail-loading'>{error}</p>;
  }

  if (!roomDetails) {
    return <p className='room-detail-loading'>{t('rooms.notFound')}</p>;
  }

  const { roomType, roomPrice, roomPhotoUrl, roomDescription, bookings } = roomDetails;

  return (
    <div className="room-details-booking">
      {showMessage && (
        <p className="booking-success-message">
          {t('rooms.bookingSuccess', { code: confirmationCode })}
        </p>
      )}
      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}
      <h2>{t('rooms.roomDetails')}</h2>
      <br />
      <img src={roomPhotoUrl} alt={roomType} className="room-details-image" />
      <div className="room-details-info">
        <h3>{roomType}</h3>
        <p>{t('rooms.price')}: ${roomPrice} {t('rooms.perNight')}</p>
        {roomDescription && roomDescription.trim() !== '' ? (
          <p><strong>{t('rooms.description')}:</strong> {roomDescription}</p>
        ) : (
          <p><strong>{t('rooms.description')}:</strong> <em>{t('rooms.noDescription')}</em></p>
        )}
      </div>
      {bookings && bookings.length > 0 && (
        <div>
          <h3>{t('rooms.existingBookings')}</h3>
          <ul className="booking-list">
            {bookings.map((booking, index) => (
              <li key={booking.id} className="booking-item">
                <span className="booking-number">{t('rooms.booking')} {index + 1} </span>
                <span className="booking-text">{t('rooms.checkIn')}: {booking.checkInDate} </span>
                <span className="booking-text">{t('rooms.checkOut')}: {booking.checkOutDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="booking-info">
        <div className="book-now-div">
          <button className="book-now-button" onClick={() => setShowDatePicker(true)}>{t('rooms.bookNow')}</button>
          <button className="go-back-button" onClick={() => setShowDatePicker(false)}>{t('rooms.goBack')}</button>
        </div>
        {showDatePicker && (
          <div className="date-picker-container">
            <div className="booking-form-section">
              <h4>{t('rooms.selectDates')}</h4>
              <div className="date-inputs">
                <DatePicker
                  className="detail-search-field datepicker-input"
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  placeholderText={t('rooms.selectCheckIn')}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  wrapperClassName="datepicker-wrapper"
                />
                <DatePicker
                  className="detail-search-field datepicker-input"
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate}
                  placeholderText={t('rooms.selectCheckOut')}
                  dateFormat="dd/MM/yyyy"
                  wrapperClassName="datepicker-wrapper"
                />
              </div>
            </div>
            
            <div className="booking-form-section">
              <h4>{t('rooms.guests')}</h4>
              <div className="guests-inputs">
                <div className="guest-input-group">
                  <label>{t('rooms.adults')}:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={numAdults}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
                        setNumAdults(value === '' ? 1 : parseInt(value));
                      }
                    }}
                    placeholder="1"
                  />
                </div>
                <div className="guest-input-group">
                  <label>{t('rooms.children')}:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={numChildren}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
                        setNumChildren(value === '' ? 0 : parseInt(value));
                      }
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {(checkInDate && checkOutDate) && (
              <div className="booking-summary">
                <div className="total-price-guests">
                  <span className="price-display">{t('rooms.totalPrice')}: ${totalPrice}</span>
                  <span className="guests-display">{t('rooms.totalGuests')}: {totalGuests}</span>
                </div>
                <button className="confirm-booking-button" onClick={acceptBooking}>
                  {t('rooms.confirmBooking')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomDetailsPage;
