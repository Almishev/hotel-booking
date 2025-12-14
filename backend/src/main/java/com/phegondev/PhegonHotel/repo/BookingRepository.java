package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingConfirmationCode(String confirmationCode);
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.room JOIN FETCH b.user LEFT JOIN FETCH b.holidayPackage")
    List<Booking> findAllWithRoomAndUser();
}
