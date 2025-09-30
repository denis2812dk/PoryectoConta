package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.AsientoRequest;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;

import java.util.List;

public interface AsientoService {
    Asiento crear(AsientoRequest req); //metodo abstracto para crear
    List<Asiento> findAll(); // metodo abstracto para listal todos
}
