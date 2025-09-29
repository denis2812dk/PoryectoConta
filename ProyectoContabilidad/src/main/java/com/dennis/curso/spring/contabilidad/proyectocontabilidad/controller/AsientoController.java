package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.AsientoRequest;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.AsientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> crear(@Valid @RequestBody AsientoRequest req) {
        Asiento a = asientoService.crear(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", a.getId()));
    }
}
