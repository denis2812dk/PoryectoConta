import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../multimedia/logo.png";
import img1 from "../multimedia/img1.png";
import { api } from "../app/api";

const dinero = (n) => //formateador para mostrar montos con moneda de dolar y ajustar el numero de decimales 
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,  //numero fracciones
  });


export default function Home() {  //Componente principal(Inicio del sistema)
 
  const [kpis, setKpis] = useState({//kpis del sistema para medir o anailizar el rendimiento de la empresa en base a los asientos ya agregados en la base de datos
    ingresos: 0, 
    gastos: 0,
    utilidad: 0,
    saldoCaja: 0,
  });
  const [recent, setRecent] = useState([]); //muestra los movimientos reciente
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const getRangoMes = () => {//obtiene el primer y ultimmo del mes para calcular el rango
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = hoy.getMonth();
    const d1 = new Date(y, m, 1).toISOString().slice(0, 10);
    const d2 = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    return { d1, d2 };
  };

  
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setErr("");
      try {
        const { d1, d2 } = getRangoMes(); //se aplica la funciona ya creada para obtener el prier y ultimo dia para asignar en constantes
        const mayor = await api.getMayor({ desde: d1, hasta: d2 }); //obtiene el libro mayor desde el backend

        let ingresos = 0; // se crean los acomuladores de las kpis
        let gastos = 0;     
        let saldoCaja = 0;   

        for (const key of Object.keys(mayor || {})) { //si mayor esta vacio se evita fallar el sistea con {}
          const c = mayor[key] || {}; //evita que mmayor sea undefined
          const id = String(c.cuentaId ?? key ?? ""); //se asigna el codigo de cuenta que obtuvimos del backend
          const pref = id.charAt(0);  //se obtiene el primer digito para saber a que grupo pertenece

          const debe  = Number(c.debe  ?? 0); //se asgina el total del debe
          const haber = Number(c.haber ?? 0); //se asigna el total del haber

          if (pref === "5") {  //si es una cuenta de ingreso se suma lo que crecio en el haber
            ingresos += (haber - debe);
          } else if (pref === "4") { // si es una cuenta de gasto/costos se crecio en el debe
            gastos += (debe - haber);
          }
        
          if (id.startsWith("1101")) { //si la cuenta pertenece a Caja/Bancos se toma el saldo directo y se agrega al total de efectivo del panel
            const saldo = Number(c.saldo ?? (debe - haber));
            saldoCaja += saldo;
          }
        }

        ingresos = Math.max(0, ingresos); //los ingresos y gastos no quedan negativos pero se establece solo para visualización
        gastos   = Math.max(0, gastos);

        const utilidad = ingresos - gastos; //calcula la utilidad del periodo

        setKpis({ ingresos, gastos, utilidad, saldoCaja }); //se obtiene todos los asientos registrados
        const asientos = await api.getAsientos();
        const parseDate = (s) => new Date(s).getTime() || 0;
        const ultimos = (Array.isArray(asientos) ? asientos : [])
          .sort((a, b) => parseDate(b.fecha) - parseDate(a.fecha))
          .slice(0, 5)
          .flatMap((a) =>
            (a.partidas || []).map((p) => ({//se desarman los asientos para mostrar sus movimientos
              fecha: a.fecha,
              cuenta: `${p.cuenta?.id || ""} ${p.cuenta?.nombre || ""}`.trim(),//codigo y nombre
              desc: a.descripcion || "",
             
              debe: Number(p.debe || 0), //monto debe o 0 si no aplica
              haber: Number(p.haber || 0),//monto haber o 0 si no aplica
            }))
          );

        setRecent(ultimos);
      } catch (e) {
        console.warn("Error en Home:", e);
        setErr("No se pudieron cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    cargar();

  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/*encabezado */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-center px-4">
          <img src={logo} alt="Logo" className="h-10 w-10 mr-4 rounded-full shadow" />
          <h1 className="text-2xl uppercase font-bold text-slate-900">Conta Pro</h1>
        </div>
      </header>

      <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 h-full items-stretch justify-start py-6 md:py-8">

          {/* mensaje principal y accesos directos */}
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
                  {/* btn registrar asiento*/}
                  <Link
                    to="/Asientos"
                    className="rounded-lg border-4 border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                  >
                    Registrar asiento
                  </Link>
                  {/* btn catalogo */}
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

          {/* btn indicadores */}
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
                    {dinero(kpi.value)}
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* section acciones rapidas */}
          <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Acciones rápidas</h3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Link
                to="/Asientos"
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                Registrar asiento
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

          {/* panel con resumen de movimientos*/}
          <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
              <h3 className="text-base font-semibold text-slate-900">Resumen de flujo de caja</h3>
              <div className="mt-3 space-y-2">
                {/* panel de ingresos del periodo*/}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Entradas</span>
                  <span className="font-semibold text-emerald-700">
                    {dinero(kpis.ingresos)}
                  </span>
                </div>
                {/* panel de gastos */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Salidas</span>
                  <span className="font-semibold text-rose-700">
                    {dinero(kpis.gastos)}
                  </span>
                </div>
                {/* panel de saldo */}
                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
                  <span className="text-slate-800 font-medium">Saldo</span>
                  <span className="font-bold text-slate-900">
                    {dinero(kpis.ingresos - kpis.gastos)}
                  </span>
                </div>
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
                          {m.debe ? dinero(m.debe) : "-"}
                        </td>
                        <td className="py-2 pr-0 text-right">
                          {m.haber ? dinero(m.haber) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {err && <div className="mt-3 text-xs text-rose-600">{err}</div>}
            </div>
          </section>

          {/* integrantes*/}
          <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Desarrollado por:
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <span className="font-semibold">BALCACERES SILVESTRE, LUIS FELIPE</span> — Ingeniería en Desarrollo de Software, Tercer año
              </li>
              <li>
                <span className="font-semibold">CHÁVEZ SOLITO, RENÉ DAVID</span> — Ingeniería en Desarrollo de Software, Tercer año
              </li>
              <li>
                <span className="font-semibold">CRUZ ALGARIN, KATHERINNE JEANNETTE</span> — Ingeniería en Desarrollo de Software, Tercer año
              </li>
              <li>
                <span className="font-semibold">GUEVARA MARTINEZ, DENNIS ADEMIR</span> — Ingeniería en Desarrollo de Software, Tercer año
              </li>
              <li>
                <span className="font-semibold">VILLEDA ALABI, MARIO EDGARDO</span> — Ingeniería en Desarrollo de Software, Tercer año
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* pie de pagina */}
      <footer className=" bg-slate-100 text-center text-sm text-slate-500 p-4">
        &copy; {new Date().getFullYear()} Conta Pro. Todos los derechos reservados.
      </footer>
    </div>
  );
}