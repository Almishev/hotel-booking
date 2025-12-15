package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface IHolidayPackageService {

    // roomTypePrices: Map от тип стая -> цена на пакета за този тип
    Response addHolidayPackage(String name, LocalDate startDate, LocalDate endDate, 
                              Map<String, BigDecimal> roomTypePrices, String description, Boolean allowPartialBookings, MultipartFile photo);

    Response getAllHolidayPackages();

    Response getHolidayPackageById(Long packageId);

    Response updateHolidayPackage(Long packageId, String name, LocalDate startDate, 
                                  LocalDate endDate, Map<String, BigDecimal> roomTypePrices, String description, 
                                  Boolean isActive, Boolean allowPartialBookings, MultipartFile photo);

    Response deleteHolidayPackage(Long packageId);

    // Променено: roomType вместо roomId, защото пакетът е за целия хотел
    Response getActivePackagesForRoomTypeAndDates(String roomType, LocalDate checkInDate, LocalDate checkOutDate);
    
    // Helper метод: получаване на цена на пакет за конкретен тип стая
    Response getPackagePriceForRoomType(Long packageId, String roomType);
}
