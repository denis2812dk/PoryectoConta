package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;

import java.util.List;

public interface CuentaService {
    List<Cuenta> findAll();//metodo abstracto para listar todos
    Cuenta save(Cuenta c); //metodo abstracto para guardar
    boolean exists(String id); //metodo abstracto para verificar si  ya esxite la cuente
    Cuenta update(String id, Cuenta body); //metodo abstracto para actualizar
    void deleteById(String id); //mmetodo abstracto para borrar por id

    void inactivar(String id); //metodo abstracto para inactivar cuenta
    void reactivar(String id); //metodo abstracto para activar cuenta
}
