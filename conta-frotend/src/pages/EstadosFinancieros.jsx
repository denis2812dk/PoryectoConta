import { useEffect, useState } from "react";
import { reportes } from "../app/api";
import { jsPDF } from "jspdf";

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// helper para ratios (resultado con 2 decimales)
const ratio = (num, den) => {
  if (den === 0 || den == null || num == null) return null;
  return (Number(num) / Number(den)).toFixed(2);
};

export default function EstadosFinancieros() {
  const [er, setEr] = useState(null);
  const [bg, setBg] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const [r1, r2] = await Promise.all([
        reportes.estadoResultados(),   // reporte general
        reportes.balanceGeneral(),     // balance general
      ]);
      setEr(r1);
      setBg(r2);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // KPI 1: Liquidez corriente = Activo corriente / Pasivo corriente
  const liquidezCorriente =
    bg && bg.activoCorriente != null && bg.pasivoCorriente != null
      ? ratio(bg.activoCorriente, bg.pasivoCorriente)
      : null;

  // KPI 2: Razón de endeudamiento = Pasivos totales / Activos totales
  const razonEndeudamiento =
    bg && bg.pasivos != null && bg.activos != null
      ? ratio(bg.pasivos, bg.activos)
      : null;

  // 👉 función para descargar PDF (sin html2canvas)
  const handleDownloadPdf = () => {
    if (!er || !bg) return;

    const pdf = new jsPDF("p", "mm", "a4");
    let y = 15;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Estados Financieros - Reporte General", 10, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // === Estado de Resultados ===
    pdf.setFont("helvetica", "bold");
    pdf.text("Estado de Resultados", 10, y);
    y += 6;
    pdf.setFont("helvetica", "normal");

    pdf.text("Ingresos:", 10, y);
    pdf.text(money(er.ingresos), 110, y, { align: "right" });
    y += 5;

    pdf.text("Costos y gastos:", 10, y);
    pdf.text(money(er.costosGastos), 110, y, { align: "right" });
    y += 5;

    const etiquetaUtilidad =
      er.utilidad < 0 ? "Pérdida del ejercicio:" : "Utilidad del ejercicio:";
    pdf.text(etiquetaUtilidad, 10, y);
    pdf.text(money(er.utilidad), 110, y, { align: "right" });
    y += 8;

    // === Balance General ===
    pdf.setFont("helvetica", "bold");
    pdf.text("Balance General", 10, y);
    y += 6;
    pdf.setFont("helvetica", "normal");

    // Activos
    pdf.setFont("helvetica", "bold");
    pdf.text("Activos", 10, y);
    y += 5;
    pdf.setFont("helvetica", "normal");

    pdf.text("Activo corriente:", 10, y);
    pdf.text(money(bg.activoCorriente ?? 0), 110, y, { align: "right" });
    y += 5;

    pdf.text("Activo no corriente:", 10, y);
    pdf.text(money(bg.activoNoCorriente ?? 0), 110, y, { align: "right" });
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total activos:", 10, y);
    pdf.text(money(bg.activos ?? 0), 110, y, { align: "right" });
    y += 8;
    pdf.setFont("helvetica", "normal");

    // Pasivos
    pdf.setFont("helvetica", "bold");
    pdf.text("Pasivos", 10, y);
    y += 5;
    pdf.setFont("helvetica", "normal");

    pdf.text("Pasivo corriente:", 10, y);
    pdf.text(money(bg.pasivoCorriente ?? 0), 110, y, { align: "right" });
    y += 5;

    pdf.text("Pasivo no corriente:", 10, y);
    pdf.text(money(bg.pasivoNoCorriente ?? 0), 110, y, { align: "right" });
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total pasivos:", 10, y);
    pdf.text(money(bg.pasivos ?? 0), 110, y, { align: "right" });
    y += 8;
    pdf.setFont("helvetica", "normal");

    // Capital
    pdf.setFont("helvetica", "bold");
    pdf.text("Capital contable", 10, y);
    y += 5;
    pdf.setFont("helvetica", "normal");

    pdf.text("Capital (sin utilidad):", 10, y);
    pdf.text(money(bg.capitalContable ?? bg.capital ?? 0), 110, y, {
      align: "right",
    });
    y += 5;

    pdf.text("Utilidad del período:", 10, y);
    pdf.text(money(bg.utilidad ?? 0), 110, y, { align: "right" });
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Patrimonio total:", 10, y);
    pdf.text(money(bg.patrimonioTotal ?? 0), 110, y, { align: "right" });
    y += 8;

    pdf.text("Total Pasivo + Patrimonio:", 10, y);
    pdf.text(money(bg.totalPasivosMasPatrimonio ?? 0), 110, y, {
      align: "right",
    });
    y += 5;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `¿Cuadra la ecuación contable? ${bg.equilibrioOK ? "Sí" : "No"
      } (Activos vs Pasivo + Patrimonio)`,
      10,
      y
    );
    y += 8;

    // === KPIs ===
    pdf.setFont("helvetica", "bold");
    pdf.text("Indicadores financieros clave", 10, y);
    y += 6;
    pdf.setFont("helvetica", "normal");

    pdf.text(
      `Liquidez corriente (AC / PC): ${liquidezCorriente != null ? liquidezCorriente : "N/D"
      }`,
      10,
      y
    );
    y += 5;

    pdf.text(
      `Razón de endeudamiento (Pasivos / Activos): ${razonEndeudamiento != null ? razonEndeudamiento : "N/D"
      }`,
      10,
      y
    );

    pdf.save("estados-financieros.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3">
      <div className="max-w-6xl mx-auto grid gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Estados Financieros
            </h2>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-slate-700 text-sm font-semibold shadow-md hover:bg-emerald-700 transition"
          >
            <span></span>
            <span>Descargar PDF</span>
          </button>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {err}
          </div>
        )}
        {loading && <div className="text-slate-700">Cargando...</div>}

        {/* === Bloque grande con ER + BG uno debajo del otro, ocupando todo el ancho === */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Estado de Resultados */}
          {er && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 text-lg">

                <span>Estado de Resultados</span>
              </h3>
              <div className="grid grid-cols-[2fr,1fr] gap-2 text-base">
                <div className="text-slate-700">Ingresos</div>
                <div className="text-right font-semibold">
                  {money(er.ingresos)}
                </div>

                <div className="text-slate-700">Costos y gastos</div>
                <div className="text-right font-semibold">
                  {money(er.costosGastos)}
                </div>

                <div className="font-semibold text-slate-800 mt-1">
                  {er.utilidad < 0
                    ? "Pérdida del ejercicio"
                    : "Utilidad del ejercicio"}
                </div>
                <div
                  className={`text-right font-semibold mt-1 ${er.utilidad < 0 ? "text-red-600" : "text-emerald-700"
                    }`}
                >
                  {money(er.utilidad)}
                </div>
              </div>
            </div>
          )}

          {/* Línea divisoria */}
          <hr className="my-2 border-slate-200" />

          {/* Balance General */}
          {bg && (
            <div className="mt-4">
              <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 text-lg">

                <span>Balance General</span>
              </h3>

              <div className="grid grid-cols-[2fr,1fr] gap-2 text-base">
                {/* Activos */}
                <div className="col-span-2 font-semibold text-slate-800 mt-1">
                  Activos
                </div>
                <div className="text-slate-700">Activo corriente</div>
                <div className="text-right font-medium">
                  {money(bg.activoCorriente ?? 0)}
                </div>

                <div className="text-slate-700">Activo no corriente</div>
                <div className="text-right font-medium">
                  {money(bg.activoNoCorriente ?? 0)}
                </div>

                <div className="font-semibold border-t border-slate-200 pt-1 mt-1 text-slate-800">
                  Total activos
                </div>
                <div className="text-right font-semibold border-t border-slate-200 pt-1 mt-1">
                  {money(bg.activos ?? 0)}
                </div>

                {/* Pasivos */}
                <div className="col-span-2 font-semibold text-slate-800 mt-4">
                  Pasivos
                </div>
                <div className="text-slate-700">Pasivo corriente</div>
                <div className="text-right font-medium">
                  {money(bg.pasivoCorriente ?? 0)}
                </div>

                <div className="text-slate-700">Pasivo no corriente</div>
                <div className="text-right font-medium">
                  {money(bg.pasivoNoCorriente ?? 0)}
                </div>

                <div className="font-semibold border-t border-slate-200 pt-1 mt-1 text-slate-800">
                  Total pasivos
                </div>
                <div className="text-right font-semibold border-t border-slate-200 pt-1 mt-1">
                  {money(bg.pasivos ?? 0)}
                </div>

                {/* Capital */}
                <div className="col-span-2 font-semibold text-slate-800 mt-4">
                  Capital contable
                </div>
                <div className="text-slate-700">Capital (sin utilidad)</div>
                <div className="text-right font-medium">
                  {money(bg.capitalContable ?? bg.capital ?? 0)}
                </div>

                <div className="text-slate-700">Utilidad del período</div>
                <div className="text-right font-medium">
                  {money(bg.utilidad ?? 0)}
                </div>

                <div className="font-semibold border-t border-slate-200 pt-1 mt-1 text-slate-800">
                  Patrimonio total
                </div>
                <div className="text-right font-semibold border-t border-slate-200 pt-1 mt-1">
                  {money(bg.patrimonioTotal ?? 0)}
                </div>

                {/* Total pasivo + patrimonio */}
                <div className="font-semibold mt-4 text-slate-800">
                  Total Pasivo + Patrimonio
                </div>
                <div className="text-right font-semibold mt-4">
                  {money(bg.totalPasivosMasPatrimonio ?? 0)}
                </div>

                <div className="col-span-2 text-sm text-slate-600 mt-1">
                  <span className="font-semibold text-slate-700">Resultado del balance: </span>
                  El balance
                  <span className={bg.equilibrioOK ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                    {bg.equilibrioOK ? " cuadra" : " no cuadra"}
                  </span>
                  .
                  <br />
                  <span className="text-slate-500">
                    Activos totales: {money(bg.activos ?? 0)}
                    &nbsp;|&nbsp;
                    Pasivo + Patrimonio: {money(bg.totalPasivosMasPatrimonio ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* KPIs */}
        {bg && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2 text-lg">
              <span className="text-amber-500 text-xl">📈</span>
              <span>Indicadores financieros clave</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2 text-base">
              {/* Liquidez Corriente */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="font-semibold text-emerald-900">
                  Liquidez corriente
                </div>
                <p className="text-emerald-900/80 text-sm mb-1">
                  Activo corriente / Pasivo corriente (capacidad de pago a corto plazo).
                </p>
                <div className="text-2xl font-bold">
                  {liquidezCorriente != null ? liquidezCorriente : "N/D"}
                </div>
              </div>

              {/* Razón de endeudamiento */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="font-semibold text-indigo-900">
                  Razón de endeudamiento
                </div>
                <p className="text-indigo-900/80 text-sm mb-1">
                  Pasivos totales / Activos totales (nivel de deuda de la empresa).
                </p>
                <div className="text-2xl font-bold">
                  {razonEndeudamiento != null ? razonEndeudamiento : "N/D"}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
