package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "holiday_package_room_type_prices")
public class HolidayPackageRoomTypePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holiday_package_id", nullable = false)
    private HolidayPackage holidayPackage;

    @Column(nullable = false)
    private String roomType; // "Delux", "Standard", "Suite", etc.

    @Column(nullable = false)
    private BigDecimal packagePrice; // Цена на пакета за този тип стая
}
