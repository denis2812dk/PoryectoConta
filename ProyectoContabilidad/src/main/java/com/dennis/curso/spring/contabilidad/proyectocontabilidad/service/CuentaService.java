package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;

import java.util.List;

public interface CuentaService {
    List<Cuenta> findAll();
    Cuenta save(Cuenta c);
    boolean exists(String id);
    Cuenta update(String id, Cuenta body);
    void deleteById(String id);

    void inactivar(String id);
    void reactivar(String id);
}
