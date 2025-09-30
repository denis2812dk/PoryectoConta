package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.CuentaRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.PartidaRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository repo;
    private final PartidaRepository partidaRepo;

    public CuentaServiceImpl(CuentaRepository repo, PartidaRepository partidaRepo) {//
        this.repo = repo;
        this.partidaRepo = partidaRepo;
    }


    @Override
    public List<Cuenta> findAll() { //Iplementacion para listar todas las cuentas
        List<Cuenta> cuentas = new ArrayList<>();
        repo.findAll().forEach(cuentas::add);
        return cuentas;
    }

    @Override
    public Cuenta save(Cuenta c){return repo.save(c);} //implementacion para guardar una cuenta

    @Override
    public boolean exists(String id){return repo.existsById(id);} //implementacion para verificar si una cuesta existe

    @Override
    @Transactional
    public void deleteById(String id) { //inplementacion de borrar una cuenta por id
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("La cuenta " + id + " no existe");
        }
        long movimientos = partidaRepo.countByCuenta_Id(id);
        if (movimientos > 0) {
            throw new IllegalStateException("No se puede eliminar: la cuenta tiene movimientos (" + movimientos + ")");
        }
        repo.deleteById(id);

    }

    @Override
    @Transactional
    public Cuenta update(String id, Cuenta body) { //implementacion eliminar una cuenta
        Cuenta c = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Cuenta no encontrada: " + id));


        if (body.getNombre() != null) c.setNombre(body.getNombre().trim());
        if (body.getTipo() != null)   c.setTipo(body.getTipo().trim());
        if (body.getActivo() != null) c.setActivo(body.getActivo());


        return c;
    }

    @Override
    @Transactional //implementacion inactivar una cuenta
    public void inactivar(String id) {
        Cuenta c = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("La cuenta " + id + " no existe"));
        c.setActivo(false);
    }

    @Override
    @Transactional //inplementacion inactivar una cuenta
    public void reactivar(String id) {
        Cuenta c = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("La cuenta " + id + " no existe"));
        c.setActivo(true);
    }
}
