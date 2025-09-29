import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { sumDebe, sumHaber } from "../app/utils";

/*
  AsientoForm (con buscador y entradas amigables)
  ------------------------------------------------
  - Buscador de cuentas con <input list="..."> + <datalist>.
  - Debe/Haber como string (evita el "0" inicial al escribir).
  - Parseo a número solo para validar/sumar/enviar.
  - Sigue bloqueando cuentas inactivas y validando reglas contables.
*/

// Helpers para mostrar/buscar cuentas en el datalist
const etiquetaCuenta = (c) => `${c.id} — ${c.nombre}`;
const buscarCuentaPorEntrada = (valor, cuentas) => {
  const val = String(valor || "").trim();
  // 1) Coincidencia exacta "id — nombre"
  let sel = cuentas.find((c) => etiquetaCuenta(c) === val);
  if (sel) return sel;
  // 2) Si solo escribió el id
  sel = cuentas.find((c) => String(c.id) === val);
  if (sel) return sel;
  // 3) Si escribió exactamente el nombre
  sel = cuentas.find((c) => c.nombre?.toLowerCase() === val.toLowerCase());
  return sel || null;
};

// Normaliza texto a número (acepta coma decimal)
const parseMonto = (v) => {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  if (!isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100) / 100; // 2 decimales
};

export default function AsientoForm({ onSaved }) {
  // catálogo de cuentas
  const [cuentas, setCuentas] = useState([]);

  // estado del formulario (entradas como string)
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: "",
    partidas: [{ cuentaId: "", debe: "", haber: "" }],
  });

  // UX
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState("");

  // cargar cuentas
  useEffect(() => {
    api.getCuentas().then(setCuentas);
  }, []);

  // solo cuentas activas (si no viene "activo", asumo true)
  const cuentasActivas = useMemo(
    () => (cuentas || []).filter((c) => c.activo !== false),
    [cuentas]
  );

  // agregar / quitar fila
  const addRow = () =>
    setForm((f) => ({
      ...f,
      partidas: [...f.partidas, { cuentaId: "", debe: "", haber: "" }],
    }));

  const delRow = (i) =>
    setForm((f) => ({
      ...f,
      partidas: f.partidas.filter((_, idx) => idx !== i),
    }));

  // actualizar una propiedad de una fila
  const update = (i, k, v) =>
    setForm((f) => {
      // si cambian la cuenta por id directo, valida inactiva
      if (k === "cuentaId") {
        const sel = (cuentas || []).find((c) => String(c.id) === String(v));
        if (sel && sel.activo === false) {
          setAlert("Esa cuenta está inactiva y no se puede usar.");
          return f; // no aplico el cambio
        }
      }

      const partidas = f.partidas.map((p, idx) => {
        if (idx !== i) return p;

        // 🟢 Usuario escribe en el buscador (texto libre)
        if (k === "cuentaTexto") {
          const texto = v;
          const sel = buscarCuentaPorEntrada(texto, cuentasActivas);
          return {
            ...p,
            cuentaTexto: texto,           // siempre reflejamos lo tecleado
            cuentaId: sel ? sel.id : "",  // fijamos id solo si hay match
          };
        }

        // 🟢 Si por algún motivo seteas directamente el id, sincroniza texto
        if (k === "cuentaId") {
          const sel = (cuentas || []).find((c) => String(c.id) === String(v));
          return {
            ...p,
            cuentaId: v,
            cuentaTexto: sel ? `${sel.id} — ${sel.nombre}` : "",
          };
        }

        // Debe/Haber como strings; limpiamos la otra columna si hay valor > 0
        if (k === "debe") {
          const n = parseMonto(v);
          return { ...p, debe: v, haber: n > 0 ? "" : p.haber };
        }
        if (k === "haber") {
          const n = parseMonto(v);
          return { ...p, haber: v, debe: n > 0 ? "" : p.debe };
        }

        return p;
      });

      return { ...f, partidas };
    });
  // Totales (convirtiendo a número al calcular)
  const partidasNumericas = useMemo(
    () =>
      form.partidas.map((p) => ({
        ...p,
        debe: parseMonto(p.debe),
        haber: parseMonto(p.haber),
      })),
    [form.partidas]
  );

  const totalDebe = useMemo(
    () => Number(sumDebe(partidasNumericas).toFixed(2)),
    [partidasNumericas]
  );
  const totalHaber = useMemo(
    () => Number(sumHaber(partidasNumericas).toFixed(2)),
    [partidasNumericas]
  );
  const diferencia = useMemo(
    () => Number((totalDebe - totalHaber).toFixed(2)),
    [totalDebe, totalHaber]
  );
  const balanced = Math.abs(diferencia) < 0.005; // tolerancia por redondeo

  // Errores por fila (usa parseMonto)
  const filasConError = useMemo(
    () =>
      form.partidas.map((p) => {
        const sinCuenta = !p.cuentaId;
        const d = parseMonto(p.debe);
        const h = parseMonto(p.haber);
        const ambosCeros = d === 0 && h === 0;
        const ambosLlenos = d > 0 && h > 0;

        // cuenta inactiva
        const cuentaSel = (cuentas || []).find(
          (c) => String(c.id) === String(p.cuentaId)
        );
        const inactiva = !!(cuentaSel && cuentaSel.activo === false);

        return {
          sinCuenta,
          ambosCeros,
          ambosLlenos,
          inactiva,
          tieneError: sinCuenta || ambosCeros || ambosLlenos || inactiva,
        };
      }),
    [form.partidas, cuentas]
  );

  const tieneErrores = useMemo(
    () => filasConError.some((e) => e.tieneError) || !form.descripcion.trim(),
    [filasConError, form.descripcion]
  );

  // guardar
  const guardar = async (e) => {
    e.preventDefault();

    if (tieneErrores || !balanced) {
      setAlert(
        "Revisa los datos: cada partida debe tener cuenta activa y solo Debe o Haber (> 0). El asiento debe estar balanceado."
      );
      return;
    }

    try {
      setSaving(true);

      const req = {
        fecha: form.fecha,
        descripcion: form.descripcion.trim(),
        partidas: form.partidas.map((p) => ({
          cuentaId: p.cuentaId,
          debe: parseMonto(p.debe),
          haber: parseMonto(p.haber),
        })),
      };

      await api.crearAsiento(req);

      // reset manteniendo fecha
      setForm({
        fecha: form.fecha,
        descripcion: "",
        partidas: [{ cuentaId: "", debe: "", haber: "" }],
      });

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
      {/* alertas */}
      {alert && (
        <div
          className="rounded-xl border p-3 text-sm bg-blue-50 border-blue-200 text-blue-800"
          aria-live="polite"
        >
          {alert}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 shadow-md bg-white">
        {/* header */}
        <div className="px-6 pt-6 pb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Formulario de registro</h2>
            <p className="text-sm text-slate-500">
              Registra un asiento con múltiples partidas. Usa solo Debe o Haber por línea.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border " +
                (balanced && !tieneErrores
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700")
              }
            >
              <span
                className={
                  "h-2 w-2 rounded-full " +
                  (balanced && !tieneErrores ? "bg-emerald-500" : "bg-amber-500")
                }
              />
              {balanced && !tieneErrores ? "Balanceado" : "Requiere ajuste"}
            </span>
          </div>
        </div>

        <hr className="border-t border-slate-200" />

        {/* datos generales */}
        <div className="px-6 py-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Descripción</label>
              <input
                placeholder="Compra de suministros, pago de servicios…"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className={
                  "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                  (!form.descripcion.trim() ? "border-amber-300" : "border-slate-300")
                }
              />
              {!form.descripcion.trim() && (
                <p className="text-xs text-amber-600 mt-1">
                  Agrega una descripción para identificar el asiento.
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-t border-slate-200" />

        {/* tabla de partidas */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 text-left border-b">
                <tr>
                  <th className="py-3 px-3 font-semibold w-[45%]">Cuenta</th>
                  <th className="py-3 px-3 font-semibold w-[18%]">Debe</th>
                  <th className="py-3 px-3 font-semibold w-[18%]">Haber</th>
                  <th className="py-3 px-3 font-semibold w-[12%] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {form.partidas.map((p, i) => {
                  const err = filasConError[i];
                  const rowHasError = err.tieneError;

                  const cuentaSel = cuentasActivas.find(
                    (c) => String(c.id) === String(p.cuentaId)
                  );

                  return (
                    <tr
                      key={i}
                      className={
                        (i % 2 ? "bg-white" : "bg-slate-50") +
                        (rowHasError ? " outline outline-1 outline-amber-300" : "")
                      }
                    >
                      {/* Cuenta: input con datalist (buscador) */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          list={`cuentas-${i}`}
                          placeholder="Buscar por código o nombre…"
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (!p.cuentaId || err.inactiva ? "border-amber-300" : "border-slate-300")
                          }
                          value={p.cuentaTexto ?? ""}                              // <- TEXTO LIBRE
                          onChange={(e) => update(i, "cuentaTexto", e.target.value)}
                          onBlur={(e) => {
                            const sel = buscarCuentaPorEntrada(e.target.value, cuentasActivas);
                            if (!sel) update(i, "cuentaTexto", "");               // opcional: limpia si no hay match
                          }}
                        />
                        <datalist id={`cuentas-${i}`}>
                          {cuentasActivas.map((c) => (
                            <option key={c.id} value={`${c.id} — ${c.nombre}`} />
                          ))}
                        </datalist>

                        {err.sinCuenta && (
                          <p className="text-xs text-amber-600 mt-1">Selecciona una cuenta.</p>
                        )}
                        {err.inactiva && (
                          <p className="text-xs text-rose-600 mt-1">Esta cuenta está inactiva.</p>
                        )}
                      </td>

                      {/* Debe */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={p.debe ?? ""} // evita 0 inicial
                          onChange={(e) => update(i, "debe", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (err.ambosLlenos ? "border-amber-300" : "border-slate-300")
                          }
                        />
                      </td>

                      {/* Haber */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={p.haber ?? ""} // evita 0 inicial
                          onChange={(e) => update(i, "haber", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (err.ambosLlenos ? "border-amber-300" : "border-slate-300")
                          }
                        />
                        {(err.ambosCeros || err.ambosLlenos) && (
                          <p className="text-xs text-amber-600 mt-1">
                            Escribe solo en Debe <b>o</b> en Haber.
                          </p>
                        )}
                      </td>

                      {/* Quitar fila */}
                      <td className="py-2.5 px-3 border-t align-top text-center">
                        {form.partidas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => delRow(i)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            aria-label={`Quitar partida ${i + 1}`}
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

          {/* totales */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-slate-100 border border-slate-300 text-slate-700
                           hover:bg-slate-200 hover:border-sky-400 shadow-sm
                           transition-colors"
                aria-label="Agregar partida"
                title="Agregar otra cuenta al asiento"
              >
                ＋ Agregar partida
              </button>

              {!balanced && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 border-amber-200 text-amber-700">
                  Diferencia: {diferencia > 0 ? "+" : ""}
                  {diferencia.toFixed(2)}
                </span>
              )}
            </div>

            <div className="justify-self-end text-sm">
              <div className="inline-grid grid-cols-3 gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                <span className="text-slate-500">Totales:</span>
                <span className="font-semibold">Debe {totalDebe.toFixed(2)}</span>
                <span className="font-semibold">Haber {totalHaber.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* botón guardar */}
      <div className="flex items-center gap-3">
        <button
          className="px-5 py-2.5 rounded-lg
                     bg-slate-100 border border-slate-300 text-slate-700
                     hover:bg-slate-200 hover:border-sky-400 shadow-sm
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors"
          disabled={saving || !balanced || tieneErrores}
        >
          {saving ? "Guardando…" : "Guardar asiento"}
        </button>

        {!balanced && (
          <span className="text-sm text-amber-700">
            El asiento debe estar balanceado para guardar.
          </span>
        )}
      </div>
    </form>
  );
}
