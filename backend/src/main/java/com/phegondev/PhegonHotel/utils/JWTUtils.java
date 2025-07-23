package com.phegondev.PhegonHotel.utils;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTUtils {


    private final SecretKey Key;
    private final long expirationTime;

    public JWTUtils(@Value("${jwt.secret}") String secret,
                    @Value("${jwt.expiration}") long expirationTime) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");
        this.expirationTime = expirationTime;
    }

    public String generateToken(UserDetails userDetails) {
        try {
            String token = Jwts.builder()
                    .subject(userDetails.getUsername())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + expirationTime))
                    .signWith(Key)
                    .compact();
            return token;
        } catch (Exception e) {
            throw e;
        }
    }

    public String extractUsername(String token) {
        try {
            String username = extractClaims(token, Claims::getSubject);
            return username;
        } catch (Exception e) {
            return null;
        }
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        try {
            T result = claimsTFunction.apply(Jwts.parser().verifyWith(Key).build().parseSignedClaims(token).getPayload());
            return result;
        } catch (Exception e) {
            throw e;
        }
    }

    public boolean isValidToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isExpired = isTokenExpired(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isExpired;
            return isValid;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            boolean expired = extractClaims(token, Claims::getExpiration).before(new Date());
            return expired;
        } catch (Exception e) {
            return true; // Consider expired if we can't check
        }
    }
}
