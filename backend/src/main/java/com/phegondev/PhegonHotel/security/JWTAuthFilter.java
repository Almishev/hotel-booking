package com.phegondev.PhegonHotel.security;


import com.phegondev.PhegonHotel.service.CustomUserDetailsService;
import com.phegondev.PhegonHotel.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String userEmail;

        System.out.println("JWT Filter - Request URI: " + request.getRequestURI());
        System.out.println("JWT Filter - Authorization header: " + authHeader);

        // Skip JWT validation for public endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/auth/") ||
            requestURI.equals("/rooms/all") ||
            requestURI.equals("/rooms/all-available-rooms") ||
            requestURI.equals("/rooms/types") ||
            requestURI.equals("/rooms/available-rooms-by-date-and-type") ||
            requestURI.startsWith("/rooms/room-by-id/") ||
            requestURI.startsWith("/bookings/get-by-confirmation-code/") ||
            requestURI.startsWith("/users/get-by-id/") ||
            requestURI.startsWith("/users/get-user-bookings/")) {
            System.out.println("JWT Filter - Public endpoint, skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || authHeader.isBlank() || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT Filter - Invalid or missing Authorization header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Missing or invalid Authorization header\"}");
            return;
        }

        try {
            jwtToken = authHeader.substring(7);
            System.out.println("JWT Filter - Token length: " + jwtToken.length());
            System.out.println("JWT Filter - Token starts with: " + jwtToken.substring(0, Math.min(20, jwtToken.length())));
            
            userEmail = jwtUtils.extractUsername(jwtToken);
            System.out.println("JWT Filter - Extracted email: " + userEmail);

            if (userEmail == null) {
                System.out.println("JWT Filter - Could not extract email from token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"Invalid token format\"}");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("JWT Filter - Loading user details for email: " + userEmail);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                System.out.println("JWT Filter - User details loaded: " + (userDetails != null ? userDetails.getUsername() : "null"));
                System.out.println("JWT Filter - User authorities: " + (userDetails != null ? userDetails.getAuthorities() : "null"));
                
                if (userDetails != null && jwtUtils.isValidToken(jwtToken, userDetails)) {
                    System.out.println("JWT Filter - Token is valid, setting authentication");
                    SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    securityContext.setAuthentication(token);
                    SecurityContextHolder.setContext(securityContext);
                    System.out.println("JWT Filter - Authentication set successfully");
                } else {
                    System.out.println("JWT Filter - Token validation failed");
                    System.out.println("JWT Filter - UserDetails null: " + (userDetails == null));
                    if (userDetails != null) {
                        System.out.println("JWT Filter - Token valid check: " + jwtUtils.isValidToken(jwtToken, userDetails));
                    }
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\":\"Invalid or expired token\"}");
                    return;
                }
            } else {
                System.out.println("JWT Filter - Authentication already exists");
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            System.out.println("JWT Filter - Error processing token: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Error processing authentication token\"}");
            return;
        }
    }
}
