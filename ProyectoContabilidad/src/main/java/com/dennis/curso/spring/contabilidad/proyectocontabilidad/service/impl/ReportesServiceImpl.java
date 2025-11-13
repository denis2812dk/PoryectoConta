package com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.impl;

import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Asiento;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.model.Partida;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.repository.AsientoRepository;
import com.dennis.curso.spring.contabilidad.proyectocontabilidad.service.ReportesService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ReportesServiceImpl implements ReportesService {

    private final AsientoRepository asientoRepo;

    public ReportesServiceImpl(AsientoRepository asientoRepo) {
        this.asientoRepo = asientoRepo;
    }

    /** Construye un mapa cuentaId -> {nombre, debe, haber, saldo} (saldo = Σ(debe) - Σ(haber)) */
    private Map<String, Map<String, Object>> mayorizar() {
        Map<String, Map<String, Object>> mayor = new LinkedHashMap<>();
        List<Asiento> asientos = asientoRepo.findAll();

        for (Asiento a : asientos) {
            if (a.getPartidas() == null) continue;
            for (Partida p : a.getPartidas()) {
                if (p.getCuenta() == null || p.getCuenta().getId() == null) continue;

                String id = p.getCuenta().getId();
                String nombre = Optional.ofNullable(p.getCuenta().getNombre()).orElse(id);

                Map<String, Object> fila = mayor.computeIfAbsent(id, k -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("cuentaId", id);
                    m.put("nombre", nombre);
                    m.put("debe", BigDecimal.ZERO);
                    m.put("haber", BigDecimal.ZERO);
                    m.put("saldo", BigDecimal.ZERO);
                    return m;
                });

                BigDecimal d = Optional.ofNullable(p.getDebe()).orElse(BigDecimal.ZERO);
                BigDecimal h = Optional.ofNullable(p.getHaber()).orElse(BigDecimal.ZERO);

                fila.put("debe",  ((BigDecimal) fila.get("debe")).add(d));
                fila.put("haber", ((BigDecimal) fila.get("haber")).add(h));
                fila.put("saldo", ((BigDecimal) fila.get("saldo")).add(d.subtract(h)));
            }
        }
        return mayor;
    }

    /** Detecta cuentas padre: un id es padre si es prefijo de otro id distinto */
    private static Set<String> detectarPadres(Set<String> ids) {
        Set<String> padres = new HashSet<>();
        List<String> lista = new ArrayList<>(ids);
        for (int i = 0; i < lista.size(); i++) {
            String a = lista.get(i);
            for (int j = 0; j < lista.size(); j++) {
                if (i == j) continue;
                String b = lista.get(j);
                if (b.startsWith(a) && !b.equals(a)) {
                    padres.add(a);
                    break;
                }
            }
        }
        return padres;
    }

    private static boolean startsWith(String cuentaId, String prefijo) {
        return cuentaId != null && cuentaId.startsWith(prefijo);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> balanceComprobacion() {
        Map<String, Map<String, Object>> mayor = mayorizar();
        Set<String> padres = detectarPadres(mayor.keySet()); // <-- solo hojas

        BigDecimal totalDebe = BigDecimal.ZERO;
        BigDecimal totalHaber = BigDecimal.ZERO;

        List<Map<String, Object>> filas = new ArrayList<>();
        for (Map<String, Object> cta : mayor.values()) {
            String id = (String) cta.get("cuentaId");
            if (padres.contains(id)) continue; // omite padres

            String nombre = (String) cta.get("nombre");
            BigDecimal saldo = (BigDecimal) cta.get("saldo");

            BigDecimal debe  = saldo.compareTo(BigDecimal.ZERO) >= 0 ? saldo : BigDecimal.ZERO;
            BigDecimal haber = saldo.compareTo(BigDecimal.ZERO) <  0 ? saldo.abs() : BigDecimal.ZERO;

            totalDebe  = totalDebe.add(debe);
            totalHaber = totalHaber.add(haber);

            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("cuentaId", id);
            fila.put("nombre", nombre);
            fila.put("debe", debe);
            fila.put("haber", haber);
            filas.add(fila);
        }

        // Orden estable por cuentaId (legibilidad)
        filas.sort(Comparator.comparing(m -> (String) m.get("cuentaId")));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("filas", filas);
        out.put("totalDebe", totalDebe);
        out.put("totalHaber", totalHaber);
        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> estadoResultados() {
        Map<String, Map<String, Object>> mayor = mayorizar();
        Set<String> padres = detectarPadres(mayor.keySet()); // <-- solo hojas

        BigDecimal ingresos = BigDecimal.ZERO;     // grupo 5 (naturaleza acreedora)
        BigDecimal costosGastos = BigDecimal.ZERO; // grupo 4 (sumar con signo)

        for (Map<String, Object> cta : mayor.values()) {
            String id = (String) cta.get("cuentaId");
            if (padres.contains(id)) continue; // omite padres

            BigDecimal saldo = (BigDecimal) cta.get("saldo");

            if (startsWith(id, "5")) {
                // ingresos: aportan cuando el saldo es negativo (crédito)
                BigDecimal aporte = saldo.compareTo(BigDecimal.ZERO) < 0 ? saldo.abs() : BigDecimal.ZERO;
                ingresos = ingresos.add(aporte);
            } else if (startsWith(id, "4")) {
                // costos/gastos periódicos (compras, ajustes A/B/C, rebajas negativas, gastos positivos)
                costosGastos = costosGastos.add(saldo); // con su signo
            }
        }

        BigDecimal utilidad = ingresos.subtract(costosGastos);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("ingresos", ingresos);
        out.put("costosGastos", costosGastos);
        out.put("utilidad", utilidad);
        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> balanceGeneral() {
        Map<String, Map<String, Object>> mayor = mayorizar();
        Set<String> padres = detectarPadres(mayor.keySet()); // <-- solo hojas

        BigDecimal activos = BigDecimal.ZERO;  // 1xxxx  -> sumar CON SU SIGNO para netear
        BigDecimal pasivos = BigDecimal.ZERO;  // 2xxxx  -> sumar ABS de saldos negativos (acreedor)
        BigDecimal capital = BigDecimal.ZERO;  // 3xxxx  -> sumar ABS de saldos negativos (acreedor)

        for (Map<String, Object> cta : mayor.values()) {
            String id = (String) cta.get("cuentaId");
            if (padres.contains(id)) continue; // omite padres

            BigDecimal saldo = (BigDecimal) cta.get("saldo");

            if (startsWith(id, "1")) {
                activos = activos.add(saldo); // con su signo
            } else if (startsWith(id, "2")) {
                if (saldo.compareTo(BigDecimal.ZERO) < 0) {
                    pasivos = pasivos.add(saldo.abs());
                }
            } else if (startsWith(id, "3")) {
                if (saldo.compareTo(BigDecimal.ZERO) < 0) {
                    capital = capital.add(saldo.abs());
                }
            }
        }

        // Utilidad completa (positiva o negativa) calculada con la misma regla de hojas
        Map<String, Object> er = estadoResultados();
        BigDecimal utilidad = (BigDecimal) er.get("utilidad");

        BigDecimal patrimonioTotal = capital.add(utilidad);

        boolean equilibrioOK =
                activos.setScale(2, RoundingMode.HALF_UP)
                        .compareTo(pasivos.add(patrimonioTotal).setScale(2, RoundingMode.HALF_UP)) == 0;

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("activos", activos);
        out.put("pasivos", pasivos);
        out.put("capital", capital);
        out.put("utilidad", utilidad);
        out.put("patrimonioTotal", patrimonioTotal);
        out.put("equilibrioOK", equilibrioOK);
        return out;
    }
}
