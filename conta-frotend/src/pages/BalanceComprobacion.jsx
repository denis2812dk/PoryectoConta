import { useEffect, useState } from "react";
import { reportes } from "../app/api";
import { jsPDF } from "jspdf";

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function BalanceComprobacion() {
  const [data, setData] = useState({ filas: [], totalDebe: 0, totalHaber: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await reportes.balanceComprobacion(); // <-- sin params
      // orden opcional por cuentaId
      res.filas = (res.filas || [])
        .slice()
        .sort((a, b) => (a.cuentaId > b.cuentaId ? 1 : -1));
      setData(res || { filas: [], totalDebe: 0, totalHaber: 0 });
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cuadrado =
    Number(data.totalDebe ?? 0).toFixed(2) ===
    Number(data.totalHaber ?? 0).toFixed(2);

  // 👉 Generar PDF (sin html2canvas)
  const handleDownloadPdf = () => {
    const { filas, totalDebe, totalHaber } = data;
    if (!filas || filas.length === 0) return;

    const pdf = new jsPDF("p", "mm", "a4");
    let y = 15;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Balance de Comprobación", 10, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Total cuentas: ${filas.length}   |   ¿Cuadra? ${
        cuadrado ? "Sí" : "No"
      }`,
      10,
      y
    );
    y += 8;

    // Encabezados tabla
    pdf.setFont("helvetica", "bold");
    pdf.text("Cuenta", 10, y);
    pdf.text("Nombre", 35, y);
    pdf.text("Debe", 150, y, { align: "right" });
    pdf.text("Haber", 190, y, { align: "right" });
    y += 5;
    pdf.setDrawColor(200);
    pdf.line(10, y, 200, y);
    y += 4;

    pdf.setFont("helvetica", "normal");

    const pageHeight = pdf.internal.pageSize.getHeight();

    for (const f of filas) {
      // salto de página si se llena
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 15;
        // reimprimir encabezados en la nueva página
        pdf.setFont("helvetica", "bold");
        pdf.text("Cuenta", 10, y);
        pdf.text("Nombre", 35, y);
        pdf.text("Debe", 150, y, { align: "right" });
        pdf.text("Haber", 190, y, { align: "right" });
        y += 5;
        pdf.setDrawColor(200);
        pdf.line(10, y, 200, y);
        y += 4;
        pdf.setFont("helvetica", "normal");
      }

      pdf.text(String(f.cuentaId ?? ""), 10, y);
      pdf.text(String(f.nombre ?? ""), 35, y, { maxWidth: 100 });

      pdf.text(money(f.debe ?? 0), 150, y, { align: "right" });
      pdf.text(money(f.haber ?? 0), 190, y, { align: "right" });

      y += 5;
    }

    // Línea antes de totales
    y += 2;
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.4);
    pdf.line(10, y, 200, y);
    y += 5;

    // Totales
    pdf.setFont("helvetica", "bold");
    pdf.text("Totales", 120, y, { align: "right" });
    pdf.text(money(totalDebe ?? 0), 150, y, { align: "right" });
    pdf.text(money(totalHaber ?? 0), 190, y, { align: "right" });
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `El balance ${
        cuadrado ? "cuadra correctamente" : "NO cuadra"
      } (debe vs haber).`,
      10,
      y
    );

    pdf.save("balance-comprobacion.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3">
      <div className="max-w-6xl mx-auto grid gap-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Balance de Comprobación
            </h2>
            
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-slate-700 text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-slate-700 text-sm">Cargando...</div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">
                Cuentas:{" "}
                <span className="font-semibold text-slate-800">
                  {data.filas?.length ?? 0}
                </span>
              </div>
              <div className="text-sm">
                ¿Cuadra?{" "}
                <span
                  className={
                    cuadrado ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"
                  }
                >
                  {cuadrado ? "Sí" : "No"}
                </span>
              </div>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-slate-100/80">
                  <tr className="text-slate-700">
                    <th className="text-left px-3 py-2.5 font-semibold w-28">
                      Cuenta
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold">
                      Nombre
                    </th>
                    <th className="text-right px-3 py-2.5 font-semibold w-32">
                      Debe
                    </th>
                    <th className="text-right px-3 py-2.5 font-semibold w-32">
                      Haber
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data.filas || []).map((f, idx) => (
                    <tr
                      key={f.cuentaId}
                      className={
                        "border-t border-slate-100 " +
                        (idx % 2 === 0 ? "bg-white" : "bg-slate-50/60")
                      }
                    >
                      <td className="px-3 py-2 align-middle text-slate-800">
                        {f.cuentaId}
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-700">
                        {f.nombre}
                      </td>
                      <td className="px-3 py-2 align-middle text-right text-slate-800">
                        {money(f.debe)}
                      </td>
                      <td className="px-3 py-2 align-middle text-right text-slate-800">
                        {money(f.haber)}
                      </td>
                    </tr>
                  ))}
                  {(!data.filas || data.filas.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-slate-500 text-sm"
                      >
                        No hay datos para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100/80 border-t border-slate-200">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-2.5 font-semibold text-right text-slate-800"
                    >
                      Totales
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                      {money(data.totalDebe)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                      {money(data.totalHaber)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
