package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.AdminBookingRequest;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Booking;

public interface IBookingService {

    Response saveBooking(Long roomId, Long userId, Booking bookingRequest, String language);

    Response findBookingByConfirmationCode(String confirmationCode);

    Response getAllBookings();

    Response cancelBooking(Long bookingId);

    /**
     * Creates a booking from the admin panel.
     * If userId is provided in the request, the booking is created for that user.
     * Otherwise, a new user is created based on the guest details in the request.
     */
    Response createAdminBooking(Long roomId, AdminBookingRequest request);

}
