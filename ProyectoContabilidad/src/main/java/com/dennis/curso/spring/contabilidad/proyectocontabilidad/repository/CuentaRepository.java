package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CuentaRepository extends CrudRepository<Cuenta,String> {
    //repository de cuenta que extiende de CrudRepository
    List<Cuenta> findAllByActivoTrue(); //funciona abstracta para buscar por activo
}
