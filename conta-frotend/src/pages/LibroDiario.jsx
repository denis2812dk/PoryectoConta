import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { generarLibroDiario } from "../app/utils";

export default function LibroDiario() {
  const [asientos, setAsientos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toolbar
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState({ key: "fecha", asc: false }); // recientes primero
  const [expanded, setExpanded] = useState(() => new Set());

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await api.getAsientos();
      setAsientos(Array.isArray(data) ? data : []);
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
      const byText =
        !ql ||
        String(a.id).toLowerCase().includes(ql) ||
        String(a.descripcion || "").toLowerCase().includes(ql) ||
        (a.partidas || []).some(
          (p) =>
            String(p.cuenta?.id || "").toLowerCase().includes(ql) ||
            String(p.cuenta?.nombre || "").toLowerCase().includes(ql)
        );

      const df = dateFrom ? parseISO(dateFrom) : null;
      const dt = dateTo ? parseISO(dateTo) : null;
      const da = parseISO(a.fecha);
      const byDate = !da ? true : (!df || da >= df) && (!dt || da <= dt);

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

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true }));
  const toggleRow = (id) =>
    setExpanded((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  const expandAll = () => setExpanded(new Set(filtered.map((f) => f.id)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="min-h-screen w-full overflow-x-hidden pr-4 sm:pr-6 bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 ml-20">
            Libro Diario
          </h1>
          <div className="text-sm text-slate-600 mr-4">
            {loading ? "Cargando…" : `Total: ${rows.length} asientos`}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
        <div className="w-full flex flex-col gap-6 min-h-full items-stretch justify-start py-4 md:py-12">
          {/* Herramientas de lista (filtros y acciones) */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6">
            <h3 className="font-semibold text-slate-800 mb-3">Buscar y organizar</h3>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full text-sm">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por id, descripción o cuenta…"
                    className="w-full border border-slate-300 rounded-lg h-10 px-3 pr-9 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Desde"
                  aria-label="Desde"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Hasta"
                  aria-label="Hasta"
                />
                <select
                  value={`${sort.key}:${sort.asc ? "asc" : "desc"}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split(":");
                    setSort({ key, asc: dir === "asc" });
                  }}
                  className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="fecha:desc">Fecha (recientes primero)</option>
                  <option value="fecha:asc">Fecha (antiguos primero)</option>
                  <option value="id:asc">ID ↑</option>
                  <option value="id:desc">ID ↓</option>
                </select>
              </div>

              <div className="flex gap-2 text-sm">
              <div className="flex gap-2 text-sm">
                <button
                  onClick={cargar}
                  className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm ring-1 ring-blue-600/10"
                >
                  Refrescar
                </button>

                <button
                  onClick={expandAll}
                  className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-sm ring-1 ring-green-300/20"
                >
                  Expandir
                </button>

                <button
                  onClick={collapseAll}
                  className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-black hover:bg-gray-900 text-white font-semibold shadow-sm ring-1 ring-gray-700/20"
                >
                  Colapsar
                </button>

             
            </div>
              </div>
            </div>
          </section>

          {/* Tabla */}
          <section className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-md">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-700 text-left border-b uppercase text-xs tracking-wide">
                  <tr>
                    <th
                      className="py-3 px-3 font-semibold cursor-pointer select-none"
                      onClick={() => toggleSort("fecha")}
                    >
                      Fecha {sort.key === "fecha" ? (sort.asc ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="py-3 px-3 font-semibold cursor-pointer select-none"
                      onClick={() => toggleSort("id")}
                    >
                      ID {sort.key === "id" ? (sort.asc ? "↑" : "↓") : ""}
                    </th>
                    <th className="py-3 px-3 font-semibold">Descripción</th>
                    <th className="py-3 px-3 font-semibold">Detalle</th>
                    <th className="py-3 px-3 font-semibold text-center">Acciones</th>
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
                        No hay asientos que coincidan con el filtro.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((a) => {
                      const isOpen = expanded.has(a.id);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 border-t align-top whitespace-nowrap">
                            {a.fecha}
                          </td>
                          <td className="py-2.5 px-3 border-t align-top font-mono text-slate-800">
                            {a.id}
                          </td>
                          <td className="py-2.5 px-3 border-t align-top">
                            {a.descripcion}
                          </td>
                          <td className="py-2.5 px-3 border-t align-top">
                            {isOpen ? (
                              <ul className="space-y-1">
                                {(a.partidas || []).map((p, idx) => (
                                  <li
                                    key={idx}
                                    className="flex flex-wrap items-baseline gap-2"
                                  >
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-white">
                                      {p.cuenta?.id} — {p.cuenta?.nombre}
                                    </span>
                                    <span className="font-mono">
                                      D {Number(p.debe || 0).toFixed(2)}
                                    </span>
                                    <span className="font-mono">
                                      H {Number(p.haber || 0).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-slate-500">(detalle oculto)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-t align-top text-center">
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
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
            <div className="px-3 py-3 text-xs text-slate-500">
              Mostrando {loading ? 0 : filtered.length} de {rows.length} asientos
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
