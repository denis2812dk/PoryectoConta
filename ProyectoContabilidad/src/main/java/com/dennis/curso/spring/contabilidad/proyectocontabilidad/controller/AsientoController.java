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
    }//lista todos los asientos en la lista asientos con una peticion get

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody AsientoRequest req) { //crea un asiento con una peticion post
        Asiento a = asientoService.crear(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", a.getId()));
    }

    // 🔹 PUT /api/asientos/{id} → actualizar
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @Valid @RequestBody AsientoRequest req) {
        Asiento a = asientoService.actualizar(id, req);
        return ResponseEntity.ok(Map.of("id", a.getId(), "mensaje", "Asiento actualizado"));
    }

    // 🔹 DELETE /api/asientos/{id} → eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        asientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
