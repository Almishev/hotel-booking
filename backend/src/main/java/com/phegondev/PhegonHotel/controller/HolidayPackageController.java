package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.service.interfac.IHolidayPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/holiday-packages")
public class HolidayPackageController {

    @Autowired
    private IHolidayPackageService holidayPackageService;

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addHolidayPackage(
            @RequestParam Long roomId,
            @RequestParam String name,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam BigDecimal packagePrice,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "false") Boolean allowPartialBookings
    ) {
        Response response = holidayPackageService.addHolidayPackage(roomId, name, startDate, endDate, packagePrice, description, allowPartialBookings);
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
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal packagePrice,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean allowPartialBookings
    ) {
        Response response = holidayPackageService.updateHolidayPackage(packageId, roomId, name, startDate, endDate, packagePrice, description, isActive, allowPartialBookings);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{packageId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteHolidayPackage(@PathVariable Long packageId) {
        Response response = holidayPackageService.deleteHolidayPackage(packageId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/available")
    public ResponseEntity<Response> getActivePackagesForRoomAndDates(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate
    ) {
        Response response = holidayPackageService.getActivePackagesForRoomAndDates(roomId, checkInDate, checkOutDate);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
