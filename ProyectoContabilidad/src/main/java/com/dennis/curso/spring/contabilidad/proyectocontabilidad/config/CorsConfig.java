package com.dennis.curso.spring.contabilidad.proyectocontabilidad.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

        @Value("${app.cors.allowed.origins}")
        private String allowedOrigins;

        @Bean
        public CorsFilter corsFilter() {
            CorsConfiguration corsConfiguration = new CorsConfiguration();
            corsConfiguration.setAllowCredentials(true);
            corsConfiguration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
            corsConfiguration.addAllowedHeader("*");
            corsConfiguration.addAllowedMethod("*");

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", corsConfiguration);
            return new CorsFilter(source);
        }

}
