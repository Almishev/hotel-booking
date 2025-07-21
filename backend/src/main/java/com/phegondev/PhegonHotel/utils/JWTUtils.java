package com.phegondev.PhegonHotel.utils;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTUtils {


    private static final long EXPIRATION_TIME = 1000 * 60 * 24 * 7; //for 7 days

    private final SecretKey Key;

    public JWTUtils() {
        String secreteString = "843567893696976453275974432697R634976R738467TR678T34865R6834R8763T478378637664538745673865783678548735687R3";
        byte[] keyBytes = secreteString.getBytes(StandardCharsets.UTF_8);
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");

    }

    public String generateToken(UserDetails userDetails) {
        try {
            String token = Jwts.builder()
                    .subject(userDetails.getUsername())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .signWith(Key)
                    .compact();
            System.out.println("JWTUtils - Generated token for user: " + userDetails.getUsername());
            System.out.println("JWTUtils - Token starts with: " + token.substring(0, Math.min(20, token.length())));
            return token;
        } catch (Exception e) {
            System.out.println("JWTUtils - Error generating token: " + e.getMessage());
            throw e;
        }
    }

    public String extractUsername(String token) {
        try {
            String username = extractClaims(token, Claims::getSubject);
            System.out.println("JWTUtils - Extracted username: " + username);
            return username;
        } catch (Exception e) {
            System.out.println("JWTUtils - Error extracting username: " + e.getMessage());
            return null;
        }
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        try {
            T result = claimsTFunction.apply(Jwts.parser().verifyWith(Key).build().parseSignedClaims(token).getPayload());
            System.out.println("JWTUtils - Successfully extracted claims");
            return result;
        } catch (Exception e) {
            System.out.println("JWTUtils - Error extracting claims: " + e.getMessage());
            throw e;
        }
    }

    public boolean isValidToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isExpired = isTokenExpired(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isExpired;
            System.out.println("JWTUtils - Token validation: username=" + username + ", expected=" + userDetails.getUsername() + ", expired=" + isExpired + ", valid=" + isValid);
            return isValid;
        } catch (Exception e) {
            System.out.println("JWTUtils - Error validating token: " + e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            boolean expired = extractClaims(token, Claims::getExpiration).before(new Date());
            System.out.println("JWTUtils - Token expired check: " + expired);
            return expired;
        } catch (Exception e) {
            System.out.println("JWTUtils - Error checking token expiration: " + e.getMessage());
            return true; // Consider expired if we can't check
        }
    }
}
