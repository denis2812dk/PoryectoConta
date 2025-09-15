package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.AsientoRequest;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.AsientoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asientos")
public class AsientoController {
    private final AsientoService asientoService;

    public AsientoController(AsientoService asientoService ) {
        this.asientoService = asientoService;
    }

    @GetMapping
    public List<Asiento> all() {
        return  asientoService.findAll();
    }

    @PostMapping
    public Asiento create(@Valid @RequestBody AsientoRequest asiento) {
        return asientoService.save(asiento);
    }
}
