import { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { sumDebe, sumHaber } from "../app/utils";

const etiquetaCuenta = (c) => `${c.id} — ${c.nombre}`; //concatena el codigo y nombre de la cuenta para mostrar

const buscarCuentaPorEntrada = (valor, cuentas) => {
  const val = String(valor || "").trim();
  //muestra la coincidencia del codigo y el nombre digitado
  let sel = cuentas.find((c) => etiquetaCuenta(c) === val);
  if (sel) return sel; //coincidencia si solo se digito el id
  sel = cuentas.find((c) => String(c.id) === val);
  if (sel) return sel; //coincidencia si solo se digito el nombre
  sel = cuentas.find((c) => c.nombre?.toLowerCase() === val.toLowerCase());
  return sel || null;
};

const parseMonto = (v) => {
  //convierte texto a numero y lo formatea 2 decimmales
  const n = Number(String(v ?? "").replace(",", ".").trim());
  if (!isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100) / 100;
};

export default function AsientoForm({
  onSaved,
  modo = "crear",         // "crear" | "editar"
  asientoEditar = null,
  onCancel,
}) {
  const [cuentas, setCuentas] = useState([]); // se monta el catalogo de cuentas

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: "",
    partidas: [{ cuentaId: "", cuentaTexto: "", debe: "", haber: "" }],
  });

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState("");

  //carga el catalogo de cuentas para visualizar
  useEffect(() => {
    api.getCuentas().then(setCuentas);
  }, []);

  //se filtran solo cuentas activas
  const cuentasActivas = useMemo(
    () => (cuentas || []).filter((c) => c.activo !== false),
    [cuentas]
  );

  // 🔹 cuando cambiamos a modo editar, rellenamos el formulario con el asiento seleccionado
  useEffect(() => {
    if (modo === "editar" && asientoEditar) {
      setForm({
        fecha: asientoEditar.fecha || new Date().toISOString().slice(0, 10),
        descripcion: asientoEditar.descripcion || "",
        partidas: (asientoEditar.partidas || []).map((p) => {
          const cuentaId =
            p.cuenta?.id ??
            p.cuentaId ??
            p.cuenta?.codigo ??
            ""; // por si backend trae diferente
          let cuentaTexto = "";
          const sel = cuentasActivas.find(
            (c) => String(c.id) === String(cuentaId)
          );
          if (sel) cuentaTexto = etiquetaCuenta(sel);

          return {
            cuentaId: cuentaId || "",
            cuentaTexto,
            debe: p.debe && Number(p.debe) > 0 ? String(p.debe) : "",
            haber: p.haber && Number(p.haber) > 0 ? String(p.haber) : "",
          };
        }),
      });
    }

    // si volvemos a crear, dejamos el form limpio
    if (modo === "crear" && !asientoEditar) {
      setForm({
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: "",
        partidas: [{ cuentaId: "", cuentaTexto: "", debe: "", haber: "" }],
      });
    }
  }, [modo, asientoEditar, cuentasActivas]);

  const addRow = () =>
    //agregar partida
    setForm((f) => ({
      ...f,
      partidas: [
        ...f.partidas,
        { cuentaId: "", cuentaTexto: "", debe: "", haber: "" },
      ],
    }));

  const delRow = (i) =>
    //eliminar partida
    setForm((f) => ({
      ...f,
      partidas: f.partidas.filter((_, idx) => idx !== i),
    }));

  const update = (i, k, v) =>
    //bloqueo si una cuenta es seteada y es inactiva
    setForm((f) => {
      if (k === "cuentaId") {
        const sel = (cuentas || []).find((c) => String(c.id) === String(v));
        if (sel && sel.activo === false) {
          setAlert("Esa cuenta está inactiva y no se puede usar.");
          return f;
        }
      }

      const partidas = f.partidas.map((p, idx) => {
        if (idx !== i) return p;

        if (k === "cuentaTexto") {
          //se setea una cuenta por el texto combinado
          const texto = v;
          const sel = buscarCuentaPorEntrada(texto, cuentasActivas);
          return {
            ...p,
            cuentaTexto: texto,
            cuentaId: sel ? sel.id : "",
          };
        }

        if (k === "cuentaId") {
          // se setea una cuenta por el id
          const sel = (cuentas || []).find((c) => String(c.id) === String(v));
          return {
            ...p,
            cuentaId: v,
            cuentaTexto: sel ? `${sel.id} — ${sel.nombre}` : "",
          };
        }

        //si el debe tiene valor el haber se pone en 0 y viceversa
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

  const partidasNumericas = useMemo(
    //se formatea los valores para evitar conflictos
    () =>
      form.partidas.map((p) => ({
        ...p,
        debe: parseMonto(p.debe),
        haber: parseMonto(p.haber),
      })),
    [form.partidas]
  );

  const totalDebe = useMemo(
    //se calcula el total del debe
    () => Number(sumDebe(partidasNumericas).toFixed(2)),
    [partidasNumericas]
  );
  const totalHaber = useMemo(
    //se calcula el total del haber
    () => Number(sumHaber(partidasNumericas).toFixed(2)),
    [partidasNumericas]
  );
  const diferencia = useMemo(
    //se calcula la diferencia
    () => Number((totalDebe - totalHaber).toFixed(2)),
    [totalDebe, totalHaber]
  );
  const balanced = Math.abs(diferencia) < 0.005; //valida si esta balanceado

  const filasConError = useMemo(
    () =>
      form.partidas.map((p) => {
        const sinCuenta = !p.cuentaId;
        const d = parseMonto(p.debe);
        const h = parseMonto(p.haber);
        const ambosCeros = d === 0 && h === 0; //no hay ni debe ni haber
        const ambosLlenos = d > 0 && h > 0; //ambos campos estan llenos

        const cuentaSel = (cuentas || []).find(
          //verifica si la cuenta esta inanctiva
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
    //eroror global: filas con errores o campos vacios
    () => filasConError.some((e) => e.tieneError) || !form.descripcion.trim(),
    [filasConError, form.descripcion]
  );

  const guardar = async (e) => {
    //guarda o actualiza el asiento
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

      if (modo === "editar" && asientoEditar?.id != null) {
        // 🔹 actualizar
        await api.actualizarAsiento(asientoEditar.id, req);
        setAlert("Asiento actualizado correctamente.");
      } else {
        // 🔹 crear
        await api.crearAsiento(req);
        setAlert("Asiento guardado correctamente.");
      }

      // reset básico (para nuevo; al editar el padre limpia asientoEditar)
      setForm((f) => ({
        fecha: f.fecha,
        descripcion: "",
        partidas: [{ cuentaId: "", cuentaTexto: "", debe: "", haber: "" }],
      }));

      onSaved?.();
    } catch (err) {
      console.error(err);
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
        {/* encabezado */}
        <div className="px-6 pt-6 pb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {modo === "editar"
                ? "Editar asiento contable"
                : "Formulario de registro"}
            </h2>
            <p className="text-sm text-slate-500">
              Registra un asiento con múltiples partidas. Usa solo Debe o Haber
              por línea.
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">
                Descripción
              </label>
              <input
                placeholder="Compra de suministros, pago de servicios…"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
                className={
                  "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                  (!form.descripcion.trim()
                    ? "border-amber-300"
                    : "border-slate-300")
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

        {/* tabla de partidas*/}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 text-left border-b">
                <tr>
                  <th className="py-3 px-3 font-semibold w-[45%]">Cuenta</th>
                  <th className="py-3 px-3 font-semibold w-[18%]">Debe</th>
                  <th className="py-3 px-3 font-semibold w-[18%]">Haber</th>
                  <th className="py-3 px-3 font-semibold w-[12%] text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.partidas.map((p, i) => {
                  const err = filasConError[i];
                  const rowHasError = err.tieneError;

                  return (
                    <tr
                      key={i}
                      className={
                        (i % 2 ? "bg-white" : "bg-slate-50") +
                        (rowHasError
                          ? " outline outline-1 outline-amber-300"
                          : "")
                      }
                    >
                      {/* datalist */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          list={`cuentas-${i}`}
                          placeholder="Buscar por código o nombre…"
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (!p.cuentaId || err.inactiva
                              ? "border-amber-300"
                              : "border-slate-300")
                          }
                          value={p.cuentaTexto ?? ""} // <- TEXTO LIBRE
                          onChange={(e) =>
                            update(i, "cuentaTexto", e.target.value)
                          }
                          onBlur={(e) => {
                            const sel = buscarCuentaPorEntrada(
                              e.target.value,
                              cuentasActivas
                            );
                            if (!sel) update(i, "cuentaTexto", ""); // opcional: limpia si no hay match
                          }}
                        />
                        <datalist id={`cuentas-${i}`}>
                          {cuentasActivas.map((c) => (
                            <option
                              key={c.id}
                              value={`${c.id} — ${c.nombre}`}
                            />
                          ))}
                        </datalist>

                        {err.sinCuenta && (
                          <p className="text-xs text-amber-600 mt-1">
                            Selecciona una cuenta.
                          </p>
                        )}
                        {err.inactiva && (
                          <p className="text-xs text-rose-600 mt-1">
                            Esta cuenta está inactiva.
                          </p>
                        )}
                      </td>

                      {/* debe */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={p.debe ?? ""}
                          onChange={(e) => update(i, "debe", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (err.ambosLlenos
                              ? "border-amber-300"
                              : "border-slate-300")
                          }
                        />
                      </td>

                      {/* haber */}
                      <td className="py-2.5 px-3 border-t align-top">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={p.haber ?? ""}
                          onChange={(e) => update(i, "haber", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className={
                            "w-full border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 " +
                            (err.ambosLlenos
                              ? "border-amber-300"
                              : "border-slate-300")
                          }
                        />
                        {(err.ambosCeros || err.ambosLlenos) && (
                          <p className="text-xs text-amber-600 mt-1">
                            Escribe solo en Debe <b>o</b> en Haber.
                          </p>
                        )}
                      </td>

                      {/* quitar fila */}
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
                <span className="font-semibold">
                  Debe {totalDebe.toFixed(2)}
                </span>
                <span className="font-semibold">
                  Haber {totalHaber.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* btn guardar / cancelar */}
      <div className="flex items-center gap-3">
        <button
          className="px-5 py-2.5 rounded-lg
                     bg-slate-100 border border-slate-300 text-slate-700
                     hover:bg-slate-200 hover:border-sky-400 shadow-sm
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors"
          disabled={saving || !balanced || tieneErrores}
        >
          {saving
            ? "Guardando…"
            : modo === "editar"
            ? "Actualizar asiento"
            : "Guardar asiento"}
        </button>

        {modo === "editar" && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}

        {!balanced && (
          <span className="text-sm text-amber-700">
            El asiento debe estar balanceado para guardar.
          </span>
        )}
      </div>
    </form>
  );
}
