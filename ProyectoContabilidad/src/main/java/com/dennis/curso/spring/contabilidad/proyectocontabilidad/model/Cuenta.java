package com.dennis.curso.spring.contabilidad.proyectocontabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cuentas")
public class Cuenta {

    @Id
    @Column(length = 20)
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    @NotBlank
    @Column(nullable = false)
    private String tipo;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
