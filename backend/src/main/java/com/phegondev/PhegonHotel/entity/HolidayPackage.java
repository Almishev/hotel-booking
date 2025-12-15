package com.phegondev.PhegonHotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "holiday_packages")
public class HolidayPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // "Новогодишно предложение"

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private String description;

    private String packagePhotoUrl; // URL на снимката на пакета в Cloudinary

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean allowPartialBookings = false; // Ако е false, пакетът блокира всички припокриващи резервации

    // Пакетът се отнася за целия хотел, не за конкретна стая
    // Цените за различните типове стаи се съхраняват в HolidayPackageRoomTypePrice
    
    // Временно поле за да може Hibernate да обнови схемата - да се премахне след миграция
    @Column(name = "package_price", nullable = true, insertable = false, updatable = false)
    @JsonIgnore
    @Deprecated
    private BigDecimal packagePrice; // DEPRECATED - не се използва, само за миграция на схемата

    // Временно поле за да може Hibernate да обнови схемата - да се премахне след миграция
    @Column(name = "room_id", nullable = true, insertable = false, updatable = false)
    @JsonIgnore
    @Deprecated
    private Long roomId; // DEPRECATED - не се използва, само за миграция на схемата

    @OneToMany(mappedBy = "holidayPackage", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HolidayPackageRoomTypePrice> roomTypePrices = new ArrayList<>();

    @OneToMany(mappedBy = "holidayPackage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
}
