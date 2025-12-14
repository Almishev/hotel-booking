package com.phegondev.PhegonHotel.service;

import com.phegondev.PhegonHotel.entity.Booking;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private MessageSource messageSource;

    public void sendBookingConfirmationEmail(Booking booking) {
        sendBookingConfirmationEmail(booking, null);
    }
    
    public void sendBookingConfirmationEmail(Booking booking, String languageOverride) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            User user = booking.getUser();
            Room room = booking.getRoom();
            
            // Get language: prioritize override (from booking request), then user's preferred language, then default to English
            String language = languageOverride;
            if (language == null || language.isEmpty()) {
                language = user.getPreferredLanguage();
            }
            if (language == null || language.isEmpty()) {
                language = "en";
            }
            
            // Create Locale from language code (e.g., "en", "bg", "el")
            // Use Locale.of() for Java 19+ which is the recommended way
            Locale locale;
            switch (language.toLowerCase()) {
                case "bg":
                    locale = Locale.of("bg");
                    break;
                case "el":
                    locale = Locale.of("el");
                    break;
                case "en":
                default:
                    locale = Locale.of("en");
                    break;
            }
            
            // Debug logging
            System.out.println("Email language: " + language + " (override: " + languageOverride + ", user preferred: " + user.getPreferredLanguage() + ")");
            System.out.println("Locale: " + locale.getLanguage() + ", Locale object: " + locale);
            System.out.println("MessageSource class: " + messageSource.getClass().getName());
            
            message.setTo(user.getEmail());
            
            // Get subject with fallback message
            String defaultSubject = getDefaultEnglishText("email.subject");
            String subject = messageSource.getMessage("email.subject", null, defaultSubject, locale);
            System.out.println("Email subject: " + subject + " (locale: " + locale + ")");
            message.setSubject(subject);
            
            String emailContent = buildBookingConfirmationEmail(booking, user, room, locale);
            message.setText(emailContent);
            
            mailSender.send(message);
            
        } catch (Exception e) {
            // Log the error but don't throw it to avoid breaking the booking process
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }
    }

    private String buildBookingConfirmationEmail(Booking booking, User user, Room room, Locale locale) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        // Helper method to get message with fallback to default English text
        java.util.function.Function<String, String> getMessage = (key) -> {
            // Use default English text as fallback
            String defaultText = getDefaultEnglishText(key);
            String result = messageSource.getMessage(key, null, defaultText, locale);
            // Debug first few messages to see if translations are working
            if (key.equals("email.dear") || key.equals("email.thankYou")) {
                System.out.println("Translation for " + key + " (locale: " + locale + "): " + result);
            }
            return result;
        };
        
        StringBuilder emailContent = new StringBuilder();
        emailContent.append(getMessage.apply("email.dear"))
                    .append(" ").append(user.getName()).append(",\n\n");
        emailContent.append(getMessage.apply("email.thankYou")).append("\n\n");
        emailContent.append(getMessage.apply("email.bookingDetails")).append(":\n");
        emailContent.append("================\n");
        emailContent.append(getMessage.apply("email.confirmationCode"))
                    .append(": ").append(booking.getBookingConfirmationCode()).append("\n");
        emailContent.append(getMessage.apply("email.checkInDate"))
                    .append(": ").append(booking.getCheckInDate().format(formatter)).append("\n");
        emailContent.append(getMessage.apply("email.checkOutDate"))
                    .append(": ").append(booking.getCheckOutDate().format(formatter)).append("\n");
        emailContent.append(getMessage.apply("email.numberOfAdults"))
                    .append(": ").append(booking.getNumOfAdults()).append("\n");
        emailContent.append(getMessage.apply("email.numberOfChildren"))
                    .append(": ").append(booking.getNumOfChildren()).append("\n");
        emailContent.append(getMessage.apply("email.totalGuests"))
                    .append(": ").append(booking.getTotalNumOfGuest()).append("\n\n");
        
        emailContent.append(getMessage.apply("email.roomDetails")).append(":\n");
        emailContent.append("==============\n");
        emailContent.append(getMessage.apply("email.roomType"))
                    .append(": ").append(room.getRoomType()).append("\n");
        emailContent.append(getMessage.apply("email.roomPricePerNight"))
                    .append(": €").append(room.getRoomPrice()).append("\n");
        emailContent.append(getMessage.apply("email.roomDescription"))
                    .append(": ").append(room.getRoomDescription()).append("\n\n");
        
        // Calculate total price
        long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        double totalPrice = room.getRoomPrice().doubleValue() * days;
        
        emailContent.append(getMessage.apply("email.pricing")).append(":\n");
        emailContent.append("========\n");
        emailContent.append(getMessage.apply("email.pricePerNight"))
                    .append(": €").append(room.getRoomPrice()).append("\n");
        emailContent.append(getMessage.apply("email.numberOfNights"))
                    .append(": ").append(days).append("\n");
        emailContent.append(getMessage.apply("email.totalPrice"))
                    .append(": €").append(String.format("%.2f", totalPrice)).append("\n\n");
        
        emailContent.append(getMessage.apply("email.importantInformation")).append(":\n");
        emailContent.append("======================\n");
        emailContent.append("- ").append(getMessage.apply("email.arriveOnDate")).append("\n");
        emailContent.append("- ").append(getMessage.apply("email.checkInTime")).append("\n");
        emailContent.append("- ").append(getMessage.apply("email.checkOutTime")).append("\n");
        emailContent.append("- ").append(getMessage.apply("email.bringValidID")).append("\n");
        emailContent.append("- ").append(getMessage.apply("email.keepConfirmationCode")).append("\n\n");
        
        emailContent.append(getMessage.apply("email.contactInformation")).append(":\n");
        emailContent.append("====================\n");
        emailContent.append(getMessage.apply("email.hotel")).append(": Phegon Hotel\n");
        emailContent.append("Email: mineralhotelinfo@gmail.com\n");
        emailContent.append("Phone: +1-555-123-4567\n\n");
        
        emailContent.append(getMessage.apply("email.thankYouAgain")).append("\n");
        emailContent.append(getMessage.apply("email.lookForward")).append("\n\n");
        emailContent.append(getMessage.apply("email.bestRegards")).append(",\n");
        emailContent.append(getMessage.apply("email.team"));
        
        return emailContent.toString();
    }
    
    // Helper method to provide default English text for each key
    private String getDefaultEnglishText(String key) {
        return switch (key) {
            case "email.subject" -> "Booking Confirmation - Phegon Hotel";
            case "email.dear" -> "Dear";
            case "email.thankYou" -> "Thank you for choosing Phegon Hotel! Your booking has been confirmed.";
            case "email.bookingDetails" -> "BOOKING DETAILS";
            case "email.confirmationCode" -> "Confirmation Code";
            case "email.checkInDate" -> "Check-in Date";
            case "email.checkOutDate" -> "Check-out Date";
            case "email.numberOfAdults" -> "Number of Adults";
            case "email.numberOfChildren" -> "Number of Children";
            case "email.totalGuests" -> "Total Guests";
            case "email.roomDetails" -> "ROOM DETAILS";
            case "email.roomType" -> "Room Type";
            case "email.roomPricePerNight" -> "Room Price per Night";
            case "email.roomDescription" -> "Room Description";
            case "email.pricing" -> "PRICING";
            case "email.pricePerNight" -> "Price per Night";
            case "email.numberOfNights" -> "Number of Nights";
            case "email.totalPrice" -> "Total Price";
            case "email.importantInformation" -> "IMPORTANT INFORMATION";
            case "email.arriveOnDate" -> "Please arrive at the hotel on your check-in date";
            case "email.checkInTime" -> "Check-in time: 2:00 PM";
            case "email.checkOutTime" -> "Check-out time: 11:00 AM";
            case "email.bringValidID" -> "Please bring a valid ID for check-in";
            case "email.keepConfirmationCode" -> "Keep this confirmation code for your records";
            case "email.contactInformation" -> "CONTACT INFORMATION";
            case "email.hotel" -> "Phegon Hotel";
            case "email.thankYouAgain" -> "Thank you for choosing Phegon Hotel!";
            case "email.lookForward" -> "We look forward to welcoming you.";
            case "email.bestRegards" -> "Best regards";
            case "email.team" -> "Phegon Hotel Team";
            default -> key;
        };
    }
} 