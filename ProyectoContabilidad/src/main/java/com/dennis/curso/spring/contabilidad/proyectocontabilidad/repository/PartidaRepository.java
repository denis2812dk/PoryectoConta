package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import org.springframework.data.repository.CrudRepository;

public interface PartidaRepository extends CrudRepository<Partida,String> {
    long countByCuenta_Id(String id);
}
