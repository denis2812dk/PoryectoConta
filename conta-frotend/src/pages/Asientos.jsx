import { useEffect, useState } from "react";
import AsientoForm from "../components/AsientoForm";
import { api } from "../app/api";

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Asientos() {
  const [savedTick, setSavedTick] = useState(0);      // para recargar lista
  const [asientos, setAsientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [asientoEditar, setAsientoEditar] = useState(null);

  const cargarAsientos = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await api.getAsientos();
      setAsientos(data || []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los asientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsientos();
  }, [savedTick]);

  const eliminarAsiento = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este asiento?")) return;
    try {
      await api.eliminarAsiento(id);
      setSavedTick((t) => t + 1); // recarga lista
    } catch (e) {
      console.error(e);
      setErr("No se pudo eliminar el asiento.");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden pr-4 sm:pr-6 bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl uppercase font-bold text-slate-900">
            Asientos contables
          </h1>
        </div>
      </header>

      <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
        <div className="w-full flex flex-col gap-6 min-h-full items-stretch justify-start py-4 md:py-10">

          {/* FORMULARIO (crear / editar) */}
          <section className="w-full">
            <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                {asientoEditar
                  ? `Editar asiento #${asientoEditar.id}`
                  : "Nuevo asiento contable"}
              </h2>

              <AsientoForm
                modo={asientoEditar ? "editar" : "crear"}
                asientoEditar={asientoEditar}
                onSaved={() => {
                  setAsientoEditar(null);
                  setSavedTick((t) => t + 1); // recargar lista
                }}
                onCancel={() => setAsientoEditar(null)}
              />
            </div>
          </section>

          {/* LISTADO DE ASIENTOS */}
          <section className="w-full">
            <div className="max-w-6xl mx-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Asientos registrados
                </h2>
                <button
                  type="button"
                  onClick={cargarAsientos}
                  className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
                >
                  Recargar
                </button>
              </div>

              {err && (
                <p className="mb-2 text-sm text-red-600">
                  {err}
                </p>
              )}

              {loading ? (
                <p className="text-sm text-slate-500">Cargando asientos...</p>
              ) : asientos.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Todavía no hay asientos registrados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 text-left">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold w-20">ID</th>
                        <th className="py-2.5 px-3 font-semibold w-28">Fecha</th>
                        <th className="py-2.5 px-3 font-semibold">Descripción</th>
                        <th className="py-2.5 px-3 font-semibold w-40">
                          Totales (Debe / Haber)
                        </th>
                        <th className="py-2.5 px-3 font-semibold w-40">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {asientos.map((a) => {
                        const totalDebe = (a.partidas || []).reduce(
                          (acc, p) => acc + Number(p.debe || 0),
                          0
                        );
                        const totalHaber = (a.partidas || []).reduce(
                          (acc, p) => acc + Number(p.haber || 0),
                          0
                        );

                        return (
                          <tr
                            key={a.id}
                            className="border-b border-slate-200 hover:bg-slate-50 align-top"
                          >
                            <td className="py-2.5 px-3 font-mono text-slate-800">
                              {a.id}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {a.fecha}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-slate-900">
                                {a.descripcion}
                              </div>
                              <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                                {(a.partidas || []).map((p, idx) => (
                                  <li key={idx} className="flex justify-between gap-2">
                                    <span className="truncate">
                                      {p.cuenta?.codigo} - {p.cuenta?.nombre}
                                    </span>
                                    <span className="whitespace-nowrap">
                                      {p.debe > 0
                                        ? `D ${money(p.debe)}`
                                        : p.haber > 0
                                        ? `H ${money(p.haber)}`
                                        : ""}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-xs">
                              <div>Debe: ${money(totalDebe)}</div>
                              <div>Haber: ${money(totalHaber)}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-xs">
                              <button
                                type="button"
                                onClick={() => setAsientoEditar(a)}
                                className="px-3 py-1 rounded-full border border-slate-300 mr-2 hover:bg-slate-100"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarAsiento(a.id)}
                                className="px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
