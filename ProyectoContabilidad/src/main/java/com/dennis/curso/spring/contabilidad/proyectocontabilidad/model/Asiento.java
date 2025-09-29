package com.dennis.curso.spring.contabilidad.proyectocontabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "asientos")
public class Asiento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    @Column(length = 500)
    private String descripcion;

    @OneToMany(
            mappedBy = "asiento",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Partida> partidas = new ArrayList<>();

    // helper opcional
    public void addPartida(Partida p) {
        p.setAsiento(this);
        this.partidas.add(p);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public List<Partida> getPartidas() {
        return partidas;
    }

    public void setPartidas(List<Partida> partidas) {
        this.partidas = partidas;
    }
}
