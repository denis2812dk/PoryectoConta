package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service;

import java.util.Map;

public interface ReportesService {
    Map<String, Object> balanceComprobacion();
    Map<String, Object> estadoResultados();
    Map<String, Object> balanceGeneral();
}
