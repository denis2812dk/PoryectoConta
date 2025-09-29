package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CuentaRepository extends CrudRepository<Cuenta,String> {
    List<Cuenta> findAllByActivoTrue();
}
