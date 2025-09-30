package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService; //crea un objeto de cuenta service

    public CuentaController(CuentaService cuentaService) { //
        this.cuentaService = cuentaService;
    }

    @GetMapping
   public List<Cuenta> all() {return cuentaService.findAll();}//lista todas las cuentas en una lista mediante la peticion get
    @PostMapping
    public Cuenta create(@Valid @RequestBody Cuenta cuenta) {
        return cuentaService.save(cuenta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuenta> update( //actualiza una cuenta mediante mediante put
            @PathVariable String id,
            @Valid @RequestBody Cuenta body) {

        if (body.getId() != null && !id.equals(body.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Cuenta updated = cuentaService.update(id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}") //elimina una cuenta mediante una peticion delete
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
