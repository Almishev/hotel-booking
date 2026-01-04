package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomPricePeriodDTO {
    private Long id;
    private String roomType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal price;
    private String description;
}

