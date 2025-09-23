package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.MayorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/mayor")
public class MayorController {

    private final MayorService mayorService;

    public MayorController(MayorService mayorService) {
        this.mayorService = mayorService;
    }

    @GetMapping
    public Map<String, Object>mayor() {
        return  mayorService.generarMayor();
    }
}
