package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IHolidayPackageService {

    Response addHolidayPackage(Long roomId, String name, LocalDate startDate, LocalDate endDate, 
                              BigDecimal packagePrice, String description, Boolean allowPartialBookings);

    Response getAllHolidayPackages();

    Response getHolidayPackageById(Long packageId);

    Response updateHolidayPackage(Long packageId, Long roomId, String name, LocalDate startDate, 
                                  LocalDate endDate, BigDecimal packagePrice, String description, 
                                  Boolean isActive, Boolean allowPartialBookings);

    Response deleteHolidayPackage(Long packageId);

    Response getActivePackagesForRoomAndDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);
}
