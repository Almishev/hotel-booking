package com.phegondev.PhegonHotel.service;

import com.phegondev.PhegonHotel.entity.Booking;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            User user = booking.getUser();
            Room room = booking.getRoom();
            
            message.setTo(user.getEmail());
            message.setSubject("Booking Confirmation - Phegon Hotel");
            
            String emailContent = buildBookingConfirmationEmail(booking, user, room);
            message.setText(emailContent);
            
            mailSender.send(message);
            
        } catch (Exception e) {
            // Log the error but don't throw it to avoid breaking the booking process
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }
    }

    private String buildBookingConfirmationEmail(Booking booking, User user, Room room) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        StringBuilder emailContent = new StringBuilder();
        emailContent.append("Dear ").append(user.getName()).append(",\n\n");
        emailContent.append("Thank you for choosing Phegon Hotel! Your booking has been confirmed.\n\n");
        emailContent.append("BOOKING DETAILS:\n");
        emailContent.append("================\n");
        emailContent.append("Confirmation Code: ").append(booking.getBookingConfirmationCode()).append("\n");
        emailContent.append("Check-in Date: ").append(booking.getCheckInDate().format(formatter)).append("\n");
        emailContent.append("Check-out Date: ").append(booking.getCheckOutDate().format(formatter)).append("\n");
        emailContent.append("Number of Adults: ").append(booking.getNumOfAdults()).append("\n");
        emailContent.append("Number of Children: ").append(booking.getNumOfChildren()).append("\n");
        emailContent.append("Total Guests: ").append(booking.getTotalNumOfGuest()).append("\n\n");
        
        emailContent.append("ROOM DETAILS:\n");
        emailContent.append("==============\n");
        emailContent.append("Room Type: ").append(room.getRoomType()).append("\n");
        emailContent.append("Room Price per Night: $").append(room.getRoomPrice()).append("\n");
        emailContent.append("Room Description: ").append(room.getRoomDescription()).append("\n\n");
        
        // Calculate total price
        long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        double totalPrice = room.getRoomPrice().doubleValue() * days;
        
        emailContent.append("PRICING:\n");
        emailContent.append("========\n");
        emailContent.append("Price per Night: $").append(room.getRoomPrice()).append("\n");
        emailContent.append("Number of Nights: ").append(days).append("\n");
        emailContent.append("Total Price: $").append(String.format("%.2f", totalPrice)).append("\n\n");
        
        emailContent.append("IMPORTANT INFORMATION:\n");
        emailContent.append("======================\n");
        emailContent.append("- Please arrive at the hotel on your check-in date\n");
        emailContent.append("- Check-in time: 2:00 PM\n");
        emailContent.append("- Check-out time: 11:00 AM\n");
        emailContent.append("- Please bring a valid ID for check-in\n");
        emailContent.append("- Keep this confirmation code for your records\n\n");
        
        emailContent.append("CONTACT INFORMATION:\n");
        emailContent.append("====================\n");
        emailContent.append("Hotel: Phegon Hotel\n");
        emailContent.append("Email: mineralhotelinfo@gmail.com\n");
        emailContent.append("Phone: +1-555-123-4567\n\n");
        
        emailContent.append("Thank you for choosing Phegon Hotel!\n");
        emailContent.append("We look forward to welcoming you.\n\n");
        emailContent.append("Best regards,\n");
        emailContent.append("Phegon Hotel Team");
        
        return emailContent.toString();
    }
} 