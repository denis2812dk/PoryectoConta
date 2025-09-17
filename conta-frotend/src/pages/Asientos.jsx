import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import AsientoForm from "../components/AsientoForm";
import { generarLibroDiario } from "../app/utils";

/**
 * Asientos — versión estilizada (React + Tailwind v4)
 * - Tarjeta principal con encabezado, acciones y resumen
 * - Form de asientos integrado (usa tu AsientoForm estilizado)
 * - Barra de herramientas: buscar, rango de fechas, ordenar, refrescar
 * - Tabla con cabecera pegajosa, zebra, hover y expand/collapse por fila
 * - Estados de carga y vacío
 */
export default function Asientos() {
  const [asientos, setAsientos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toolbar
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState({ key: "fecha", asc: false }); // por defecto más reciente primero

  const [expanded, setExpanded] = useState(() => new Set());

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await api.getAsientos();
      setAsientos(Array.isArray(data) ? data : []);
      // Al recargar, mantenemos las expansiones existentes sobre los ids presentes
      setExpanded((prev) => {
        const copy = new Set();
        for (const a of data) if (prev.has(a.id)) copy.add(a.id);
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const rows = useMemo(() => generarLibroDiario(asientos) || [], [asientos]);

  // Helpers
  const parseISO = (s) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let arr = rows.filter((a) => {
      const byText = !ql ||
        String(a.id).toLowerCase().includes(ql) ||
        String(a.descripcion || "").toLowerCase().includes(ql) ||
        (a.partidas || []).some((p) =>
          String(p.cuenta?.id || "").toLowerCase().includes(ql) ||
          String(p.cuenta?.nombre || "").toLowerCase().includes(ql)
        );

      const df = dateFrom ? parseISO(dateFrom) : null;
      const dt = dateTo ? parseISO(dateTo) : null;
      const da = parseISO(a.fecha);
      const byDate = !da ? true : (
        (!df || da >= df) && (!dt || da <= dt)
      );

      return byText && byDate;
    });

    const { key, asc } = sort;
    arr.sort((a, b) => {
      let va = a[key];
      let vb = b[key];
      if (key === "fecha") {
        va = parseISO(va)?.getTime() || 0;
        vb = parseISO(vb)?.getTime() || 0;
      }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, q, dateFrom, dateTo, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true }));
  const toggleRow = (id) => setExpanded((prev) => {
    const copy = new Set(prev);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    return copy;
  });
  const expandAll = () => setExpanded(new Set(filtered.map((f) => f.id)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asientos</h1>
            <p className="text-sm text-gray-500">Registra asientos y consulta el libro diario generado.</p>
          </div>
          <div className="text-sm text-gray-600">{loading ? "Cargando…" : `Total: ${rows.length} asientos`}</div>
        </div>

        {/* Formulario */}
        <div className="px-6 pb-6">
          <AsientoForm onSaved={cargar} />
        </div>
      </div>

      {/* Herramientas de lista */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por id, descripción o cuenta…"
                  className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Desde"
                aria-label="Desde"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hasta"
                aria-label="Hasta"
              />
              <select
                value={`${sort.key}:${sort.asc ? "asc" : "desc"}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split(":");
                  setSort({ key, asc: dir === "asc" });
                }}
                className="border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fecha:desc">Fecha (recientes primero)</option>
                <option value="fecha:asc">Fecha (antiguos primero)</option>
                <option value="id:asc">ID ↑</option>
                <option value="id:desc">ID ↓</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={cargar} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Refrescar</button>
              <button onClick={expandAll} className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Expandir todo</button>
              <button onClick={collapseAll} className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Colapsar todo</button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-gray-700 text-left border-b">
                <tr>
                  <th className="p-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("fecha")}>
                    Fecha {sort.key === "fecha" ? (sort.asc ? "↑" : "↓") : ""}
                  </th>
                  <th className="p-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("id")}>
                    ID {sort.key === "id" ? (sort.asc ? "↑" : "↓") : ""}
                  </th>
                  <th className="p-3 font-semibold">Descripción</th>
                  <th className="p-3 font-semibold">Detalle</th>
                  <th className="p-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">Cargando…</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">No hay asientos que coincidan con el filtro.</td>
                  </tr>
                )}
                {!loading && filtered.map((a, i) => {
                  const isOpen = expanded.has(a.id);
                  return (
                    <tr key={a.id} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                      <td className="border-t p-2.5 align-top whitespace-nowrap">{a.fecha}</td>
                      <td className="border-t p-2.5 align-top font-mono">{a.id}</td>
                      <td className="border-t p-2.5 align-top">{a.descripcion}</td>
                      <td className="border-t p-2.5 align-top">
                        {isOpen ? (
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
                        ) : (
                          <span className="text-gray-500">(detalle oculto)</span>
                        )}
                      </td>
                      <td className="border-t p-2.5 align-top text-center">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() => toggleRow(a.id)}
                        >
                          {isOpen ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-2 pt-3 text-xs text-gray-500">Mostrando {loading ? 0 : filtered.length} de {rows.length} asientos</div>
        </div>
      </div>
    </div>
  );
}
