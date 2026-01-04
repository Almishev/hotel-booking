package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.PriceCalculationDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.RoomPricePeriodDTO;
import com.phegondev.PhegonHotel.entity.Room;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IRoomPricePeriodService {
    
    // CRUD операции
    Response addRoomPricePeriod(RoomPricePeriodDTO periodDTO);
    Response getAllRoomPricePeriods();
    Response getRoomPricePeriodsByRoomType(String roomType);
    Response getRoomPricePeriodById(Long id);
    Response updateRoomPricePeriod(Long id, RoomPricePeriodDTO periodDTO);
    Response deleteRoomPricePeriod(Long id);
    
    // Изчисляване на цена
    BigDecimal calculateRoomPrice(Room room, LocalDate checkIn, LocalDate checkOut);
    PriceCalculationDTO calculatePriceWithBreakdown(Room room, LocalDate checkIn, LocalDate checkOut);
    
    // Валидация
    Response validatePeriod(RoomPricePeriodDTO periodDTO, Long excludeId);
}

