package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT DISTINCT r.roomType FROM Room r")
    List<String> findDistinctRoomTypes();


    // Изключваме стаи с резервации ИЛИ с неразрушими активни пакети, които припокриват датите
    // Пакетът е за целия хотел, но проверяваме дали има пакет за този тип стая
    @Query("SELECT r FROM Room r WHERE r.roomType LIKE %:roomType% " +
           "AND r.id NOT IN (SELECT bk.room.id FROM Booking bk WHERE " +
           "(bk.checkInDate < :checkOutDate) AND (bk.checkOutDate > :checkInDate)) " +
           "AND NOT EXISTS (SELECT hp FROM HolidayPackage hp " +
           "JOIN hp.roomTypePrices rtp ON rtp.roomType = r.roomType " +
           "WHERE hp.isActive = true AND hp.allowPartialBookings = false " +
           "AND (hp.startDate < :checkOutDate AND hp.endDate > :checkInDate))")
    List<Room> findAvailableRoomsByDatesAndTypes(LocalDate checkInDate, LocalDate checkOutDate, String roomType);


    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT b.room.id FROM Booking b)")
    List<Room> getAllAvailableRooms();
}
