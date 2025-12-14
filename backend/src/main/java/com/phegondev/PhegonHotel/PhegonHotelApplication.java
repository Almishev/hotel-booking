package com.phegondev.PhegonHotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PhegonHotelApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhegonHotelApplication.class, args);
    }

}
