package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.BookingDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Booking;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.User;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.entity.HolidayPackage;
import com.phegondev.PhegonHotel.repo.BookingRepository;
import com.phegondev.PhegonHotel.repo.HolidayPackageRepository;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.repo.UserRepository;
import com.phegondev.PhegonHotel.service.interfac.IBookingService;
import com.phegondev.PhegonHotel.service.EmailService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService implements IBookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private HolidayPackageRepository holidayPackageRepository;


    @Override
    public Response saveBooking(Long roomId, Long userId, Booking bookingRequest, String language) {

        Response response = new Response();

        try {
            if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())) {
                throw new IllegalArgumentException("Check in date must come after check out date");
            }
            Room room = roomRepository.findById(roomId).orElseThrow(() -> new OurException("Room Not Found"));
            User user = userRepository.findById(userId).orElseThrow(() -> new OurException("User Not Found"));

            List<Booking> existingBookings = room.getBookings();

            // Ако резервацията НЕ е за пакет, провери дали има неразрушим активен пакет, който припокрива датите
            if (bookingRequest.getHolidayPackage() == null) {
                List<HolidayPackage> nonDestructiblePackages = holidayPackageRepository
                        .findNonDestructiblePackagesForRoomAndDates(roomId, bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
                
                // Ако има неразрушим пакет, който припокрива датите, блокираме резервацията
                if (!nonDestructiblePackages.isEmpty()) {
                    HolidayPackage blockingPackage = nonDestructiblePackages.get(0);
                    throw new OurException("These dates are part of a holiday package: \"" + blockingPackage.getName() + 
                                       "\". Please book the package instead or choose different dates.");
                }
            }

            if (!roomIsAvailable(bookingRequest, existingBookings)) {
                throw new OurException("Room not Available for selected date range");
            }

            // Ако е резервация за пакет, задай holidayPackage
            if (bookingRequest.getHolidayPackage() != null) {
                HolidayPackage packageEntity = holidayPackageRepository.findById(bookingRequest.getHolidayPackage().getId())
                        .orElseThrow(() -> new OurException("Holiday Package Not Found"));
                
                // Провери дали пакетът все още е наличен (няма други резервации, които блокират датите на пакета)
                // Това е важно само ако пакетът е разрушим (allowPartialBookings = true)
                if (packageEntity.getAllowPartialBookings()) {
                    List<Booking> conflictingBookings = existingBookings.stream()
                            .filter(booking -> booking.getHolidayPackage() == null) // Само нормални резервации
                            .filter(booking -> datesOverlap(booking.getCheckInDate(), booking.getCheckOutDate(), 
                                    packageEntity.getStartDate(), packageEntity.getEndDate()))
                            .toList();
                    
                    if (!conflictingBookings.isEmpty()) {
                        throw new OurException("Holiday package is no longer available. Some dates are already booked.");
                    }
                }
                
                bookingRequest.setHolidayPackage(packageEntity);
            }

            bookingRequest.setRoom(room);
            bookingRequest.setUser(user);
            bookingRequest.setBookingDate(java.time.LocalDateTime.now());
            String bookingConfirmationCode = Utils.generateRandomConfirmationCode(10);
            bookingRequest.setBookingConfirmationCode(bookingConfirmationCode);
            
            // Update user's preferred language if provided
            String finalLanguage = language; // Store language before saving
            if (language != null && !language.isEmpty()) {
                user.setPreferredLanguage(language);
                userRepository.save(user);
                // Refresh user object to ensure it has the updated language
                user = userRepository.findById(userId).orElse(user);
                // Update booking request with refreshed user
                bookingRequest.setUser(user);
            }
            
            Booking savedBooking = bookingRepository.save(bookingRequest);
            
            // Pass language directly to email service to ensure it uses the correct language
            // Use the language from request, not from user (which might not be updated yet)
            emailService.sendBookingConfirmationEmail(savedBooking, finalLanguage);
            
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingConfirmationCode(bookingConfirmationCode);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Saving a booking: " + e.getMessage());

        }
        return response;
    }


    @Override
    public Response findBookingByConfirmationCode(String confirmationCode) {

        Response response = new Response();

        try {
            Booking booking = bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(() -> new OurException("Booking Not Found"));
            BookingDTO bookingDTO = Utils.mapBookingEntityToBookingDTOPlusBookedRooms(booking, true);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBooking(bookingDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Finding a booking: " + e.getMessage());

        }
        return response;
    }

    @Override
    public Response getAllBookings() {

        Response response = new Response();

        try {
            List<Booking> bookingList = bookingRepository.findAllWithRoomAndUser();
            // Sort by id descending manually since we're using custom query
            bookingList.sort((a, b) -> Long.compare(b.getId(), a.getId()));
            List<BookingDTO> bookingDTOList = Utils.mapBookingListEntityToBookingListDTO(bookingList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingList(bookingDTOList);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Getting all bookings: " + e.getMessage());

        }
        return response;
    }

    @Override
    public Response cancelBooking(Long bookingId) {

        Response response = new Response();

        try {
            bookingRepository.findById(bookingId).orElseThrow(() -> new OurException("Booking Does Not Exist"));
            bookingRepository.deleteById(bookingId);
            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Cancelling a booking: " + e.getMessage());

        }
        return response;
    }


    private boolean roomIsAvailable(Booking bookingRequest, List<Booking> existingBookings) {

        return existingBookings.stream()
                .noneMatch(existingBooking ->
                        bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
                                || bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckOutDate())
                                || (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate())
                                && bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckInDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(bookingRequest.getCheckInDate()))
                );
    }

    // Helper метод за проверка на припокриване на дати
    private boolean datesOverlap(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }
}
