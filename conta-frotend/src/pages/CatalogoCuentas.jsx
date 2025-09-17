import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";

export default function CatalogoCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const [form, setForm] = useState({ id: "", nombre: "", tipo: "Activo" });
  const [errors, setErrors] = useState({});

  // Toolbar
  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [sort, setSort] = useState({ key: "id", asc: true });

  const tipos = ["Activo", "Pasivo", "Patrimonio", "Ingreso", "Gasto"]; // orden lógico

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await api.getCuentas();
      setCuentas(Array.isArray(data) ? data : []);
    } catch (e) {
      setAlert({ type: "error", msg: "No se pudieron cargar las cuentas." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const validate = () => {
    const e = {};
    if (!form.id) e.id = "Requerido";
    else if (!/^\d{3,10}$/.test(String(form.id))) e.id = "Usa solo números (3–10 dígitos)";

    if (!form.nombre?.trim()) e.nombre = "Requerido";
    else if (form.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";

    if (!tipos.includes(form.tipo)) e.tipo = "Selecciona un tipo válido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const crear = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await api.crearCuenta({
        id: String(form.id).trim(),
        nombre: form.nombre.trim(),
        tipo: form.tipo,
      });
      setForm({ id: "", nombre: "", tipo: "Activo" });
      setAlert({ type: "success", msg: "Cuenta agregada correctamente." });
      await cargar();
    } catch (err) {
      setAlert({ type: "error", msg: "No se pudo crear la cuenta (¿código duplicado?)." });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({ id: "", nombre: "", tipo: "Activo" });
    setErrors({});
  };

  // Derivados: filtro + búsqueda + orden
  const cuentasFiltradas = useMemo(() => {
    const qlower = q.trim().toLowerCase();
    let arr = cuentas.filter((c) => {
      const pasaTipo = filtroTipo === "Todos" || c.tipo === filtroTipo;
      const pasaQ = !qlower ||
        String(c.id).toLowerCase().includes(qlower) ||
        String(c.nombre).toLowerCase().includes(qlower);
      return pasaTipo && pasaQ;
    });

    const { key, asc } = sort;
    arr.sort((a, b) => {
      const va = String(a[key] ?? "").toLowerCase();
      const vb = String(b[key] ?? "").toLowerCase();
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [cuentas, q, filtroTipo, sort]);

  const setSortKey = (key) => {
    setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true }));
  };

  const TipoBadge = ({ t, count }) => (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-white">
      <span className="h-2 w-2 rounded-full bg-gray-400" />{t} <span className="text-gray-500">({count})</span>
    </span>
  );

  const countsPorTipo = useMemo(() => {
    const base = Object.fromEntries(tipos.map((t) => [t, 0]));
    for (const c of cuentas) base[c.tipo] = (base[c.tipo] || 0) + 1;
    return base;
  }, [cuentas]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Alertas */}
      {alert.msg && (
        <div
          className={
            "mb-4 rounded-xl border p-3 text-sm " +
            (alert.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : alert.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800")
          }
          role="status"
        >
          {alert.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Cuentas</h1>
            <p className="text-gray-500 text-sm">Registra, busca y organiza las cuentas contables de tu sistema.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Activo","Pasivo","Patrimonio","Ingreso","Gasto"].map((t) => (
              <TipoBadge key={t} t={t} count={countsPorTipo[t] || 0} />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Grid principal: Formulario + Herramientas */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulario */}
            <form onSubmit={crear} className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h2 className="font-semibold text-gray-800 mb-3">Nueva cuenta</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Código</label>
                    <input
                      className={`w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.id ? "border-red-300" : "border-gray-300"}`}
                      placeholder="Ej. 1101"
                      inputMode="numeric"
                      value={form.id}
                      onChange={(e) => setForm({ ...form, id: e.target.value.replace(/\D/g, "") })}
                    />
                    {errors.id && <p className="text-red-600 text-xs mt-1">{errors.id}</p>}
                    <p className="text-gray-400 text-xs mt-1">Solo números (ej. 1xxx Activo, 2xxx Pasivo, etc.).</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                    <input
                      className={`w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? "border-red-300" : "border-gray-300"}`}
                      placeholder="Caja, Bancos, Proveedores…"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                    {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Tipo</label>
                    <select
                      className={`w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.tipo ? "border-red-300" : "border-gray-300"}`}
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    >
                      {["Activo","Pasivo","Patrimonio","Ingreso","Gasto"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.tipo && <p className="text-red-600 text-xs mt-1">{errors.tipo}</p>}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Guardando…" : "Agregar"}
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Herramientas de lista */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h2 className="font-semibold text-gray-800 mb-3">Buscar y organizar</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por código o nombre…"
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Todos</option>
                      {["Activo","Pasivo","Patrimonio","Ingreso","Gasto"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={`${sort.key}:${sort.asc ? "asc" : "desc"}`}
                      onChange={(e) => {
                        const [key, dir] = e.target.value.split(":");
                        setSort({ key, asc: dir === "asc" });
                      }}
                      className="w-40 border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="id:asc">Código ↑</option>
                      <option value="id:desc">Código ↓</option>
                      <option value="nombre:asc">Nombre A–Z</option>
                      <option value="nombre:desc">Nombre Z–A</option>
                      <option value="tipo:asc">Tipo A–Z</option>
                      <option value="tipo:desc">Tipo Z–A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 text-gray-700 text-left border-b">
                      <tr>
                        <th className="py-3 px-3 font-semibold cursor-pointer select-none" onClick={() => setSortKey("id")}>Código {sort.key === "id" ? (sort.asc ? "↑" : "↓") : ""}</th>
                        <th className="py-3 px-3 font-semibold cursor-pointer select-none" onClick={() => setSortKey("nombre")}>Nombre {sort.key === "nombre" ? (sort.asc ? "↑" : "↓") : ""}</th>
                        <th className="py-3 px-3 font-semibold cursor-pointer select-none" onClick={() => setSortKey("tipo")}>Tipo {sort.key === "tipo" ? (sort.asc ? "↑" : "↓") : ""}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-500">Cargando…</td>
                        </tr>
                      )}
                      {!loading && cuentasFiltradas.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-10 text-center">
                            <div className="text-gray-500">No hay resultados. Agrega una cuenta o ajusta la búsqueda.</div>
                          </td>
                        </tr>
                      )}
                      {!loading && cuentasFiltradas.map((c, i) => (
                        <tr key={c.id} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                          <td className="py-2.5 px-3 border-t align-top font-mono text-gray-800">{c.id}</td>
                          <td className="py-2.5 px-3 border-t align-top">{c.nombre}</td>
                          <td className="py-2.5 px-3 border-t align-top">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-white">{c.tipo}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 text-xs text-gray-500 border-t bg-gray-50">
                  Mostrando {loading ? 0 : cuentasFiltradas.length} de {cuentas.length} cuentas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
