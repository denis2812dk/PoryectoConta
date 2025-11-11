package com.dennis.curso.spring.contabilidad.proyectocontabilidad.controller;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.ReportesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    private final ReportesService srv;

    public ReportesController(ReportesService srv) {
        this.srv = srv;
    }

    // 1.1 Balance de comprobación
    @GetMapping("/balance-comprobacion")
    public Map<String, Object> balanceComprobacion() {
        return srv.balanceComprobacion();
    }

    // 1.2 Estado de Resultados
    @GetMapping("/estado-resultados")
    public Map<String, Object> estadoResultados() {
        return srv.estadoResultados();
    }

    // 1.2 Balance General (transfiere utilidad)
    @GetMapping("/balance-general")
    public Map<String, Object> balanceGeneral() {
        return srv.balanceGeneral();
    }
}
