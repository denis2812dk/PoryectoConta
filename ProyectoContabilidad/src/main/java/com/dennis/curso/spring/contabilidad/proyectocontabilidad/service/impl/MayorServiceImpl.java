package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;


import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.AsientoRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.MayorService;
import org.hibernate.query.NativeQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class MayorServiceImpl implements MayorService {
    private final AsientoRepository asientoRepository;

    public MayorServiceImpl(AsientoRepository asientoRepository) {
        this.asientoRepository = asientoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> generarMayor(){
        Iterable<Asiento> asientos = asientoRepository.findAll();

        Map<String, Object> mayor = new LinkedHashMap<>();

        for(Asiento asiento: asientos){
            if(asiento.getPartidas() == null) continue;
            for(Partida partida: asiento.getPartidas()){
                if(partida.getCuenta() == null || partida.getCuenta().getId() == null) continue;
                final String cuentaId = partida.getCuenta().getId();
                final String nombre = Optional.ofNullable(partida.getCuenta().getNombre()).orElse(cuentaId);

                @SuppressWarnings("unchecked")
                Map<String, Object> lista = (Map<String, Object>) mayor.computeIfAbsent(cuentaId, id -> {
                    Map<String, Object> mayor1 = new LinkedHashMap<>();
                    mayor1.put("cuentaId", cuentaId);
                    mayor1.put("nombre", nombre);
                    mayor1.put("debe", BigDecimal.ZERO);
                    mayor1.put("haber", BigDecimal.ZERO);
                    mayor1.put("saldo", BigDecimal.ZERO);
                    mayor1.put("movimientos", new ArrayList<Map<String, Object>>());
                    return mayor1;
                });

                BigDecimal d = Optional.ofNullable(partida.getDebe()).orElse(BigDecimal.ZERO);
                BigDecimal h = Optional.ofNullable(partida.getHaber()).orElse(BigDecimal.ZERO);
                lista.put("debe",  ((BigDecimal) lista.get("debe")).add(d));
                lista.put("haber", ((BigDecimal) lista.get("haber")).add(h));
                BigDecimal nuevoSaldo = ((BigDecimal)lista.get("saldo")).add(d.subtract(h));
                lista.put("saldo", nuevoSaldo);
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> movs = (List<Map<String, Object>>) lista.get("movimientos");
                Map<String, Object> mov = new LinkedHashMap<>();
                mov.put("fecha", asiento.getFecha());
                mov.put("descripcion", asiento.getDescripcion());
                mov.put("debe", d);
                mov.put("haber", h);
                mov.put("saldoAcumulado", nuevoSaldo);
                movs.add(mov);
            }
        }
        return mayor;
    }
}
