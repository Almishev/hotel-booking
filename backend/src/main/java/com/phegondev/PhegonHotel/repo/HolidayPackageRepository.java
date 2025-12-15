package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.HolidayPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface HolidayPackageRepository extends JpaRepository<HolidayPackage, Long> {

    List<HolidayPackage> findByIsActiveTrue();

    // Пакетът е за целия хотел, не за конкретна стая - филтрираме само по дати
    @Query("SELECT DISTINCT hp FROM HolidayPackage hp LEFT JOIN FETCH hp.roomTypePrices " +
           "WHERE hp.isActive = true AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate)")
    List<HolidayPackage> findActivePackagesForDates(LocalDate checkInDate, LocalDate checkOutDate);

    // Намиране на неразрушими пакети за дати (без филтриране по стая, защото пакетът е за целия хотел)
    @Query("SELECT DISTINCT hp FROM HolidayPackage hp LEFT JOIN FETCH hp.roomTypePrices " +
           "WHERE hp.isActive = true AND hp.allowPartialBookings = false " +
           "AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate)")
    List<HolidayPackage> findNonDestructiblePackagesForDates(LocalDate checkInDate, LocalDate checkOutDate);
    
    // Намиране на активни пакети за конкретен тип стая и дати
    @Query("SELECT DISTINCT hp FROM HolidayPackage hp LEFT JOIN FETCH hp.roomTypePrices rtp " +
           "WHERE hp.isActive = true AND rtp.roomType = :roomType " +
           "AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate)")
    List<HolidayPackage> findActivePackagesForRoomTypeAndDates(String roomType, LocalDate checkInDate, LocalDate checkOutDate);
}
