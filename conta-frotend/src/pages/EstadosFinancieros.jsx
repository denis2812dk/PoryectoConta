import { useEffect, useState } from "react";
import { reportes } from "../app/api";
import DateFilters from "../components/DateFilters";

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EstadosFinancieros() {
  const [er, setEr] = useState(null);
  const [bg, setBg] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // filtros para ER (rango) y BG (corte)
  const [erFiltros, setErFiltros] = useState({ desde: "", hasta: "" });
  const [bgHasta, setBgHasta] = useState("");

  const load = async (erParams = erFiltros, hasta = bgHasta) => {
    try {
      setLoading(true); setErr("");
      const [r1, r2] = await Promise.all([
        reportes.estadoResultados(erParams.desde, erParams.hasta), // período
        reportes.balanceGeneral(hasta) // al corte
      ]);
      setEr(r1); setBg(r2);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* inicial */ // eslint-disable-next-line
  }, []);

  return (
    <div className="p-6 grid gap-6">
      <h2 className="text-xl font-semibold">Estados Financieros</h2>
      {err && <div className="text-red-600">{err}</div>}
      {loading && "Cargando..."}

      {/* Controles de fecha */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="font-semibold mb-2">Rango para Estado de Resultados</div>
          <DateFilters
            initialDesde={erFiltros.desde}
            initialHasta={erFiltros.hasta}
            onApply={({ desde, hasta }) => { setErFiltros({ desde, hasta }); load({ desde, hasta }, bgHasta); }}
            onClear={() => { setErFiltros({ desde: "", hasta: "" }); load({ desde: "", hasta: "" }, bgHasta); }}
          />
        </div>
        <div className="rounded-xl border p-4">
          <div className="font-semibold mb-2">Fecha de corte para Balance General</div>
          <DateFilters
            showDesde={false}
            initialHasta={bgHasta}
            onApply={({ hasta }) => { setBgHasta(hasta); load(erFiltros, hasta); }}
            onClear={() => { setBgHasta(""); load(erFiltros, ""); }}
          />
        </div>
      </div>

      {er && (
        <section className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Estado de Resultados</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>Ingresos</div><div className="text-right">{money(er.ingresos)}</div>
            <div>Costos y Gastos</div><div className="text-right">{money(er.costosGastos)}</div>
            <div className="font-semibold">Utilidad del Ejercicio</div>
            <div className="text-right font-semibold">{money(er.utilidad)}</div>
          </div>
        </section>
      )}

      {bg && (
        <section className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Balance General</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>Activos</div><div className="text-right">{money(bg.activos)}</div>
            <div>Pasivos</div><div className="text-right">{money(bg.pasivos)}</div>
            <div>Capital (sin utilidad)</div><div className="text-right">{money(bg.capital)}</div>
            <div>Utilidad</div><div className="text-right">{money(bg.utilidad)}</div>
            <div className="font-semibold">Patrimonio Total</div>
            <div className="text-right font-semibold">{money(bg.patrimonioTotal)}</div>
            <div className="col-span-2 text-sm text-gray-600 mt-2">
              ¿Cuadra? {bg.equilibrioOK ? "Sí ✅" : "No ❌"} &nbsp; (Activos ?= Pasivos + Patrimonio)
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
