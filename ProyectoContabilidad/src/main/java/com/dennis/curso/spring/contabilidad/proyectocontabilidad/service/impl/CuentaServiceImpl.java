package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.CuentaRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository repo;

    public CuentaServiceImpl(CuentaRepository repo) {
        this.repo = repo;
    }


    @Override
    public List<Cuenta> findAll() {
        List<Cuenta> cuentas = new ArrayList<>();
        repo.findAll().forEach(cuentas::add);
        return cuentas;
    }

    @Override
    public Cuenta save(Cuenta c){return repo.save(c);}

    @Override
    public boolean exists(String id){return repo.existsById(id);}
}
