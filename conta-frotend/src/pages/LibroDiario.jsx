import React from 'react';

// Datos de ejemplo para ver la tabla
const libroDiarioMock = [
    {
        fecha: '2025-09-22',
        asientoId: 101,
        descripcion: 'Compra de suministros de oficina al crédito.',
        cuentaId: '5105',
        cuentaNombre: 'Gastos de Oficina',
        parcial: 150.00,
        debe: 150.00,
        haber: 0,
    },
    {
        fecha: '2025-09-22',
        asientoId: 101,
        descripcion: 'Compra de suministros de oficina al crédito.',
        cuentaId: '2102',
        cuentaNombre: 'Cuentas por Pagar',
        parcial: 150.00,
        debe: 0,
        haber: 150.00,
    },
    {
        fecha: '2025-09-21',
        asientoId: 100,
        descripcion: 'Venta de servicios de contado.',
        cuentaId: '1101',
        cuentaNombre: 'Caja General',
        parcial: 800.00,
        debe: 800.00,
        haber: 0,
    },
    {
        fecha: '2025-09-21',
        asientoId: 100,
        descripcion: 'Venta de servicios de contado.',
        cuentaId: '4101',
        cuentaNombre: 'Ingresos por Servicios',
        parcial: 800.00,
        debe: 0,
        haber: 800.00,
    },
    {
        fecha: '2025-09-20',
        asientoId: 99,
        descripcion: 'Pago de salario de la primera quincena.',
        cuentaId: '5101',
        cuentaNombre: 'Sueldos y Salarios',
        parcial: 1250.00,
        debe: 1250.00,
        haber: 0,
    },
    {
        fecha: '2025-09-20',
        asientoId: 99,
        descripcion: 'Pago de salario de la primera quincena.',
        cuentaId: '1102',
        cuentaNombre: 'Bancos',
        parcial: 1250.00,
        debe: 0,
        haber: 1250.00,
    },
];

export default function LibroDiario() {
    let lastAsientoId = null;

    return (
        <div className="min-h-screen w-full overflow-x-hidden pr-4 sm:pr-6 bg-slate-50 text-slate-800 flex flex-col">

            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
                <div className="w-full flex h-16 items-center justify-between px-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 ml-20">Libro Diario</h1>
                    <div className="text-sm text-slate-600 mr-4">Asientos: 3</div>
                </div>
            </header>

            <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
                <div className="w-full flex flex-col gap-6 min-h-full items-stretch justify-start py-4 md:py-12">

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-4 pt-6 pb-4 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Movimientos del diario</h2>
                                <p className="text-slate-500 text-sm">Consulta, filtra y exporta los asientos registrados.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <button className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-700 font-semibold shadow-sm ring-1 ring-blue-600/10">Refrescar</button>
                                <button className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-700 font-semibold shadow-sm ring-1 ring-blue-600/10">Expandir</button>
                                <button className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-700 font-semibold shadow-sm ring-1 ring-blue-600/10">Colapsar</button>
                                <button className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-700 font-semibold shadow-sm ring-1 ring-blue-600/10">Generar PDF</button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6">
                        <h3 className="font-semibold text-slate-800 mb-3">Buscar y organizar</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full text-sm">
                            <div className="relative">
                                <input
                                    placeholder="Buscar por id, descripción o cuenta…"
                                    className="w-full border border-slate-300 rounded-lg h-10 px-3 pr-9 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                            </div>
                            <input
                                type="date"
                                className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                aria-label="Desde"
                            />
                            <input
                                type="date"
                                className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                aria-label="Hasta"
                            />
                            <select className="border border-slate-300 rounded-lg h-10 px-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                <option>Fecha (recientes primero)</option>
                                <option>Fecha (antiguos primero)</option>
                                <option>ID ↑</option>
                                <option>ID ↓</option>
                            </select>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-md">
                        <div className="overflow-x-auto max-h-[70vh]">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50 text-slate-700 text-left border-b uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="py-3 px-3 font-semibold">Fecha</th>
                                    <th className="py-3 px-3 font-semibold">Asiento</th>
                                    <th className="py-3 px-3 font-semibold">Descripción</th>
                                    <th className="py-3 px-3 font-semibold">Cuenta</th>
                                    <th className="py-3 px-3 font-semibold">Nombre</th>
                                    <th className="py-3 px-3 font-semibold text-right">Parcial</th>
                                    <th className="py-3 px-3 font-semibold text-right">Debe</th>
                                    <th className="py-3 px-3 font-semibold text-right">Haber</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {libroDiarioMock.map((partida, index) => {
                                    const isNewAsiento = lastAsientoId !== partida.asientoId;
                                    lastAsientoId = partida.asientoId;
                                    const trClass = isNewAsiento && index > 0 ? "border-t-2 border-slate-300" : "";

                                    return (
                                        <tr key={index} className={trClass}>
                                            <td className="py-2.5 px-3 whitespace-nowrap">{isNewAsiento ? partida.fecha : ''}</td>
                                            <td className="py-2.5 px-3 font-mono text-slate-800">{isNewAsiento ? partida.asientoId : ''}</td>
                                            <td className="py-2.5 px-3">{isNewAsiento ? partida.descripcion : ''}</td>
                                            <td className="py-2.5 px-3 font-mono">{partida.cuentaId}</td>
                                            <td className="py-2.5 px-3">{partida.cuentaNombre}</td>
                                            <td className="py-2.5 px-3 text-right">{partida.parcial.toFixed(2)}</td>
                                            <td className="py-2.5 px-3 text-right">{partida.debe.toFixed(2)}</td>
                                            <td className="py-2.5 px-3 text-right">{partida.haber.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                                <tfoot className="bg-slate-100 text-slate-800">
                                <tr>
                                    <td className="py-3 px-3 font-semibold" colSpan={6}>Totales del periodo</td>
                                    <td className="py-3 px-3 text-right font-mono font-semibold">2200.00</td>
                                    <td className="py-3 px-3 text-right font-mono font-semibold">2200.00</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="px-3 py-3 text-xs text-slate-500">Mostrando 3 asientos • Debe: 2200.00 • Haber: 2200.00</div>
                    </section>
                </div>
            </main>
        </div>
    );
}