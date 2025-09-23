import React from "react";
import { Link } from "react-router-dom";
import logo from '../multimedia/logo.png';
export default function Home() {
    return (

        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white shadow-sm">
    <div className="mx-auto max-w-7xl flex h-16 items-center justify-center px-4">
        <img src={logo} alt="Logo" className="h-10 w-10 mr-4 rounded-full shadow" />
        <h1 className="text-2xl uppercase font-bold text-slate-900">
            Conta Pro
        </h1>
    </div>
</header>

            <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 h-full items-stretch justify-start py-6 md:py-8">

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
                                    <Link to="/Asientos" className="rounded-lg border-4 border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition">
                                        Registrar asiento
                                    </Link>
                                    <Link to="/Catalogo" className="rounded-lg border-4 border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition">
                                        Ver catálogo de cuentas
                                    </Link>
                                </div>
                            </div>

                            <div className="hidden items-center justify-center bg-slate-100 p-8 md:flex">
                                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-slate-200">
                                    <p className="text-slate-500"></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*esto esta pensado para que le metan datos en tiempo real*/}

                    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Ingresos del mes", value: "$ 0.00", badge: "+0%", badgeColor: "bg-green-100 text-green-700" },
                            { label: "Gastos del mes", value: "$ 0.00", badge: "+0%", badgeColor: "bg-red-100 text-red-700" },
                            { label: "Utilidad neta", value: "$ 0.00", badge: "0%", badgeColor: "bg-amber-100 text-amber-700" },
                            { label: "Saldo en caja", value: "$ 0.00", badge: "", badgeColor: "bg-slate-100 text-slate-600" },
                        ].map((kpi, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm text-slate-500">{kpi.label}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
                                    {kpi.badge && (
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${kpi.badgeColor}`}>
                                            {kpi.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900">Acciones rápidas</h3>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            <Link to="/Asientos" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition">Nuevo asiento</Link>
                            <Link to="/Catalogo" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition">Cuentas</Link>
                            <Link to="/Consultas" className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-center text-sm font-medium text-purple-700 hover:bg-purple-100 transition">Consultas</Link>
                            <Link to="/LibroDiario" className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-700 hover:bg-orange-100 transition">Libro Diario</Link>
                            <Link to="/LibroMayor" className="rounded-lg border border-pink-400 bg-pink-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-pink-600 transition">Libro Mayor</Link>
                            </div>
                    </section>

                    <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
                            <h3 className="text-base font-semibold text-slate-900">Resumen de flujo de caja</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Entradas</span>
                                    <span className="font-semibold text-emerald-700">$ 0.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Salidas</span>
                                    <span className="font-semibold text-rose-700">$ 0.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
                                    <span className="text-slate-800 font-medium">Saldo</span>
                                    <span className="font-bold text-slate-900">$ 0.00</span>
                                </div>
                            </div>
                            <div className="mt-4 h-24 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500">

                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900">Movimientos recientes</h3>
                                <Link to="/Consultas" className="text-sm font-medium text-blue-600 hover:underline">Ver todo</Link>
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
                                    {[
                                        { fecha: "xxxx-xx-xx", cuenta: "nombreCuenta", desc: "desc", debe: "-", haber: "$ 0.00" },
                                        { fecha: "xxxx-xx-xx", cuenta: "nombreCuenta", desc: "desc", debe: "$ 0.00", haber: "-" },
                                        { fecha: "xxxx-xx-xx", cuenta: "nombreCuenta", desc: "desc", debe: "$ 0.00", haber: "-" },
                                    ].map((m, i) => (
                                        <tr key={i} className="text-slate-700">
                                            <td className="py-2 pr-4">{m.fecha}</td>
                                            <td className="py-2 pr-4">{m.cuenta}</td>
                                            <td className="py-2 pr-4">{m.desc}</td>
                                            <td className="py-2 pr-4 text-right">{m.debe}</td>
                                            <td className="py-2 pr-0 text-right">{m.haber}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            <footer className=" bg-slate-100 text-center text-sm text-slate-500 p-4">
                &copy; {new Date().getFullYear()} Conta App. Todos los derechos reservados.
            </footer>
        </div>
    );
}