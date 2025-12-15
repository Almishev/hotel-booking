package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.service.interfac.IHolidayPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/holiday-packages")
public class HolidayPackageController {

    @Autowired
    private IHolidayPackageService holidayPackageService;

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addHolidayPackage(
            @RequestParam String name,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "false") Boolean allowPartialBookings,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam Map<String, String> allParams // За да получим всички roomTypePrice параметри
    ) {
        // Извличане на цените по типове стаи от параметрите
        // Очакваме формат: roomTypePrice_Delux=100, roomTypePrice_Standard=80, etc.
        Map<String, BigDecimal> roomTypePrices = new HashMap<>();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            if (entry.getKey().startsWith("roomTypePrice_")) {
                String roomType = entry.getKey().substring("roomTypePrice_".length());
                try {
                    BigDecimal price = new BigDecimal(entry.getValue());
                    roomTypePrices.put(roomType, price);
                } catch (NumberFormatException e) {
                    // Пропускаме невалидни цени
                }
            }
        }

        Response response = holidayPackageService.addHolidayPackage(name, startDate, endDate, roomTypePrices, description, allowPartialBookings, photo);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllHolidayPackages() {
        Response response = holidayPackageService.getAllHolidayPackages();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{packageId}")
    public ResponseEntity<Response> getHolidayPackageById(@PathVariable Long packageId) {
        Response response = holidayPackageService.getHolidayPackageById(packageId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/update/{packageId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateHolidayPackage(
            @PathVariable Long packageId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean allowPartialBookings,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam Map<String, String> allParams // За да получим всички roomTypePrice параметри
    ) {
        // Извличане на цените по типове стаи от параметрите
        Map<String, BigDecimal> roomTypePrices = null;
        boolean hasRoomTypePrices = false;
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            if (entry.getKey().startsWith("roomTypePrice_")) {
                if (roomTypePrices == null) {
                    roomTypePrices = new HashMap<>();
                }
                hasRoomTypePrices = true;
                String roomType = entry.getKey().substring("roomTypePrice_".length());
                try {
                    BigDecimal price = new BigDecimal(entry.getValue());
                    roomTypePrices.put(roomType, price);
                } catch (NumberFormatException e) {
                    // Пропускаме невалидни цени
                }
            }
        }

        // Ако няма roomTypePrices параметри, не обновяваме цените
        if (!hasRoomTypePrices) {
            roomTypePrices = null;
        }

        Response response = holidayPackageService.updateHolidayPackage(packageId, name, startDate, endDate, roomTypePrices, description, isActive, allowPartialBookings, photo);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{packageId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteHolidayPackage(@PathVariable Long packageId) {
        Response response = holidayPackageService.deleteHolidayPackage(packageId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/available")
    public ResponseEntity<Response> getActivePackagesForRoomTypeAndDates(
            @RequestParam String roomType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate
    ) {
        Response response = holidayPackageService.getActivePackagesForRoomTypeAndDates(roomType, checkInDate, checkOutDate);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/price")
    public ResponseEntity<Response> getPackagePriceForRoomType(
            @RequestParam Long packageId,
            @RequestParam String roomType
    ) {
        Response response = holidayPackageService.getPackagePriceForRoomType(packageId, roomType);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
