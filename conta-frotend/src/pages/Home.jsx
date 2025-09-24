import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../multimedia/logo.png";
import img1 from "../multimedia/img1.png";
import { api } from "../app/api";

// formateo rápido de número a dinero (sin locales fijos)
const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Home() {
  const [kpis, setKpis] = useState({
    ingresos: 0,
    gastos: 0,
    utilidad: 0,
    saldoCaja: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false); // por si luego quieres un skeleton
  const [err, setErr] = useState("");

  // Helper medio improvisado para el rango del mes actual
  const getMonthRange = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d1 = new Date(y, m, 1).toISOString().slice(0, 10);
    const d2 = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    return { d1, d2 };
  };

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) KPIs desde /mayor
        const { d1, d2 } = getMonthRange();
        const mayor = await api.getMayor({ desde: d1, hasta: d2 }); // objeto por cuenta
        // Nota: si no viene el "tipo" en la respuesta, usamos prefijos (4 ingreso, 5 costo, 6 gasto)
        let ingresos = 0,
          gastos = 0,
          costos = 0,
          saldoCaja = 0;

        for (const key of Object.keys(mayor || {})) {
          const c = mayor[key] || {};
          const id = String(c.cuentaId || key || "");
          const pref = id.charAt(0);
          const debe = Number(c.debe || 0);
          const haber = Number(c.haber || 0);
          const saldo = Number(c.saldo || 0);

          if (pref === "4") {
            // ingresos suelen aumentar en HABER
            ingresos += (haber - debe);
          } else if (pref === "5") {
            // costos suelen aumentar en DEBE
            costos += (debe - haber);
          } else if (pref === "6") {
            // gastos suelen aumentar en DEBE
            gastos += (debe - haber);
          }

          if (id === "1101") {
            // Caja
            saldoCaja = saldo;
          }
        }

        const utilidad = ingresos - (gastos + costos);

        setKpis({
          ingresos: Math.max(0, ingresos),
          gastos: Math.max(0, gastos + costos),
          utilidad,
          saldoCaja,
        });

        // 2) Movimientos recientes desde /asientos (ordenamos desc y aplanamos partidas)
        const asientos = await api.getAsientos();
        const parseDate = (s) => new Date(s).getTime() || 0;
        const ultimos = (Array.isArray(asientos) ? asientos : [])
          .sort((a, b) => parseDate(b.fecha) - parseDate(a.fecha))
          .slice(0, 5)
          .flatMap((a) =>
            (a.partidas || []).map((p) => ({
              fecha: a.fecha,
              cuenta: `${p.cuenta?.id || ""} ${p.cuenta?.nombre || ""}`.trim(),
              desc: a.descripcion || "",
              debe: Number(p.debe || 0),
              haber: Number(p.haber || 0),
            }))
          );

        setRecent(ultimos);
      } catch (e) {
        console.warn("Error en Home:", e);
        setErr("No se pudieron cargar los datos del panel.");
        // no tiro el error para que por lo menos se vea el resto del layout
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-center px-4">
          <img src={logo} alt="Logo" className="h-10 w-10 mr-4 rounded-full shadow" />
          <h1 className="text-2xl uppercase font-bold text-slate-900">Conta Pro</h1>
        </div>
      </header>

      <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 h-full items-stretch justify-start py-6 md:py-8">

          {/* Hero */}
          <section className="w-full overflow-hidden rounded-xl bg-slate-100 shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl lg:text-5xl">
                  Tu contabilidad, simplificada.
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Maneja las finanzas de tu empresa de una manera fácil, rápida y segura. Todo en un solo lugar.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/Asientos"
                    className="rounded-lg border-4 border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                  >
                    Registrar asiento
                  </Link>
                  <Link
                    to="/Catalogo"
                    className="rounded-lg border-4 border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    Ver catálogo de cuentas
                  </Link>
                </div>
              </div>

              <div className="hidden items-center justify-center bg-slate-100 p-8 md:flex">
                <img src={img1} alt="Logo" className="h-60 w-100" />
              </div>
            </div>
          </section>

          {/* KPIs */}
          <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Ingresos del mes", value: kpis.ingresos },
              { label: "Gastos del mes", value: kpis.gastos },
              { label: "Utilidad neta", value: kpis.utilidad },
              { label: "Saldo en caja", value: kpis.saldoCaja },
            ].map((kpi, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{kpi.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {money(kpi.value)}
                  </span>
                  {/* Badge fake, lo dejamos vacío para que quede “medio hecho” */}
                </div>
              </div>
            ))}
          </section>

          {/* Acciones rápidas */}
          <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Acciones rápidas</h3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Link
                to="/Asientos"
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                Nuevo asiento
              </Link>
              <Link
                to="/Catalogo"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition"
              >
                Cuentas
              </Link>
              <Link
                to="/Consultas"
                className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-center text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
              >
                Consultas
              </Link>
              <Link
                to="/LibroDiario"
                className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-700 hover:bg-orange-100 transition"
              >
                Libro Diario
              </Link>
              <Link
                to="/LibroMayor"
                className="rounded-lg border border-pink-400 bg-pink-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-pink-600 transition"
              >
                Libro Mayor
              </Link>
            </div>
          </section>

          {/* Resumen + Movimientos */}
          <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
              <h3 className="text-base font-semibold text-slate-900">Resumen de flujo de caja</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Entradas</span>
                  <span className="font-semibold text-emerald-700">
                    {money(kpis.ingresos)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Salidas</span>
                  <span className="font-semibold text-rose-700">
                    {money(kpis.gastos)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
                  <span className="text-slate-800 font-medium">Saldo</span>
                  <span className="font-bold text-slate-900">
                    {money(kpis.ingresos - kpis.gastos)}
                  </span>
                </div>
              </div>
              <div className="mt-4 h-24 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                {/* Placeholder por ahora */}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 overflow-x-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Movimientos recientes</h3>
                <Link to="/Consultas" className="text-sm font-medium text-blue-600 hover:underline">
                  Ver todo
                </Link>
              </div>
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Cuenta</th>
                    <th className="py-2 pr-4">Descripción</th>
                    <th className="py-2 pr-4 text-right">Debe</th>
                    <th className="py-2 pr-0 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Cargando…
                      </td>
                    </tr>
                  ) : recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Sin movimientos recientes
                      </td>
                    </tr>
                  ) : (
                    recent.map((m, i) => (
                      <tr key={i} className="text-slate-700">
                        <td className="py-2 pr-4">{m.fecha || ""}</td>
                        <td className="py-2 pr-4">{m.cuenta || ""}</td>
                        <td className="py-2 pr-4">{m.desc || ""}</td>
                        <td className="py-2 pr-4 text-right">
                          {m.debe ? money(m.debe) : "-"}
                        </td>
                        <td className="py-2 pr-0 text-right">
                          {m.haber ? money(m.haber) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {err && (
                <div className="mt-3 text-xs text-rose-600">{err}</div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className=" bg-slate-100 text-center text-sm text-slate-500 p-4">
        &copy; {new Date().getFullYear()} Conta Pro. Todos los derechos reservados.
      </footer>
    </div>
  );
}
