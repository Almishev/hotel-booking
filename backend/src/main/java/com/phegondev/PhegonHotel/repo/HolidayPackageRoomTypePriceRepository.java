package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.HolidayPackageRoomTypePrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HolidayPackageRoomTypePriceRepository extends JpaRepository<HolidayPackageRoomTypePrice, Long> {
    
    Optional<HolidayPackageRoomTypePrice> findByHolidayPackageIdAndRoomType(Long packageId, String roomType);
}
