package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PriceCalculationDTO {
    private BigDecimal totalPrice;
    private BigDecimal averagePricePerNight;
    private Integer numberOfNights;
    private List<PeriodPriceBreakdown> breakdown; // Разбивка по периоди
    private Boolean hasPeriodPricing; // Дали има специални периоди

    @Data
    public static class PeriodPriceBreakdown {
        private String periodDescription;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer nights;
        private BigDecimal pricePerNight;
        private BigDecimal totalForPeriod;
    }
}

