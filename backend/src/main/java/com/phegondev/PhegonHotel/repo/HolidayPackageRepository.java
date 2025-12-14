package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.HolidayPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface HolidayPackageRepository extends JpaRepository<HolidayPackage, Long> {

    List<HolidayPackage> findByIsActiveTrue();

    @Query("SELECT hp FROM HolidayPackage hp WHERE hp.isActive = true AND hp.room.id = :roomId " +
           "AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate)")
    List<HolidayPackage> findActivePackagesForRoomAndDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);

    @Query("SELECT hp FROM HolidayPackage hp WHERE hp.isActive = true AND hp.allowPartialBookings = false " +
           "AND hp.room.id = :roomId AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate)")
    List<HolidayPackage> findNonDestructiblePackagesForRoomAndDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);
}
