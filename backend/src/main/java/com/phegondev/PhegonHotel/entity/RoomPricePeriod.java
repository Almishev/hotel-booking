package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "room_price_periods")
public class RoomPricePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @NotNull(message = "Room type is required")
    private String roomType; // "Delux", "Standard", "Suite" - прилага се на всички стаи от този тип

    @Column(nullable = false)
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @Column(nullable = false)
    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price is required")
    private BigDecimal price;

    @Column(length = 500)
    private String description; // Опционално описание (напр. "Лятна сезона", "Новогодишен период")

    // Валидация: endDate трябва да е след startDate
    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (endDate != null && startDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }
}

