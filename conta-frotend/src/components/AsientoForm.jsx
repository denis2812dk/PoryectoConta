import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { asientoBalanceado, sumDebe, sumHaber } from "../app/utils";

/**
 * AsientoForm — versión estilizada (React + Tailwind v4)
 * - Tarjeta con encabezado y estado (Balanceado/Descuadre)
 * - Inputs con foco claro y ayudas
 * - Tabla con cabecera pegajosa, zebra y acciones por fila
 * - Totales con diferencia y colores según estado
 * - Validaciones básicas por fila y del formulario
 */
export default function AsientoForm({ onSaved }) {
  const [cuentas, setCuentas] = useState([]);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: "",
    partidas: [{ cuentaId: "", debe: 0, haber: 0 }],
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState("");

  useEffect(() => { api.getCuentas().then(setCuentas); }, []);

  const addRow = () =>
    setForm((f) => ({
      ...f,
      partidas: [...f.partidas, { cuentaId: "", debe: 0, haber: 0 }],
    }));

  const delRow = (i) =>
    setForm((f) => ({
      ...f,
      partidas: f.partidas.filter((_, idx) => idx !== i),
    }));

  const update = (i, k, v) =>
    setForm((f) => {
      const partidas = f.partidas.map((p, idx) => {
        if (idx !== i) return p;
        if (k === "cuentaId") return { ...p, cuentaId: v };
        const num = Number(v || 0);
        // Exclusividad: si escriben Debe, Haber = 0 y viceversa
        if (k === "debe") return { ...p, debe: num, haber: num > 0 ? 0 : p.haber };
        if (k === "haber") return { ...p, haber: num, debe: num > 0 ? 0 : p.debe };
        return p;
      });
      return { ...f, partidas };
    });

  const totalDebe = useMemo(() => Number(sumDebe(form.partidas).toFixed(2)), [form.partidas]);
  const totalHaber = useMemo(() => Number(sumHaber(form.partidas).toFixed(2)), [form.partidas]);
  const diferencia = useMemo(() => Number((totalDebe - totalHaber).toFixed(2)), [totalDebe, totalHaber]);
  const balanced = asientoBalanceado(form);

  const filasConError = useMemo(() =>
    form.partidas.map((p) => {
      const sinCuenta = !p.cuentaId;
      const ambosCeros = (!p.debe && !p.haber) || (p.debe === 0 && p.haber === 0);
      const ambosLlenos = p.debe > 0 && p.haber > 0;
      return { sinCuenta, ambosCeros, ambosLlenos, tieneError: sinCuenta || ambosCeros || ambosLlenos };
    }),
  [form.partidas]);

  const tieneErrores = useMemo(() =>
    filasConError.some((e) => e.tieneError) || !form.descripcion.trim(),
  [filasConError, form.descripcion]);

  const guardar = async (e) => {
    e.preventDefault();
    if (tieneErrores || !balanced) {
      setAlert("Revisa los datos: cada partida debe tener cuenta y solo Debe o Haber (> 0). El asiento debe estar balanceado.");
      return;
    }
    try {
      setSaving(true);
      const req = {
        fecha: form.fecha,
        descripcion: form.descripcion.trim(),
        partidas: form.partidas.map((p) => ({ cuentaId: p.cuentaId, debe: p.debe, haber: p.haber })),
      };
      await api.crearAsiento(req);
      setForm({ fecha: form.fecha, descripcion: "", partidas: [{ cuentaId: "", debe: 0, haber: 0 }] });
      setAlert("Asiento guardado correctamente.");
      onSaved?.();
    } catch (err) {
      setAlert("No se pudo guardar el asiento. Intenta de nuevo.");
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(""), 3000);
    }
  };

  return (
    <form onSubmit={guardar} className="max-w-6xl mx-auto p-4 space-y-4">
      {alert && (
        <div className="rounded-xl border p-3 text-sm bg-blue-50 border-blue-200 text-blue-800">{alert}</div>
      )}

      <div className="rounded-2xl border border-gray-200 shadow-xl bg-white">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Asiento</h2>
            <p className="text-sm text-gray-500">Registra un asiento con múltiples partidas. Usa solo Debe o Haber por línea.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border " +
              (balanced && !tieneErrores
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-amber-50 border-amber-200 text-amber-700")
            }>
              <span className={"h-2 w-2 rounded-full " + (balanced && !tieneErrores ? "bg-green-500" : "bg-amber-500")} />
              {balanced && !tieneErrores ? "Balanceado" : "Requiere ajuste"}
            </span>
          </div>
        </div>

        {/* Datos generales */}
        <div className="px-6 pb-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Descripción</label>
              <input
                placeholder="Compra de suministros, pago de servicios…"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className={"w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " + (!form.descripcion.trim() ? "border-amber-300" : "border-gray-300")}
              />
              {!form.descripcion.trim() && (
                <p className="text-xs text-amber-600 mt-1">Agrega una descripción para identificar el asiento.</p>
              )}
            </div>
          </div>
        </div>

  
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-gray-700 text-left border-b">
                <tr>
                  <th className="p-3 font-semibold w-[45%]">Cuenta</th>
                  <th className="p-3 font-semibold w-[18%]">Debe</th>
                  <th className="p-3 font-semibold w-[18%]">Haber</th>
                  <th className="p-3 font-semibold w-[12%] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {form.partidas.map((p, i) => {
                  const err = filasConError[i];
                  const rowHasError = err.tieneError;
                  return (
                    <tr key={i} className={(i % 2 ? "bg-white" : "bg-gray-50") + (rowHasError ? " outline outline-1 outline-amber-300" : "") }>
                      <td className="p-2.5 border-t align-top">
                        <select
                          value={p.cuentaId}
                          onChange={(e) => update(i, "cuentaId", e.target.value)}
                          className={"w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " + (!p.cuentaId ? "border-amber-300" : "border-gray-300")}
                        >
                          <option value="">— seleccionar —</option>
                          {cuentas.map((c) => (
                            <option key={c.id} value={c.id}>{c.id} — {c.nombre}</option>
                          ))}
                        </select>
                        {err.sinCuenta && <p className="text-xs text-amber-600 mt-1">Selecciona una cuenta.</p>}
                      </td>
                      <td className="p-2.5 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={p.debe}
                          onChange={(e) => update(i, "debe", e.target.value)}
                          className={"w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " + (err.ambosLlenos ? "border-amber-300" : "border-gray-300")}
                        />
                      </td>
                      <td className="p-2.5 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={p.haber}
                          onChange={(e) => update(i, "haber", e.target.value)}
                          className={"w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " + (err.ambosLlenos ? "border-amber-300" : "border-gray-300")}
                        />
                        {(err.ambosCeros || err.ambosLlenos) && (
                          <p className="text-xs text-amber-600 mt-1">Escribe solo en Debe <b>o</b> en Haber.</p>
                        )}
                      </td>
                      <td className="p-2.5 border-t align-top text-center">
                        {form.partidas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => delRow(i)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-red-600"
                          >
                            ✖ Quitar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Barra de totales */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/50 text-white"
              >
                Agregar cuenta
              </button>
              {!balanced && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 border-amber-200 text-amber-700">
                  Diferencia: {diferencia > 0 ? "+" : ""}{diferencia.toFixed(2)}
                </span>
              )}
            </div>
            <div className="justify-self-end text-sm">
              <div className="inline-grid grid-cols-3 gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-gray-500">Totales:</span>
                <span className="font-semibold">Debe {totalDebe.toFixed(2)}</span>
                <span className="font-semibold">Haber {totalHaber.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-50 transition"
          disabled={saving || !balanced || tieneErrores}
        >
          {saving ? "Guardando…" : "Guardar asiento"}
        </button>
        {!balanced && <span className="text-sm text-amber-700">El asiento debe estar balanceado para guardar.</span>}
      </div>
    </form>
  );
}
