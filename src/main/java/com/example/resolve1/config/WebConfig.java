package com.example.resolve1.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow CORS on all API endpoints
                .allowedOrigins(
                        "https://smart-grievance-6x8icrpny-anees-kishwars-projects.vercel.app", // Your specific Vercel URL
                        "http://localhost:3000" // Keep localhost allowed for your local testing
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache the CORS response for 1 hour
    }
}