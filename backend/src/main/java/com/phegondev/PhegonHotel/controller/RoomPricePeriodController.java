package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.PriceCalculationDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.RoomPricePeriodDTO;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.service.interfac.IRoomPricePeriodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/room-price-periods")
public class RoomPricePeriodController {

    @Autowired
    private IRoomPricePeriodService roomPricePeriodService;
    
    @Autowired
    private RoomRepository roomRepository;

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addRoomPricePeriod(@RequestBody RoomPricePeriodDTO periodDTO) {
        Response response = roomPricePeriodService.addRoomPricePeriod(periodDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllRoomPricePeriods() {
        Response response = roomPricePeriodService.getAllRoomPricePeriods();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/by-room-type/{roomType}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getRoomPricePeriodsByRoomType(@PathVariable String roomType) {
        Response response = roomPricePeriodService.getRoomPricePeriodsByRoomType(roomType);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getRoomPricePeriodById(@PathVariable Long id) {
        Response response = roomPricePeriodService.getRoomPricePeriodById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateRoomPricePeriod(
            @PathVariable Long id,
            @RequestBody RoomPricePeriodDTO periodDTO) {
        Response response = roomPricePeriodService.updateRoomPricePeriod(id, periodDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteRoomPricePeriod(@PathVariable Long id) {
        Response response = roomPricePeriodService.deleteRoomPricePeriod(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/price-calculation")
    public ResponseEntity<Response> calculatePrice(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        
        Response response = new Response();
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room not found"));
            
            PriceCalculationDTO calculation = roomPricePeriodService.calculatePriceWithBreakdown(room, checkIn, checkOut);
            
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setPriceCalculation(calculation);
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (IllegalArgumentException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error calculating price: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}

