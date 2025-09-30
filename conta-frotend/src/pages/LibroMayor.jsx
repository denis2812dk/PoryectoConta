import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";

const money = (n) =>
  (Number(n ?? 0)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (s) => (s ? new Date(s).toISOString().slice(0, 10) : "");

function MayorFilters({ values, onChange, onSubmit, onClear, loading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4"
      aria-label="Filtros del libro mayor"
    >
      {/* Desde */}
      <div className="flex flex-col gap-1">
        <label htmlFor="desde" className="text-sm font-medium">Desde</label>
        <input
          id="desde"
          type="date"
          value={values.desde}
          onChange={(e) => onChange({ ...values, desde: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hasta */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hasta" className="text-sm font-medium">Hasta</label>
        <input
          id="hasta"
          type="date"
          value={values.hasta}
          onChange={(e) => onChange({ ...values, hasta: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buscar cuenta */}
      <div className="flex flex-col gap-1 md:min-w-[240px]">
        <label htmlFor="q" className="text-sm font-medium">Buscar cuenta</label>
        <input
          id="q"
          type="text"
          placeholder="Ej: 1101, Caja…"
          value={values.q}
          onChange={(e) => onChange({ ...values, q: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}

          className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium shadow-sm"
        >
          {loading ? "Cargando…" : "Aplicar"}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}

          className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium shadow-sm"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}

function CuentaCard({ cuenta }) {
  const { cuentaId, nombre, debe, haber, saldo, movimientos = [] } = cuenta || {};

  return (
    <div className="group rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 border-b p-4 bg-neutral-50 rounded-t-2xl">
        <div>
          <h3 className="text-lg font-semibold">
            {cuentaId} <span className="text-neutral-500">· {nombre}</span>
          </h3>
          <p className="text-sm text-neutral-500">
            Movimientos: {movimientos.length}
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-neutral-500">Total Debe</div>
          <div className="font-semibold">{money(debe)}</div>
          <div className="mt-1 text-neutral-500">Total Haber</div>
          <div className="font-semibold">{money(haber)}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-neutral-500">Saldo final</div>
          <div
            className={`text-base font-semibold ${Number(saldo) >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
          >
            {money(saldo)}
          </div>
        </div>

        <div className="overflow-auto max-h-[360px] rounded-lg border border-neutral-200">
          <table className="min-w-full text-sm text-left text-neutral-700">
            <thead className="sticky top-0 bg-neutral-100 text-neutral-800 font-semibold">
              <tr>
                <th className="border-b p-2">Fecha</th>
                <th className="border-b p-2">Descripción</th>
                <th className="border-b p-2 text-right">Debe</th>
                <th className="border-b p-2 text-right">Haber</th>
                <th className="border-b p-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-neutral-500"
                  >
                    Sin movimientos.
                  </td>
                </tr>
              )}
              {movimientos.map((m, i) => (
                <tr
                  key={i}
                  className="hover:bg-neutral-50 border-b last:border-none"
                >
                  <td className="p-2">{fmtDate(m.fecha)}</td>
                  <td className="p-2">{m.descripcion}</td>
                  <td className="p-2 text-right">{money(m.debe)}</td>
                  <td className="p-2 text-right">{money(m.haber)}</td>
                  <td className="p-2 text-right">{money(m.saldoAcumulado)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 font-medium">
                <td className="p-2" colSpan={2}>Totales</td>
                <td className="p-2 text-right font-semibold">{money(debe)}</td>
                <td className="p-2 text-right font-semibold">{money(haber)}</td>
                <td className="p-2 text-right font-semibold">{money(saldo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LibroMayor() {
  const [filters, setFilters] = useState({ desde: "", hasta: "", q: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mayorData, setMayorData] = useState({});

  const cuentasFiltradas = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const list = Object.values(mayorData || {});
    if (!q) return list;
    return list.filter(
      (c) =>
        String(c.cuentaId).toLowerCase().includes(q) ||
        String(c.nombre || "").toLowerCase().includes(q)
    );
  }, [mayorData, filters.q]);

  const fetchMayor = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await api.getMayor({
        desde: filters.desde || undefined,
        hasta: filters.hasta || undefined,
      });

      const ordered = { ...(data || {}) };
      Object.values(ordered).forEach((c) => {
        if (Array.isArray(c.movimientos)) {
          c.movimientos.sort((a, b) =>
            String(a.fecha).localeCompare(String(b.fecha))
          );
        }
      });

      setMayorData(ordered);
    } catch (e) {
      console.error("[LibroMayor] error:", e);
      setError("No se pudo cargar el libro mayor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMayor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFilters = () => {
    setFilters({ desde: "", hasta: "", q: "" });
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <header className="mb-6">
        <h1 className=" justify-center text-2xl uppercase font-bold text-slate-900">Libro Mayor</h1>

      </header>

      {/* Filtros */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <MayorFilters
          values={filters}
          onChange={setFilters}
          onSubmit={fetchMayor}
          onClear={clearFilters}
          loading={loading}
        />
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>

      {/* Cargando */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border bg-neutral-50"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cuentasFiltradas.map((c) => (
            <CuentaCard key={c.cuentaId} cuenta={c} />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && cuentasFiltradas.length === 0 && !error && (
        <div className="mt-8 rounded-xl border bg-white p-8 text-center text-neutral-500">
          No se encontraron cuentas para los filtros aplicados.
        </div>
      )}
    </div>
  );
}
