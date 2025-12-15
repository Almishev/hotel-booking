package com.phegondev.PhegonHotel.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminBookingRequest {

    private Long userId; // optional - if null, create new user

    // Guest details (for creating a new user or reference)
    private String guestName;
    private String guestEmail;
    private String guestPhoneNumber;

    // Booking details
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private int numOfAdults;
    private int numOfChildren;

    // Optional holiday package
    private Long holidayPackageId;

    // Preferred language for emails / user profile (optional)
    private String language;
}
