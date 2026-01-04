package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.PriceCalculationDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.RoomPricePeriodDTO;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.RoomPricePeriod;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.RoomPricePeriodRepository;
import com.phegondev.PhegonHotel.service.interfac.IRoomPricePeriodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomPricePeriodService implements IRoomPricePeriodService {

    @Autowired
    private RoomPricePeriodRepository roomPricePeriodRepository;

    @Override
    @Transactional
    public Response addRoomPricePeriod(RoomPricePeriodDTO periodDTO) {
        Response response = new Response();
        try {
            // Валидация
            Response validationResponse = validatePeriod(periodDTO, null);
            if (validationResponse.getStatusCode() != 200) {
                return validationResponse;
            }

            RoomPricePeriod period = mapDTOToEntity(periodDTO);
            RoomPricePeriod savedPeriod = roomPricePeriodRepository.save(period);
            RoomPricePeriodDTO savedDTO = mapEntityToDTO(savedPeriod);

            response.setStatusCode(200);
            response.setMessage("Room price period added successfully");
            response.setRoomPricePeriod(savedDTO);
        } catch (IllegalArgumentException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding room price period: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Response getAllRoomPricePeriods() {
        Response response = new Response();
        try {
            List<RoomPricePeriod> periods = roomPricePeriodRepository.findAll();
            List<RoomPricePeriodDTO> periodDTOs = periods.stream()
                    .map(this::mapEntityToDTO)
                    .collect(Collectors.toList());

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomPricePeriodList(periodDTOs);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching room price periods: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Response getRoomPricePeriodsByRoomType(String roomType) {
        Response response = new Response();
        try {
            List<RoomPricePeriod> periods = roomPricePeriodRepository.findByRoomTypeOrderByStartDateAsc(roomType);
            List<RoomPricePeriodDTO> periodDTOs = periods.stream()
                    .map(this::mapEntityToDTO)
                    .collect(Collectors.toList());

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomPricePeriodList(periodDTOs);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching room price periods: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Response getRoomPricePeriodById(Long id) {
        Response response = new Response();
        try {
            RoomPricePeriod period = roomPricePeriodRepository.findById(id)
                    .orElseThrow(() -> new OurException("Room price period not found"));
            RoomPricePeriodDTO periodDTO = mapEntityToDTO(period);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomPricePeriod(periodDTO);
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching room price period: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional
    public Response updateRoomPricePeriod(Long id, RoomPricePeriodDTO periodDTO) {
        Response response = new Response();
        try {
            RoomPricePeriod existingPeriod = roomPricePeriodRepository.findById(id)
                    .orElseThrow(() -> new OurException("Room price period not found"));

            // Валидация
            Response validationResponse = validatePeriod(periodDTO, id);
            if (validationResponse.getStatusCode() != 200) {
                return validationResponse;
            }

            // Обнови полетата
            existingPeriod.setRoomType(periodDTO.getRoomType());
            existingPeriod.setStartDate(periodDTO.getStartDate());
            existingPeriod.setEndDate(periodDTO.getEndDate());
            existingPeriod.setPrice(periodDTO.getPrice());
            existingPeriod.setDescription(periodDTO.getDescription());

            RoomPricePeriod updatedPeriod = roomPricePeriodRepository.save(existingPeriod);
            RoomPricePeriodDTO updatedDTO = mapEntityToDTO(updatedPeriod);

            response.setStatusCode(200);
            response.setMessage("Room price period updated successfully");
            response.setRoomPricePeriod(updatedDTO);
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (IllegalArgumentException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating room price period: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional
    public Response deleteRoomPricePeriod(Long id) {
        Response response = new Response();
        try {
            roomPricePeriodRepository.findById(id)
                    .orElseThrow(() -> new OurException("Room price period not found"));
            roomPricePeriodRepository.deleteById(id);

            response.setStatusCode(200);
            response.setMessage("Room price period deleted successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting room price period: " + e.getMessage());
        }
        return response;
    }

    @Override
    public BigDecimal calculateRoomPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || checkIn.isAfter(checkOut) || checkIn.equals(checkOut)) {
            throw new IllegalArgumentException("Invalid date range");
        }

        List<RoomPricePeriod> periods = roomPricePeriodRepository
                .findActivePeriodsForRoomType(room.getRoomType(), checkIn, checkOut);

        if (periods.isEmpty()) {
            // Няма специални периоди - използвай базовата цена
            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
            return room.getRoomPrice().multiply(BigDecimal.valueOf(nights));
        }

        // Изчисли общата цена за всички нощи
        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalDate currentDate = checkIn;

        while (currentDate.isBefore(checkOut)) {
            BigDecimal priceForNight = findPriceForDate(periods, room.getRoomPrice(), currentDate);
            totalPrice = totalPrice.add(priceForNight);
            currentDate = currentDate.plusDays(1);
        }

        return totalPrice;
    }

    @Override
    public PriceCalculationDTO calculatePriceWithBreakdown(Room room, LocalDate checkIn, LocalDate checkOut) {
        PriceCalculationDTO calculation = new PriceCalculationDTO();
        List<PriceCalculationDTO.PeriodPriceBreakdown> breakdown = new ArrayList<>();

        if (checkIn == null || checkOut == null || checkIn.isAfter(checkOut) || checkIn.equals(checkOut)) {
            throw new IllegalArgumentException("Invalid date range");
        }

        long numberOfNights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        calculation.setNumberOfNights((int) numberOfNights);

        List<RoomPricePeriod> periods = roomPricePeriodRepository
                .findActivePeriodsForRoomType(room.getRoomType(), checkIn, checkOut);

        if (periods.isEmpty()) {
            // Няма специални периоди
            BigDecimal totalPrice = room.getRoomPrice().multiply(BigDecimal.valueOf(numberOfNights));
            calculation.setTotalPrice(totalPrice);
            calculation.setAveragePricePerNight(room.getRoomPrice());
            calculation.setHasPeriodPricing(false);
            return calculation;
        }

        // Изчисли с разбивка по периоди
        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalDate currentDate = checkIn;
        PriceCalculationDTO.PeriodPriceBreakdown currentBreakdown = null;

        while (currentDate.isBefore(checkOut)) {
            RoomPricePeriod period = findPeriodForDate(periods, currentDate);
            BigDecimal priceForNight = period != null ? period.getPrice() : room.getRoomPrice();
            String description = period != null ? 
                    (period.getDescription() != null ? period.getDescription() : "Period " + period.getStartDate() + " - " + period.getEndDate()) :
                    "Standard price";

            // Ако е нов период или променя цената, започни нов breakdown
            if (currentBreakdown == null || 
                !priceForNight.equals(currentBreakdown.getPricePerNight()) ||
                (period != null && !currentDate.equals(currentBreakdown.getStartDate().plusDays(currentBreakdown.getNights())))) {
                
                if (currentBreakdown != null) {
                    breakdown.add(currentBreakdown);
                }
                
                currentBreakdown = new PriceCalculationDTO.PeriodPriceBreakdown();
                currentBreakdown.setPeriodDescription(description);
                currentBreakdown.setStartDate(currentDate);
                currentBreakdown.setPricePerNight(priceForNight);
                currentBreakdown.setNights(0);
                currentBreakdown.setTotalForPeriod(BigDecimal.ZERO);
            }

            currentBreakdown.setNights(currentBreakdown.getNights() + 1);
            currentBreakdown.setTotalForPeriod(
                    currentBreakdown.getTotalForPeriod().add(priceForNight));
            currentBreakdown.setEndDate(currentDate.plusDays(1));

            totalPrice = totalPrice.add(priceForNight);
            currentDate = currentDate.plusDays(1);
        }

        if (currentBreakdown != null) {
            breakdown.add(currentBreakdown);
        }

        calculation.setTotalPrice(totalPrice);
        calculation.setAveragePricePerNight(
                totalPrice.divide(BigDecimal.valueOf(numberOfNights), 2, RoundingMode.HALF_UP));
        calculation.setBreakdown(breakdown);
        calculation.setHasPeriodPricing(true);

        return calculation;
    }

    @Override
    public Response validatePeriod(RoomPricePeriodDTO periodDTO, Long excludeId) {
        Response response = new Response();
        
        if (periodDTO.getStartDate() == null || periodDTO.getEndDate() == null) {
            response.setStatusCode(400);
            response.setMessage("Start date and end date are required");
            return response;
        }

        if (periodDTO.getEndDate().isBefore(periodDTO.getStartDate())) {
            response.setStatusCode(400);
            response.setMessage("End date must be after start date");
            return response;
        }

        if (periodDTO.getRoomType() == null || periodDTO.getRoomType().isBlank()) {
            response.setStatusCode(400);
            response.setMessage("Room type is required");
            return response;
        }

        if (periodDTO.getPrice() == null || periodDTO.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            response.setStatusCode(400);
            response.setMessage("Price must be greater than zero");
            return response;
        }

        // Провери за припокриващи се периоди
        List<RoomPricePeriod> overlapping;
        if (excludeId != null) {
            overlapping = roomPricePeriodRepository.findOverlappingPeriods(
                    periodDTO.getRoomType(),
                    periodDTO.getStartDate(),
                    periodDTO.getEndDate(),
                    excludeId);
        } else {
            overlapping = roomPricePeriodRepository.findOverlappingPeriodsForNew(
                    periodDTO.getRoomType(),
                    periodDTO.getStartDate(),
                    periodDTO.getEndDate());
        }

        if (!overlapping.isEmpty()) {
            response.setStatusCode(400);
            response.setMessage("This period overlaps with existing period(s). Please adjust the dates.");
            return response;
        }

        response.setStatusCode(200);
        response.setMessage("Period is valid");
        return response;
    }

    // Helper методи
    private BigDecimal findPriceForDate(List<RoomPricePeriod> periods, BigDecimal defaultPrice, LocalDate date) {
        RoomPricePeriod period = findPeriodForDate(periods, date);
        return period != null ? period.getPrice() : defaultPrice;
    }

    private RoomPricePeriod findPeriodForDate(List<RoomPricePeriod> periods, LocalDate date) {
        return periods.stream()
                .filter(p -> !date.isBefore(p.getStartDate()) && !date.isAfter(p.getEndDate()))
                .findFirst()
                .orElse(null);
    }

    private RoomPricePeriod mapDTOToEntity(RoomPricePeriodDTO dto) {
        RoomPricePeriod entity = new RoomPricePeriod();
        entity.setId(dto.getId());
        entity.setRoomType(dto.getRoomType());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setPrice(dto.getPrice());
        entity.setDescription(dto.getDescription());
        return entity;
    }

    private RoomPricePeriodDTO mapEntityToDTO(RoomPricePeriod entity) {
        RoomPricePeriodDTO dto = new RoomPricePeriodDTO();
        dto.setId(entity.getId());
        dto.setRoomType(entity.getRoomType());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());
        return dto;
    }
}

