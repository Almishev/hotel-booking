package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.HolidayPackageDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.HolidayPackage;
import com.phegondev.PhegonHotel.entity.HolidayPackageRoomTypePrice;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.HolidayPackageRepository;
import com.phegondev.PhegonHotel.service.CloudinaryService;
import com.phegondev.PhegonHotel.service.interfac.IHolidayPackageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HolidayPackageService implements IHolidayPackageService {

    @Autowired
    private HolidayPackageRepository holidayPackageRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostConstruct
    @Transactional
    public void migratePackagePriceColumn() {
        try {
            // Check if package_price column exists and has NOT NULL constraint
            String checkSql = "SELECT column_name, is_nullable FROM information_schema.columns " +
                             "WHERE table_name = 'holiday_packages' AND column_name IN ('package_price', 'room_id')";
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(checkSql);
            Map<String, String> columnStatus = new HashMap<>();
            for (Map<String, Object> row : results) {
                String columnName = (String) row.get("column_name");
                String isNullable = (String) row.get("is_nullable");
                columnStatus.put(columnName, isNullable);
            }
            
            // Update package_price column if needed
            if (columnStatus.containsKey("package_price") && "NO".equals(columnStatus.get("package_price"))) {
                jdbcTemplate.execute("ALTER TABLE holiday_packages ALTER COLUMN package_price DROP NOT NULL");
                System.out.println("Successfully updated package_price column to allow NULL values");
            }
            
            // Update room_id column if needed
            if (columnStatus.containsKey("room_id") && "NO".equals(columnStatus.get("room_id"))) {
                jdbcTemplate.execute("ALTER TABLE holiday_packages ALTER COLUMN room_id DROP NOT NULL");
                System.out.println("Successfully updated room_id column to allow NULL values");
            }
        } catch (Exception e) {
            // Ignore if column doesn't exist or constraint is already dropped
            System.out.println("Package columns migration: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Response addHolidayPackage(String name, LocalDate startDate, LocalDate endDate,
                                     Map<String, BigDecimal> roomTypePrices, String description, Boolean allowPartialBookings, MultipartFile photo) {
        Response response = new Response();

        try {
            if (endDate.isBefore(startDate) || endDate.equals(startDate)) {
                throw new IllegalArgumentException("End date must be after start date");
            }

            if (roomTypePrices == null || roomTypePrices.isEmpty()) {
                throw new IllegalArgumentException("At least one room type price must be provided");
            }

            HolidayPackage holidayPackage = new HolidayPackage();
            holidayPackage.setName(name);
            holidayPackage.setStartDate(startDate);
            holidayPackage.setEndDate(endDate);
            holidayPackage.setDescription(description);
            holidayPackage.setIsActive(true);
            holidayPackage.setAllowPartialBookings(allowPartialBookings != null ? allowPartialBookings : false);

            // Качване на снимката в Cloudinary, ако е предоставена
            if (photo != null && !photo.isEmpty()) {
                String imageUrl = cloudinaryService.saveImageToCloudinary(photo);
                holidayPackage.setPackagePhotoUrl(imageUrl);
            }

            // Създаване на цените за различните типове стаи
            for (Map.Entry<String, BigDecimal> entry : roomTypePrices.entrySet()) {
                HolidayPackageRoomTypePrice roomTypePrice = new HolidayPackageRoomTypePrice();
                roomTypePrice.setHolidayPackage(holidayPackage);
                roomTypePrice.setRoomType(entry.getKey());
                roomTypePrice.setPackagePrice(entry.getValue());
                holidayPackage.getRoomTypePrices().add(roomTypePrice);
            }

            HolidayPackage savedPackage = holidayPackageRepository.save(holidayPackage);
            HolidayPackageDTO packageDTO = mapToDTO(savedPackage);

            response.setStatusCode(200);
            response.setMessage("Holiday package added successfully");
            response.setHolidayPackage(packageDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding holiday package: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response getAllHolidayPackages() {
        Response response = new Response();

        try {
            List<HolidayPackage> packages = holidayPackageRepository.findAll();
            List<HolidayPackageDTO> packageDTOs = packages.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setHolidayPackageList(packageDTOs);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting holiday packages: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response getHolidayPackageById(Long packageId) {
        Response response = new Response();

        try {
            HolidayPackage holidayPackage = holidayPackageRepository.findById(packageId)
                    .orElseThrow(() -> new OurException("Holiday Package Not Found"));

            HolidayPackageDTO packageDTO = mapToDTO(holidayPackage);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setHolidayPackage(packageDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting holiday package: " + e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional
    public Response updateHolidayPackage(Long packageId, String name, LocalDate startDate,
                                        LocalDate endDate, Map<String, BigDecimal> roomTypePrices, String description, 
                                        Boolean isActive, Boolean allowPartialBookings, MultipartFile photo) {
        Response response = new Response();

        try {
            HolidayPackage holidayPackage = holidayPackageRepository.findById(packageId)
                    .orElseThrow(() -> new OurException("Holiday Package Not Found"));

            if (name != null && !name.isBlank()) {
                holidayPackage.setName(name);
            }
            if (startDate != null) {
                holidayPackage.setStartDate(startDate);
            }
            if (endDate != null) {
                holidayPackage.setEndDate(endDate);
            }
            if (description != null) {
                holidayPackage.setDescription(description);
            }
            if (isActive != null) {
                holidayPackage.setIsActive(isActive);
            }
            if (allowPartialBookings != null) {
                holidayPackage.setAllowPartialBookings(allowPartialBookings);
            }

            // Качване на нова снимка, ако е предоставена
            if (photo != null && !photo.isEmpty()) {
                String imageUrl = cloudinaryService.saveImageToCloudinary(photo);
                holidayPackage.setPackagePhotoUrl(imageUrl);
            }

            // Ако са предоставени нови цени, обнови ги
            if (roomTypePrices != null && !roomTypePrices.isEmpty()) {
                // Изтрий старите цени
                holidayPackage.getRoomTypePrices().clear();
                
                // Добави новите цени
                for (Map.Entry<String, BigDecimal> entry : roomTypePrices.entrySet()) {
                    HolidayPackageRoomTypePrice roomTypePrice = new HolidayPackageRoomTypePrice();
                    roomTypePrice.setHolidayPackage(holidayPackage);
                    roomTypePrice.setRoomType(entry.getKey());
                    roomTypePrice.setPackagePrice(entry.getValue());
                    holidayPackage.getRoomTypePrices().add(roomTypePrice);
                }
            }

            HolidayPackage savedPackage = holidayPackageRepository.save(holidayPackage);
            HolidayPackageDTO packageDTO = mapToDTO(savedPackage);

            response.setStatusCode(200);
            response.setMessage("Holiday package updated successfully");
            response.setHolidayPackage(packageDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating holiday package: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response deleteHolidayPackage(Long packageId) {
        Response response = new Response();

        try {
            holidayPackageRepository.findById(packageId)
                    .orElseThrow(() -> new OurException("Holiday Package Does Not Exist"));
            holidayPackageRepository.deleteById(packageId);

            response.setStatusCode(200);
            response.setMessage("Holiday package deleted successfully");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting holiday package: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response getActivePackagesForRoomTypeAndDates(String roomType, LocalDate checkInDate, LocalDate checkOutDate) {
        Response response = new Response();

        try {
            List<HolidayPackage> packages = holidayPackageRepository
                    .findActivePackagesForRoomTypeAndDates(roomType, checkInDate, checkOutDate);

            List<HolidayPackageDTO> packageDTOs = packages.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setHolidayPackageList(packageDTOs);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting packages: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response getPackagePriceForRoomType(Long packageId, String roomType) {
        Response response = new Response();

        try {
            HolidayPackage holidayPackage = holidayPackageRepository.findById(packageId)
                    .orElseThrow(() -> new OurException("Holiday Package Not Found"));

            HolidayPackageRoomTypePrice roomTypePrice = holidayPackage.getRoomTypePrices().stream()
                    .filter(rtp -> rtp.getRoomType().equals(roomType))
                    .findFirst()
                    .orElseThrow(() -> new OurException("Package price not found for room type: " + roomType));

            Map<String, Object> result = new HashMap<>();
            result.put("packageId", packageId);
            result.put("roomType", roomType);
            result.put("packagePrice", roomTypePrice.getPackagePrice());

            response.setStatusCode(200);
            response.setMessage("successful");
            // Можем да използваме holidayPackage field за да върнем данните
            HolidayPackageDTO dto = new HolidayPackageDTO();
            dto.setId(packageId);
            Map<String, BigDecimal> priceMap = new HashMap<>();
            priceMap.put(roomType, roomTypePrice.getPackagePrice());
            dto.setRoomTypePrices(priceMap);
            response.setHolidayPackage(dto);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting package price: " + e.getMessage());
        }

        return response;
    }

    private HolidayPackageDTO mapToDTO(HolidayPackage holidayPackage) {
        HolidayPackageDTO dto = new HolidayPackageDTO();
        dto.setId(holidayPackage.getId());
        dto.setName(holidayPackage.getName());
        dto.setStartDate(holidayPackage.getStartDate());
        dto.setEndDate(holidayPackage.getEndDate());
        dto.setDescription(holidayPackage.getDescription());
        dto.setPackagePhotoUrl(holidayPackage.getPackagePhotoUrl());
        dto.setIsActive(holidayPackage.getIsActive());
        dto.setAllowPartialBookings(holidayPackage.getAllowPartialBookings());
        
        // Мапване на цените по типове стаи
        Map<String, BigDecimal> roomTypePricesMap = new HashMap<>();
        if (holidayPackage.getRoomTypePrices() != null) {
            for (HolidayPackageRoomTypePrice rtp : holidayPackage.getRoomTypePrices()) {
                roomTypePricesMap.put(rtp.getRoomType(), rtp.getPackagePrice());
            }
        }
        dto.setRoomTypePrices(roomTypePricesMap);
        
        return dto;
    }
}
