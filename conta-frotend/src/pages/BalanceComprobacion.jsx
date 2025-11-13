import { useEffect, useState } from "react";
import { reportes } from "../app/api";

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BalanceComprobacion() {
  const [data, setData] = useState({ filas: [], totalDebe: 0, totalHaber: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true); setErr("");
      const res = await reportes.balanceComprobacion(); // <-- sin params
      // orden opcional por cuentaId
      res.filas = (res.filas || []).slice().sort((a, b) => (a.cuentaId > b.cuentaId ? 1 : -1));
      setData(res || { filas: [], totalDebe: 0, totalHaber: 0 });
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Balance de Comprobación</h2>
      </div>

      {err && <div className="text-red-600">{err}</div>}
      {loading ? "Cargando..." : (
        <div className="overflow-auto rounded-xl border">
          <table className="min-w-[720px] w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Cuenta</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-right p-3">Debe</th>
                <th className="text-right p-3">Haber</th>
              </tr>
            </thead>
            <tbody>
              {(data.filas || []).map((f) => (
                <tr key={f.cuentaId} className="border-t">
                  <td className="p-3">{f.cuentaId}</td>
                  <td className="p-3">{f.nombre}</td>
                  <td className="p-3 text-right">{money(f.debe)}</td>
                  <td className="p-3 text-right">{money(f.haber)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={2} className="p-3 font-semibold text-right">Totales</td>
                <td className="p-3 text-right font-semibold">{money(data.totalDebe)}</td>
                <td className="p-3 text-right font-semibold">{money(data.totalHaber)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
