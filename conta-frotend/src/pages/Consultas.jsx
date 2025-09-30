// src/pages/Consultas.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";

// util dinero
const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// parseo seguro de fecha ISO (yyyy-mm-dd)
const parseISO = (s) => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export default function Consultas() {
  // fuente de verdad: movimientos aplanados
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filtros efectivos (aplicados)
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // inputs (lo que escribe el usuario)
  const [qInput, setQInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  // cuenta para mostrar saldo (no filtra tabla)
  const [cuentaSel, setCuentaSel] = useState(""); // código exacto (ej. "110101")

  // cargar asientos y aplanar a movimientos
  const cargar = async () => {
    setLoading(true);
    setErr("");
    try {
      const asientos = await api.getAsientos(); // [{ id, fecha, descripcion, partidas: [...] }, ...]
      const flat = (Array.isArray(asientos) ? asientos : [])
        .flatMap((a) =>
          (a.partidas || []).map((p) => ({
            asientoId: a.id,
            fecha: a.fecha,
            desc: a.descripcion || "",
            cuentaId: p.cuenta?.id ?? "",
            cuentaNombre: p.cuenta?.nombre ?? "",
            debe: Number(p.debe || 0),
            haber: Number(p.haber || 0),
          }))
        )
        // orden por fecha desc (y por asientoId desc como desempate)
        .sort((x, y) => {
          const dx = new Date(x.fecha).getTime() || 0;
          const dy = new Date(y.fecha).getTime() || 0;
          if (dy !== dx) return dy - dx;
          return (y.asientoId || 0) - (x.asientoId || 0);
        });

      setMovs(flat);
    } catch (e) {
      console.warn("No se pudieron cargar movimientos:", e);
      setErr("No se pudieron cargar los movimientos.");
      setMovs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // aplicar filtros cuando presionan "Buscar"
  const aplicarBusqueda = () => {
    setQ(qInput);
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
  };

  // refrescar vuelve a pedir datos y mantiene filtros efectivos
  const refrescar = () => {
    cargar();
  };

  // colección filtrada (por descripción + fechas)
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const df = dateFrom ? parseISO(dateFrom) : null;
    const dt = dateTo ? parseISO(dateTo) : null;

    return movs.filter((m) => {
      // por descripción (del asiento)
      const byText = !ql || String(m.desc).toLowerCase().includes(ql);

      // por fecha
      const dmov = parseISO(m.fecha);
      const byDate = !dmov ? true : (!df || dmov >= df) && (!dt || dmov <= dt);

      return byText && byDate;
    });
  }, [movs, q, dateFrom, dateTo]);

  // totales generales
  const totalDebe = useMemo(
    () => filtered.reduce((acc, m) => acc + (Number(m.debe) || 0), 0),
    [filtered]
  );
  const totalHaber = useMemo(
    () => filtered.reduce((acc, m) => acc + (Number(m.haber) || 0), 0),
    [filtered]
  );

  // catálogo de cuentas disponible (para datalist)
  const cuentasUnicas = useMemo(() => {
    const map = new Map();
    for (const m of movs) {
      if (!map.has(m.cuentaId)) map.set(m.cuentaId, m.cuentaNombre || "");
    }
    // ordenar por código
    return Array.from(map.entries())
      .filter(([id]) => id) // sin vacíos
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([id, nombre]) => ({ id, nombre }));
  }, [movs]);

  // resumen de la cuenta seleccionada (se calcula sobre los MOVIMIENTOS FILTRADOS por fecha/desc)
  const resumenCuenta = useMemo(() => {
    if (!cuentaSel) return { debe: 0, haber: 0, saldo: 0, nombre: "" };
    const subset = filtered.filter((m) => m.cuentaId === cuentaSel);
    const debe = subset.reduce((acc, m) => acc + (m.debe || 0), 0);
    const haber = subset.reduce((acc, m) => acc + (m.haber || 0), 0);
    const saldo = debe - haber; // saldo contable genérico (positivo = neto deudor)
    const nombre = subset[0]?.cuentaNombre || cuentasUnicas.find(c => c.id === cuentaSel)?.nombre || "";
    return { debe, haber, saldo, nombre };
  }, [filtered, cuentaSel, cuentasUnicas]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl uppercase font-bold text-slate-900">
            Consultas
          </h1>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
        <div className="w-full flex flex-col gap-6 min-h-full items-stretch justify-start py-4 md:py-12">
          {/* Filtros + Resumen de cuenta */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6">
            <h3 className="font-semibold text-slate-800 mb-3">
              Buscar transacciones por descripción o fecha
            </h3>

            <div className="flex flex-col gap-4">
              {/* Barras de búsqueda */}
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full text-sm">
                  <div className="relative">
                    <input
                      value={qInput}
                      onChange={(e) => setQInput(e.target.value)}
                      placeholder="Buscar por descripción…"
                      className="w-full border border-slate-300 rounded-lg h-10 px-3 pr-9 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ⌕
                    </span>
                  </div>

                  <input
                    type="date"
                    value={dateFromInput}
                    onChange={(e) => setDateFromInput(e.target.value)}
                    className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Desde"
                    aria-label="Desde"
                  />

                  <input
                    type="date"
                    value={dateToInput}
                    onChange={(e) => setDateToInput(e.target.value)}
                    className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Hasta"
                    aria-label="Hasta"
                  />
                </div>

                <div className="flex gap-2 text-sm">
                  <button
                    onClick={aplicarBusqueda}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700  text-slate-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
                  >
                    Buscar
                  </button>
                  <button
                    onClick={refrescar}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700  text-slate-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
                  >
                    Refrescar
                  </button>
                </div>
              </div>

              {/* Resumen rápido de una cuenta (no filtra la tabla) */}
              <div className="grid gap-3 md:grid-cols-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-1">
                    Ver saldo de una cuenta (según filtros actuales)
                  </label>
                  <input
                    list="cuentas-list"
                    value={cuentaSel}
                    onChange={(e) => setCuentaSel(e.target.value)}
                    placeholder="Escribe o elige el código (ej. 110101)…"
                    className="w-full border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <datalist id="cuentas-list">
                    {cuentasUnicas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.nombre}
                      </option>
                    ))}
                  </datalist>
                  <p className="text-xs text-slate-500 mt-1">
                    Tip: también puedes pegar “código — nombre”, pero se toma el <b>código exacto</b>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="text-xs text-slate-500">Cuenta seleccionada</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {cuentaSel ? `${cuentaSel} — ${resumenCuenta.nombre || ""}` : "—"}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Debe</div>
                      <div className="font-mono font-semibold">{money(resumenCuenta.debe)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Haber</div>
                      <div className="font-mono font-semibold">{money(resumenCuenta.haber)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Saldo</div>
                      <div
                        className={
                          "font-mono font-semibold " +
                          (resumenCuenta.saldo > 0
                            ? "text-emerald-700"
                            : resumenCuenta.saldo < 0
                            ? "text-rose-700"
                            : "text-slate-700")
                        }
                      >
                        {money(resumenCuenta.saldo)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {err && (
                <div className="text-xs text-rose-600" role="alert">
                  {err}
                </div>
              )}
            </div>
          </section>

          {/* Tabla de movimientos */}
          <section className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-md">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-700 text-left border-b uppercase text-xs tracking-wide">
                  <tr>
                    <th className="py-3 px-3 font-semibold">Fecha</th>
                    <th className="py-3 px-3 font-semibold">Cuenta</th>
                    <th className="py-3 px-3 font-semibold">Descripción</th>
                    <th className="py-3 px-3 font-semibold text-right">Debe</th>
                    <th className="py-3 px-3 font-semibold text-right">Haber</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Cargando…
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No hay transacciones que coincidan con el filtro.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 border-t align-top whitespace-nowrap">
                          {m.fecha}
                        </td>
                        <td className="py-2.5 px-3 border-t align-top">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-white">
                            {m.cuentaId} — {m.cuentaNombre}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-t align-top">
                          {m.desc}
                        </td>
                        <td className="py-2.5 px-3 border-t align-top text-right font-mono">
                          {m.debe ? money(m.debe) : "-"}
                        </td>
                        <td className="py-2.5 px-3 border-t align-top text-right font-mono">
                          {m.haber ? money(m.haber) : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>

                {/* Totales */}
                {!loading && filtered.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t">
                      <td className="py-2.5 px-3 font-semibold text-slate-700" colSpan={3}>
                        Totales del período consultado
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {money(totalDebe)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {money(totalHaber)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div className="px-3 py-3 text-xs text-slate-500">
              Mostrando {loading ? 0 : filtered.length} movimientos
              {dateFrom || dateTo || q ? " (con filtros)" : ""}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
