import { useState } from "react";

/**
 * Filtro de fechas reusable.
 * - showDesde/showHasta: muestra cada input
 * - onApply({desde, hasta})
 * - onClear(): limpia filtros
 */
export default function DateFilters({
  showDesde = true,
  showHasta = true,
  initialDesde = "",
  initialHasta = "",
  onApply,
  onClear,
}) {
  const [desde, setDesde] = useState(initialDesde);
  const [hasta, setHasta] = useState(initialHasta);

  const apply = () => onApply?.({ desde, hasta });
  const clear = () => {
    setDesde(""); setHasta("");
    onClear?.();
  };

  // presets útiles
  const monthPreset = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const first = `${y}-${m}-01`;
    const last = new Date(y, now.getMonth() + 1, 0).toISOString().slice(0, 10);
    if (showDesde) setDesde(first);
    if (showHasta) setHasta(last);
  };

  return (
    <div className="flex flex-wrap gap-2 items-end">
      {showDesde && (
        <label className="flex flex-col text-sm">
          <span className="mb-1">Desde</span>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                 className="border rounded px-3 py-2"/>
        </label>
      )}
      {showHasta && (
        <label className="flex flex-col text-sm">
          <span className="mb-1">Hasta</span>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                 className="border rounded px-3 py-2"/>
        </label>
      )}
      <button onClick={apply} className="px-3 py-2 rounded bg-[#313659] text-white">Aplicar</button>
      <button onClick={clear} className="px-3 py-2 rounded border">Limpiar</button>
      <button onClick={monthPreset} className="px-3 py-2 rounded border">Mes actual</button>
    </div>
  );
}
