package com.dennis.curso.spring.contabilidad.proyectocontabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

@Entity
@Table(name = "partidas")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cuenta_id", referencedColumnName = "id")
    private Cuenta cuenta;

    @PositiveOrZero
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal debe = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal haber = BigDecimal.ZERO;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public BigDecimal getDebe() {
        return debe;
    }

    public void setDebe(BigDecimal debe) {
        this.debe = debe;
    }

    public BigDecimal getHaber() {
        return haber;
    }

    public void setHaber(BigDecimal haber) {
        this.haber = haber;
    }
}
