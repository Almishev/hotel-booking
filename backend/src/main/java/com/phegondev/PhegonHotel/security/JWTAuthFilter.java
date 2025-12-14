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
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Don't execute this filter for public endpoints
        String requestURI = request.getRequestURI();
        return requestURI.startsWith("/auth/") ||
               requestURI.equals("/rooms/all") ||
               requestURI.equals("/rooms/all-available-rooms") ||
               requestURI.equals("/rooms/types") ||
               requestURI.equals("/rooms/available-rooms-by-date-and-type") ||
               requestURI.startsWith("/rooms/room-by-id/") ||
               requestURI.startsWith("/bookings/get-by-confirmation-code/") ||
               requestURI.startsWith("/users/get-by-id/") ||
               requestURI.startsWith("/users/get-user-bookings/") ||
               requestURI.equals("/holiday-packages/all") ||
               requestURI.matches("/holiday-packages/\\d+") ||
               requestURI.startsWith("/holiday-packages/available");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // For protected endpoints, require valid JWT token
        final String authHeader = request.getHeader("Authorization");
        String jwtToken;
        String userEmail;

        if (authHeader == null || authHeader.isBlank() || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Missing or invalid Authorization header\"}");
            return;
        }

        try {
            jwtToken = authHeader.substring(7);
            
            userEmail = jwtUtils.extractUsername(jwtToken);

            if (userEmail == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"Invalid token format\"}");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                
                if (userDetails != null && jwtUtils.isValidToken(jwtToken, userDetails)) {
                    SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    securityContext.setAuthentication(token);
                    SecurityContextHolder.setContext(securityContext);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\":\"Invalid or expired token\"}");
                    return;
                }
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Error processing authentication token\"}");
            return;
        }
    }
}
