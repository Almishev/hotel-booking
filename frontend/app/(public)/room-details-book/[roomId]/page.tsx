'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function RoomDetailsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const packageId = searchParams.get('packageId');
  
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [isPackageBooking, setIsPackageBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        const response = await ApiService.getRoomById(roomId);
        if (response && response.room) {
          setRoomDetails(response.room);
        } else {
          setError(t('rooms.notFound') || 'Room not found');
        }
        
        // If packageId is provided, fetch package details
        if (packageId) {
          try {
            const packageResponse = await ApiService.getHolidayPackageById(packageId);
            if (packageResponse && packageResponse.holidayPackage) {
              const pkg = packageResponse.holidayPackage;
              setPackageDetails(pkg);
              setIsPackageBooking(true);
              
              // Set dates from package
              if (pkg.startDate && pkg.endDate) {
                setCheckInDate(new Date(pkg.startDate));
                setCheckOutDate(new Date(pkg.endDate));
              }
            }
          } catch (pkgError: any) {
            console.error('Error fetching package details:', pkgError);
            // Continue without package - user can still book normally
          }
        }
        // Don't fetch user profile here - userId is only needed when booking
      } catch (error: any) {
        console.error('Error fetching room details:', error);
        setError(error.response?.data?.message || error.message || t('rooms.notFound') || 'Room not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId, packageId]);

  useEffect(() => {
    // If it's a package booking, use package price for the room type
    if (isPackageBooking && packageDetails && roomDetails) {
      const totalGuests = numAdults + numChildren;
      setTotalGuests(totalGuests);
      
      // Set price from package - използвай цената за конкретния тип стая
      if (packageDetails.roomTypePrices && roomDetails.roomType) {
        const priceForRoomType = packageDetails.roomTypePrices[roomDetails.roomType];
        if (priceForRoomType) {
          setTotalPrice(parseFloat(priceForRoomType.toString()));
        }
      }
      return;
    }
    
    if (checkInDate && checkOutDate && roomDetails) {
      const oneDay = 24 * 60 * 60 * 1000;
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      // Calculate number of nights (not days) - check-in to check-out
      // Example: 24/12 to 26/12 = 2 nights (24-25 and 25-26)
      const totalNights = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
      const totalGuests = numAdults + numChildren;
      const roomPricePerNight = roomDetails.roomPrice;
      const totalPrice = roomPricePerNight * totalNights;
      setTotalPrice(totalPrice);
      setTotalGuests(totalGuests);
    }
  }, [checkInDate, checkOutDate, numAdults, numChildren, roomDetails, isPackageBooking, packageDetails]);

  const handleBookNow = () => {
    // Check if user is authenticated before showing date picker
    if (!ApiService.isAuthenticated()) {
      setErrorMessage(t('rooms.pleaseLoginToBook') || 'Please login to book a room');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }
    // If it's a package booking, dates are already set - just show the booking form
    // If it's a normal booking, show date picker
    setShowDatePicker(true);
  };

  const acceptBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMessage(t('rooms.selectCheckIn') + ' / ' + t('rooms.selectCheckOut'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage(t('rooms.booking') + ': ' + t('login.fillAllFields'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    // Check if user is authenticated before booking - fetch userId if needed
    if (!ApiService.isAuthenticated()) {
      setErrorMessage(t('rooms.pleaseLoginToBook') || 'Please login to book a room');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // Get userId if not already set
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        console.log("Fetching user profile to get userId...");
        const userProfile = await ApiService.getUserProfile();
        console.log("User profile response:", userProfile);
        // Safely check for user id using optional chaining
        if (userProfile?.user?.id) {
          currentUserId = userProfile.user.id;
          setUserId(currentUserId);
          console.log("UserId set to:", currentUserId);
        } else {
          console.error("User profile does not contain user id:", userProfile);
          setErrorMessage(t('rooms.pleaseLoginToBook') || 'Please login to book a room');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
      } catch (profileError: any) {
        console.error("Error fetching user profile:", profileError);
        console.error("Error response:", profileError.response);
        // Check if it's an authentication error
        if (profileError.response?.status === 401 || profileError.response?.status === 403) {
          setErrorMessage(t('rooms.pleaseLoginToBook') || 'Please login to book a room');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setErrorMessage(profileError.response?.data?.message || profileError.message || t('rooms.errorFetchingProfile'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setErrorMessage(''), 10000);
        }
        return;
      }
    }

    try {
      console.log("Creating booking with:", { roomId, currentUserId, checkInDate, checkOutDate, numAdults, numChildren });
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      const booking: any = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        numOfAdults: numAdults,
        numOfChildren: numChildren,
        language: i18n.language || 'en' // Add current language
      };
      
      // If it's a package booking, include holidayPackage
      if (isPackageBooking && packageDetails) {
        booking.holidayPackage = {
          id: packageDetails.id
        };
      }
      
      console.log("Sending booking request:", booking);
      const response = await ApiService.bookRoom(roomId, currentUserId, booking);
      console.log("Booking response:", response);
      
      if (response && response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setShowMessage(false);
          router.push('/rooms');
        }, 10000);
      } else if (response && response.statusCode) {
        // Backend returned an error response (not an exception)
        const backendMessage = response.message || '';
        // Map backend error messages to translations
        if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('available')) {
          setErrorMessage(t('rooms.roomNotAvailable'));
        } else if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.roomNotFound'));
        } else if (backendMessage.toLowerCase().includes('user') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.userNotFound'));
        } else if (backendMessage.toLowerCase().includes('check in date') || backendMessage.toLowerCase().includes('check out date')) {
          setErrorMessage(t('rooms.invalidDates'));
        } else {
          // Use translation, fallback to generic error message
          setErrorMessage(t('rooms.bookingFailed'));
        }
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErrorMessage(''), 10000);
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      console.error("Error response:", error.response);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorMessage(t('rooms.pleaseLoginToBook') || 'Please login to book a room');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        // Backend returned 404 with error message in response body
        // Check if it's the room availability error
        const backendMessage = error.response?.data?.message || '';
        // Map backend error messages to translations
        if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('available')) {
          setErrorMessage(t('rooms.roomNotAvailable'));
        } else if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.roomNotFound'));
        } else if (backendMessage.toLowerCase().includes('user') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.userNotFound'));
        } else if (backendMessage.toLowerCase().includes('check in date') || backendMessage.toLowerCase().includes('check out date')) {
          setErrorMessage(t('rooms.invalidDates'));
        } else {
          // Use translation for unknown errors
          setErrorMessage(t('rooms.roomNotAvailable'));
        }
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErrorMessage(''), 10000);
      } else {
        // Other errors - try to map backend message to translation
        const backendMessage = error.response?.data?.message || error.message || '';
        if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('available')) {
          setErrorMessage(t('rooms.roomNotAvailable'));
        } else if (backendMessage.toLowerCase().includes('room') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.roomNotFound'));
        } else if (backendMessage.toLowerCase().includes('user') && backendMessage.toLowerCase().includes('not found')) {
          setErrorMessage(t('rooms.userNotFound'));
        } else if (backendMessage.toLowerCase().includes('check in date') || backendMessage.toLowerCase().includes('check out date')) {
          setErrorMessage(t('rooms.invalidDates'));
        } else {
          // Use translation for unknown errors
          setErrorMessage(t('rooms.errorCreatingBooking'));
        }
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErrorMessage(''), 10000);
      }
    }
  };

  if (isLoading) {
    return <div className="room-detail-loading">{t('rooms.loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!roomDetails) {
    return <div className="error-message">{t('rooms.notFound')}</div>;
  }

  // Safely extract room details with defaults using optional chaining
  const roomType = roomDetails?.roomType || '';
  const roomPrice = roomDetails?.roomPrice || 0;
  const roomPhotoUrl = roomDetails?.roomPhotoUrl || '';
  const roomDescription = roomDetails?.roomDescription || '';
  const bookings = Array.isArray(roomDetails?.bookings) ? roomDetails.bookings : [];

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
            {isPackageBooking && packageDetails ? (
          <>
            <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '2px solid #2196f3' }}>
              <h4 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>{t('packages.packageBooking')}: {packageDetails.name}</h4>
              <p><strong>{t('packages.dates')}:</strong> {new Date(packageDetails.startDate).toLocaleDateString()} - {new Date(packageDetails.endDate).toLocaleDateString()}</p>
              {packageDetails.roomTypePrices && roomDetails?.roomType && packageDetails.roomTypePrices[roomDetails.roomType] ? (
                <p><strong>{t('packages.price')}:</strong> €{packageDetails.roomTypePrices[roomDetails.roomType]}</p>
              ) : null}
              {packageDetails.description && (
                <p><strong>{t('packages.description')}:</strong> {packageDetails.description}</p>
              )}
            </div>
            <p style={{ textDecoration: 'line-through', color: '#999' }}>
              {t('rooms.price')}: €{roomPrice} {t('rooms.perNight')}
            </p>
            {packageDetails.roomTypePrices && roomDetails?.roomType && packageDetails.roomTypePrices[roomDetails.roomType] ? (
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00796b' }}>
                {t('packages.packagePrice')}: €{packageDetails.roomTypePrices[roomDetails.roomType]}
              </p>
            ) : null}
          </>
        ) : (
          <p>{t('rooms.price')}: €{roomPrice} {t('rooms.perNight')}</p>
        )}
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
            {bookings.map((booking: any, index: number) => (
              <li key={booking?.id || `booking-${index}`} className="booking-item">
                <span className="booking-number">{t('rooms.booking')} {index + 1} </span>
                <span className="booking-text">{t('rooms.checkIn')}: {booking?.checkInDate || ''} </span>
                <span className="booking-text">{t('rooms.checkOut')}: {booking?.checkOutDate || ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="booking-info">
        <div className="book-now-div">
          <button className="book-now-button" onClick={handleBookNow}>{t('rooms.bookNow')}</button>
          <button className="go-back-button" onClick={() => setShowDatePicker(false)}>{t('rooms.goBack')}</button>
        </div>
        {showDatePicker && (
          <div className="date-picker-container">
            {isPackageBooking && packageDetails ? (
              <div className="booking-form-section" style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ color: '#1976d2' }}>{t('packages.packageBooking')}: {packageDetails.name}</h4>
                <p><strong>{t('packages.dates')}:</strong> {new Date(packageDetails.startDate).toLocaleDateString()} - {new Date(packageDetails.endDate).toLocaleDateString()}</p>
                {packageDetails.roomTypePrices && roomDetails?.roomType && packageDetails.roomTypePrices[roomDetails.roomType] ? (
                  <p><strong>{t('packages.price')}:</strong> €{packageDetails.roomTypePrices[roomDetails.roomType]}</p>
                ) : null}
              </div>
            ) : (
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
                    minDate={checkInDate || new Date()}
                    placeholderText={t('rooms.selectCheckOut')}
                    dateFormat="dd/MM/yyyy"
                    wrapperClassName="datepicker-wrapper"
                  />
                </div>
              </div>
            )}
            
            <div className="booking-form-section">
              <h4>{t('rooms.guests')}</h4>
              <div className="guests-inputs">
                <div className="guest-input-group">
                  <label>{t('rooms.adults')}:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={numAdults}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= 10) {
                        setNumAdults(value);
                      }
                    }}
                    placeholder="1"
                  />
                </div>
                <div className="guest-input-group">
                  <label>{t('rooms.children')}:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={numChildren}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0 && value <= 10) {
                        setNumChildren(value);
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
                  <span className="price-display">{t('rooms.totalPrice')}: €{totalPrice}</span>
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
