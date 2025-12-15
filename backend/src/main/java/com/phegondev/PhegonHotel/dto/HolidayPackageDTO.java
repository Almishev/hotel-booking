package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HolidayPackageDTO {

    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String packagePhotoUrl;
    private Boolean isActive;
    private Boolean allowPartialBookings;
    // Map от тип стая -> цена на пакета за този тип
    private Map<String, BigDecimal> roomTypePrices;
}
