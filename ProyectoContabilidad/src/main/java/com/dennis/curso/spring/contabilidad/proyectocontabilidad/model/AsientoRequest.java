package com.dennis.curso.spring.contabilidad.proyectocontabilidad.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class AsientoRequest {
    //dto para transferir datos
    public static class PartidaDTO {
        public String cuentaId;                // viene como String desde el front
        public BigDecimal debe = BigDecimal.ZERO;
        public BigDecimal haber = BigDecimal.ZERO;
    }
    public LocalDate fecha;
    @NotBlank public String descripcion;
    @Size(min = 2) public List<PartidaDTO> partidas;


}
