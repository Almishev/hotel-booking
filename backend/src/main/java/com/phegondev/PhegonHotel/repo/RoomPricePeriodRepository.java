package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.RoomPricePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomPricePeriodRepository extends JpaRepository<RoomPricePeriod, Long> {

    // Намери активни периоди за тип стая и дати
    @Query("SELECT rpp FROM RoomPricePeriod rpp WHERE rpp.roomType = :roomType " +
           "AND rpp.startDate <= :endDate AND rpp.endDate >= :startDate " +
           "ORDER BY rpp.startDate")
    List<RoomPricePeriod> findActivePeriodsForRoomType(
            @Param("roomType") String roomType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Намери цена за конкретна дата
    @Query("SELECT rpp FROM RoomPricePeriod rpp WHERE rpp.roomType = :roomType " +
           "AND rpp.startDate <= :date AND rpp.endDate >= :date " +
           "ORDER BY rpp.startDate DESC")
    Optional<RoomPricePeriod> findPriceForDate(
            @Param("roomType") String roomType,
            @Param("date") LocalDate date);

    // Намери всички периоди за тип стая
    List<RoomPricePeriod> findByRoomTypeOrderByStartDateAsc(String roomType);

    // Провери за припокриващи се периоди
    @Query("SELECT rpp FROM RoomPricePeriod rpp WHERE rpp.roomType = :roomType " +
           "AND rpp.id != :excludeId " +
           "AND ((rpp.startDate <= :endDate AND rpp.endDate >= :startDate))")
    List<RoomPricePeriod> findOverlappingPeriods(
            @Param("roomType") String roomType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") Long excludeId);

    // За нови периоди (без excludeId)
    @Query("SELECT rpp FROM RoomPricePeriod rpp WHERE rpp.roomType = :roomType " +
           "AND (rpp.startDate <= :endDate AND rpp.endDate >= :startDate)")
    List<RoomPricePeriod> findOverlappingPeriodsForNew(
            @Param("roomType") String roomType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}

