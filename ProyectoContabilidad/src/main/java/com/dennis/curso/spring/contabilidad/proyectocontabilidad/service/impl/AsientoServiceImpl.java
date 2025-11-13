package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;

import ch.qos.logback.core.util.StringUtil;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.AsientoRequest;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Cuenta;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.AsientoRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.CuentaRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.AsientoService;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.CuentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@Service
public class AsientoServiceImpl  implements AsientoService {
    private final AsientoRepository asientoRepo;
    private final CuentaRepository cuentaRepo;

    public AsientoServiceImpl(AsientoRepository asientoRepo, CuentaRepository cuentaRepo) {
        this.asientoRepo = asientoRepo;
        this.cuentaRepo = cuentaRepo;
    }

    @Override
    @Transactional
    public Asiento crear(AsientoRequest req) { //implementacion para crear un asiento
        if (req.partidas == null || req.partidas.size() < 2) {
            throw new IllegalArgumentException("El asiento debe tener al menos dos partidas.");
        }

        Asiento a = new Asiento();
        a.setFecha(req.fecha);
        a.setDescripcion(req.descripcion);

        BigDecimal totalDebe = BigDecimal.ZERO;
        BigDecimal totalHaber = BigDecimal.ZERO;

        for (AsientoRequest.PartidaDTO dto : req.partidas) {
            if (dto.cuentaId == null || dto.cuentaId.isBlank()) {
                throw new IllegalArgumentException("Falta cuentaId en una partida.");
            }

            Long cuentaPk;
            try {
                cuentaPk = Long.valueOf(dto.cuentaId.trim()); // si tu PK es UUID cámbialo
            } catch (NumberFormatException nfe) {
                throw new IllegalArgumentException("cuentaId inválido: " + dto.cuentaId);
            }

            Cuenta cuenta = cuentaRepo.findById(String.valueOf(cuentaPk))
                    .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada: " + dto.cuentaId));

            BigDecimal debe  = dto.debe  == null ? BigDecimal.ZERO : dto.debe;
            BigDecimal haber = dto.haber == null ? BigDecimal.ZERO : dto.haber;

            boolean dPos = debe.compareTo(BigDecimal.ZERO) > 0;
            boolean hPos = haber.compareTo(BigDecimal.ZERO) > 0;
            if ((dPos && hPos) || (!dPos && !hPos)) {
                throw new IllegalArgumentException("Cada partida debe tener valor solo en Debe o solo en Haber (> 0).");
            }

            Partida p = new Partida();
            p.setCuenta(cuenta);
            p.setDebe(debe);
            p.setHaber(haber);

            a.addPartida(p);

            totalDebe  = totalDebe.add(debe);
            totalHaber = totalHaber.add(haber);
        }

        if (totalDebe.compareTo(totalHaber) != 0) {
            throw new IllegalArgumentException("El asiento no está balanceado (Debe ≠ Haber).");
        }

        return asientoRepo.save(a);
    }

    @Override
    public List<Asiento> findAll() {
        return asientoRepo.findAll();
    } //implementacion para listar todos los asientos

    @Override
    @Transactional
    public Asiento actualizar(Long id, AsientoRequest req) {
        if (req.partidas == null || req.partidas.size() < 2) {
            throw new IllegalArgumentException("El asiento debe tener al menos dos partidas.");
        }

        Asiento a = asientoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asiento no encontrado: " + id));

        a.setFecha(req.fecha);
        a.setDescripcion(req.descripcion);

        // Limpiar partidas anteriores (por orphanRemoval se borran en BD)
        a.getPartidas().clear();

        BigDecimal totalDebe = BigDecimal.ZERO;
        BigDecimal totalHaber = BigDecimal.ZERO;

        for (AsientoRequest.PartidaDTO dto : req.partidas) {
            if (dto.cuentaId == null || dto.cuentaId.isBlank()) {
                throw new IllegalArgumentException("Falta cuentaId en una partida.");
            }

            Long cuentaPk;
            try {
                // tus IDs de cuenta son String, pero numéricos, así que reutilizamos
                cuentaPk = Long.valueOf(dto.cuentaId.trim());
            } catch (NumberFormatException nfe) {
                throw new IllegalArgumentException("cuentaId inválido: " + dto.cuentaId);
            }

            // OJO: Cuenta.id es String, así que se sigue buscando como String
            Cuenta cuenta = cuentaRepo.findById(String.valueOf(cuentaPk))
                    .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada: " + dto.cuentaId));

            BigDecimal debe  = dto.debe  == null ? BigDecimal.ZERO : dto.debe;
            BigDecimal haber = dto.haber == null ? BigDecimal.ZERO : dto.haber;

            boolean dPos = debe.compareTo(BigDecimal.ZERO) > 0;
            boolean hPos = haber.compareTo(BigDecimal.ZERO) > 0;
            if ((dPos && hPos) || (!dPos && !hPos)) {
                throw new IllegalArgumentException("Cada partida debe tener valor solo en Debe o solo en Haber (> 0).");
            }

            Partida p = new Partida();
            p.setCuenta(cuenta);
            p.setDebe(debe);
            p.setHaber(haber);

            a.addPartida(p);

            totalDebe  = totalDebe.add(debe);
            totalHaber = totalHaber.add(haber);
        }

        if (totalDebe.compareTo(totalHaber) != 0) {
            throw new IllegalArgumentException("El asiento no está balanceado (Debe ≠ Haber).");
        }

        return asientoRepo.save(a);
    }

    @Override
    @Transactional(readOnly = true)
    public Asiento findById(Long id) {
        return asientoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asiento no encontrado: " + id));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Asiento a = asientoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asiento no encontrado: " + id));
        asientoRepo.delete(a);
    }
}
