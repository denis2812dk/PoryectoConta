// src/pages/LibroDiario.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";

// util simple para dinero
const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// parse local YYYY-MM-DD (evita desfases por TZ)
const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
};

export default function LibroDiario() {
  const [asientos, setAsientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // carga
  const cargar = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await api.getAsientos();
      setAsientos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los asientos.");
      setAsientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // filtra asientos por texto (desc / cuenta) y rango de fechas
  const asientosFiltrados = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const df = dateFrom ? parseISO(dateFrom) : null;
    const dt = dateTo ? parseISO(dateTo) : null;

    return (asientos || []).filter((a) => {
      // texto: id, descripcion, o alguna cuenta
      const byText =
        !ql ||
        String(a.id ?? "").toLowerCase().includes(ql) ||
        String(a.descripcion ?? "").toLowerCase().includes(ql) ||
        (a.partidas || []).some(
          (p) =>
            String(p.cuenta?.id ?? "").toLowerCase().includes(ql) ||
            String(p.cuenta?.nombre ?? "").toLowerCase().includes(ql)
        );

      // fecha
      const da = parseISO(a.fecha);
      const byDate = !da ? true : (!df || da >= df) && (!dt || da <= dt);

      return byText && byDate;
    });
  }, [asientos, q, dateFrom, dateTo]);

  // agrupa por día y calcula totales por día
  const grupos = useMemo(() => {
    const map = new Map();
    for (const a of asientosFiltrados) {
      const key = a.fecha || "(sin fecha)";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }

    // ordenar fechas DESC (más reciente primero)
    const keys = [...map.keys()].sort((A, B) => {
      const a = parseISO(A)?.getTime() || 0;
      const b = parseISO(B)?.getTime() || 0;
      return b - a;
    });

    return keys.map((fecha) => {
      const asientosDelDia = map.get(fecha) || [];
      // totales día
      let totalDebe = 0;
      let totalHaber = 0;
      for (const a of asientosDelDia) {
        for (const p of a.partidas || []) {
          totalDebe += Number(p.debe || 0);
          totalHaber += Number(p.haber || 0);
        }
      }
      return { fecha, asientos: asientosDelDia, totalDebe, totalHaber };
    });
  }, [asientosFiltrados]);

  // export CSV segun filtro
  const exportarCSV = () => {
    const lines = [];
    lines.push(["fecha", "asiento_id", "descripcion", "cuenta", "nombre", "debe", "haber"].join(","));
    for (const g of grupos) {
      for (const a of g.asientos) {
        for (const p of a.partidas || []) {
          lines.push(
            [
              g.fecha,
              a.id,
              `"${String(a.descripcion || "").replaceAll('"', '""')}"`,
              p.cuenta?.id ?? "",
              `"${String(p.cuenta?.nombre || "").replaceAll('"', '""')}"`,
              Number(p.debe || 0).toFixed(2),
              Number(p.haber || 0).toFixed(2),
            ].join(",")
          );
        }
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "libro_diario.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 ml-20">
            Libro Diario
          </h1>
          <div className="text-sm text-slate-600 mr-4">
            {loading ? "Cargando…" : `Total: ${asientosFiltrados.length} asientos`}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">

          {/* Filtros */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
            <h3 className="font-semibold text-slate-800 mb-3">Buscar y filtrar</h3>

            {err && (
              <div className="mb-3 rounded-lg border p-2 text-sm bg-red-50 border-red-200 text-red-800">
                {err}
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
              <div className="relative lg:col-span-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por descripción, cuenta o ID…"
                  className="w-full border border-slate-300 rounded-lg h-10 px-3 pr-9 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Desde"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Hasta"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={cargar}
                className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium shadow-sm"
              >
                Refrescar
              </button>
              <button
                onClick={exportarCSV}
                className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium shadow-sm"
              >
                Exportar CSV
              </button>
              {(dateFrom || dateTo || q) && (
                <button
                  onClick={() => { setQ(""); setDateFrom(""); setDateTo(""); }}
                  className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium shadow-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </section>

          {/* Contenido: grupos por día */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-10 text-center text-slate-500">Cargando…</div>
            ) : grupos.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No hay asientos para los filtros seleccionados.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {grupos.map((g) => (
                  <div key={g.fecha}>
                    {/* Encabezado del día */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                      <div className="font-semibold text-slate-800">
                        {g.fecha}
                      </div>
                      <div className="text-sm text-slate-700">
                        Debe: <b>{money(g.totalDebe)}</b> · Haber: <b>{money(g.totalHaber)}</b>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          Math.abs(g.totalDebe - g.totalHaber) < 0.005
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {Math.abs(g.totalDebe - g.totalHaber) < 0.005 ? "Balanceado" : "Descuadre"}
                        </span>
                      </div>
                    </div>

                    {/* Tabla simple del día */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white text-slate-600 text-left border-y">
                          <tr>
                            <th className="py-2 px-3 font-semibold w-20">ID</th>
                            <th className="py-2 px-3 font-semibold">Descripción</th>
                            <th className="py-2 px-3 font-semibold">Detalle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.asientos.map((a) => {
                            const sumDebe = (a.partidas || []).reduce((acc, p) => acc + Number(p.debe || 0), 0);
                            const sumHaber = (a.partidas || []).reduce((acc, p) => acc + Number(p.haber || 0), 0);
                            return (
                              <tr key={a.id} className="align-top hover:bg-slate-50 border-b">
                                <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">{a.id}</td>
                                <td className="py-2.5 px-3">{a.descripcion}</td>
                                <td className="py-2.5 px-3">
                                  <ul className="space-y-1">
                                    {(a.partidas || []).map((p, idx) => (
                                      <li key={idx} className="flex flex-wrap items-baseline gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-white">
                                          {p.cuenta?.id} — {p.cuenta?.nombre}
                                        </span>
                                        <span className="font-mono">D {Number(p.debe || 0).toFixed(2)}</span>
                                        <span className="font-mono">H {Number(p.haber || 0).toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-2 text-xs text-slate-600">
                                    Total asiento → Debe: <b>{money(sumDebe)}</b> · Haber:{" "}
                                    <b>{money(sumHaber)}</b>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
