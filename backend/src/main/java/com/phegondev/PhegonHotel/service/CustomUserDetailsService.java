package com.phegondev.PhegonHotel.service;

import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("CustomUserDetailsService - Loading user by username: " + username);
        try {
            UserDetails userDetails = userRepository.findByEmail(username).orElseThrow(() -> new OurException("Username/Email not Found"));
            System.out.println("CustomUserDetailsService - User found: " + userDetails.getUsername());
            System.out.println("CustomUserDetailsService - User authorities: " + userDetails.getAuthorities());
            return userDetails;
        } catch (Exception e) {
            System.out.println("CustomUserDetailsService - Error loading user: " + e.getMessage());
            throw e;
        }
    }
}
