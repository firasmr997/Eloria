package com.eloria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EloriaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EloriaApplication.class, args);
    }
}
