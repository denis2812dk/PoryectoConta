package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import org.springframework.data.repository.CrudRepository;

public interface CuentaRepository extends CrudRepository<Cuenta,String> {
}
