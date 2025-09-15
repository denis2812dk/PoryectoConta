package com.dennis.curso.spring.contabilidad.proyectocontabilidad.config;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.CuentaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Datos {


    @Bean
    CommandLineRunner seedCuentas(CuentaRepository cuentaRepository) {

        return args -> {
            if(cuentaRepository.count() == 0){
                Cuenta cuenta1 = new Cuenta();
                cuenta1.setId("1101");
                cuenta1.setNombre("Caja");
                cuenta1.setTipo("Activo");
                cuentaRepository.save(cuenta1);
            }

        };

    }

}
