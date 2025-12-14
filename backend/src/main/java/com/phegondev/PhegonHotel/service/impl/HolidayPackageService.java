package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.HolidayPackageDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.HolidayPackage;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.HolidayPackageRepository;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.service.interfac.IHolidayPackageService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HolidayPackageService implements IHolidayPackageService {

    @Autowired
    private HolidayPackageRepository holidayPackageRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Response addHolidayPackage(Long roomId, String name, LocalDate startDate, LocalDate endDate,
                                     BigDecimal packagePrice, String description, Boolean allowPartialBookings) {
        Response response = new Response();

        try {
            if (endDate.isBefore(startDate) || endDate.equals(startDate)) {
                throw new IllegalArgumentException("End date must be after start date");
            }

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));

            HolidayPackage holidayPackage = new HolidayPackage();
            holidayPackage.setName(name);
            holidayPackage.setStartDate(startDate);
            holidayPackage.setEndDate(endDate);
            holidayPackage.setPackagePrice(packagePrice);
            holidayPackage.setDescription(description);
            holidayPackage.setRoom(room);
            holidayPackage.setIsActive(true);
            holidayPackage.setAllowPartialBookings(allowPartialBookings != null ? allowPartialBookings : false);

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
    public Response updateHolidayPackage(Long packageId, Long roomId, String name, LocalDate startDate,
                                        LocalDate endDate, BigDecimal packagePrice, String description, 
                                        Boolean isActive, Boolean allowPartialBookings) {
        Response response = new Response();

        try {
            HolidayPackage holidayPackage = holidayPackageRepository.findById(packageId)
                    .orElseThrow(() -> new OurException("Holiday Package Not Found"));

            if (roomId != null) {
                Room room = roomRepository.findById(roomId)
                        .orElseThrow(() -> new OurException("Room Not Found"));
                holidayPackage.setRoom(room);
            }

            if (name != null && !name.isBlank()) {
                holidayPackage.setName(name);
            }
            if (startDate != null) {
                holidayPackage.setStartDate(startDate);
            }
            if (endDate != null) {
                holidayPackage.setEndDate(endDate);
            }
            if (packagePrice != null) {
                holidayPackage.setPackagePrice(packagePrice);
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
    public Response getActivePackagesForRoomAndDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        Response response = new Response();

        try {
            List<HolidayPackage> packages = holidayPackageRepository
                    .findActivePackagesForRoomAndDates(roomId, checkInDate, checkOutDate);

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

    private HolidayPackageDTO mapToDTO(HolidayPackage holidayPackage) {
        HolidayPackageDTO dto = new HolidayPackageDTO();
        dto.setId(holidayPackage.getId());
        dto.setName(holidayPackage.getName());
        dto.setStartDate(holidayPackage.getStartDate());
        dto.setEndDate(holidayPackage.getEndDate());
        dto.setPackagePrice(holidayPackage.getPackagePrice());
        dto.setDescription(holidayPackage.getDescription());
        dto.setIsActive(holidayPackage.getIsActive());
        dto.setAllowPartialBookings(holidayPackage.getAllowPartialBookings());
        dto.setRoom(Utils.mapRoomEntityToRoomDTO(holidayPackage.getRoom()));
        return dto;
    }
}
