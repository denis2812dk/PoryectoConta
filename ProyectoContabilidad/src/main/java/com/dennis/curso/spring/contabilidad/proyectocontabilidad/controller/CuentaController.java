package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {
    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
   public List<Cuenta> all() {return cuentaService.findAll();}
    @PostMapping
    public Cuenta create(@Valid @RequestBody Cuenta cuenta) {
        return cuentaService.save(cuenta);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        cuentaService.deleteById(id);
    }
    @PatchMapping("/{id}/inactivar")
    public ResponseEntity<Void> inactivar(@PathVariable String id) {
        cuentaService.inactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivar")
    public ResponseEntity<Void> reactivar(@PathVariable String id) {
        cuentaService.reactivar(id);
        return ResponseEntity.noContent().build();
    }
}
