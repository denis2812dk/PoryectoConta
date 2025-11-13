package com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface AsientoRepository extends JpaRepository<Asiento,Long> {
 //repository de asientos que extendera de JpaRepository
}
