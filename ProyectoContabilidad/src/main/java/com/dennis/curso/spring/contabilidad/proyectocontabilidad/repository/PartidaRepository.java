package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import org.springframework.data.repository.CrudRepository;

public interface PartidaRepository extends CrudRepository<Partida,String> {
    //repository de Partida que extiende de crud repository
    long countByCuenta_Id(String id); //funcion abstracta para contar por id de una cuenta
}
