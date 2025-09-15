package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;

import ch.qos.logback.core.util.StringUtil;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.AsientoRequest;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.AsientoRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.AsientoService;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@Service
public class AsientoServiceImpl  implements AsientoService {

        private final AsientoRepository repo;
        private final CuentaService cuentaService;

    public AsientoServiceImpl(AsientoRepository repo, CuentaService cuentaService) {
        this.repo = repo;
        this.cuentaService = cuentaService;
    }

     @Override
     public List<Asiento> findAll() {
         List<Asiento> lista = new ArrayList<>();
         repo.findAll().forEach(lista::add);
         return lista;
     }

    @Override
    public Asiento save(AsientoRequest req) {
        if (req == null || req.partidas == null || req.partidas.size() < 2) {
            throw new IllegalArgumentException("El asiento debe tener al menos 2 partidas");
        }
        BigDecimal totalDebe = BigDecimal.ZERO;
        BigDecimal totalHaber = BigDecimal.ZERO;
        List<Partida> partidas = new ArrayList<>();
        for (AsientoRequest.PartidaDTO partida : req.partidas) {
            if (!StringUtils.hasText(partida.cuentaId)) {
                throw new IllegalArgumentException("Cada Partida debe tener cuentaId");
            }
            if (!cuentaService.exists(partida.cuentaId)) {
                throw new IllegalArgumentException("La cuenta" + partida.cuentaId + " no existe");
            }
            BigDecimal debe = partida.debe == null ? BigDecimal.ZERO : partida.debe;
            BigDecimal haber = partida.haber == null ? BigDecimal.ZERO : partida.haber;
            if (debe.signum() < 0 || haber.signum() < 0) {
                throw new IllegalArgumentException("Los montos no pueden ser negativos");

            }
            if (debe.signum() > 0 && haber.signum() > 0) {
                throw new IllegalArgumentException("No se puede cargar y abonar en la misma partida");
            }
            if (debe.signum() == 0 && haber.signum() == 0) {
                throw new IllegalArgumentException("Cada partida debe tener Debe o Haber mayor a 0 ");
            }

            Cuenta cuenta = new Cuenta();
            cuenta.setId(partida.cuentaId);

            Partida p = new Partida();
            p.setCuenta(cuenta);
            p.setDebe(debe);
            p.setHaber(haber);
            partidas.add(p);

            totalDebe = totalDebe.add(debe);
            totalHaber = totalHaber.add(haber);



         ;
        }
        if (totalDebe.compareTo(totalHaber) != 0 || totalDebe.signum() == 0) {

            throw new IllegalArgumentException("El asiento no esta balanceado");

        }
        Asiento a = new Asiento();
        a.setFecha(req.fecha);
        a.setDescripcion(req.descripcion);
        a.setPartidas(partidas);

        return repo.save(a);
    }
}
