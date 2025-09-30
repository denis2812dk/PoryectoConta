export const round2 = (n) => Number((Number(n) || 0).toFixed(2)); // redondear a 2 decimales (acepta números o strings numéricos)

export const toNum = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0); // convertimos a número seguro; si no es válido, devuelve 0

export const sumDebe = (partidas) => round2(partidas.reduce((a, p) => a + toNum(p.debe), 0));// suma de débitos en un arreglo de partidas

export const sumHaber = (partidas) => round2(partidas.reduce((a, p) => a + toNum(p.haber), 0));// suma de créditos en un arreglo de partidas


// comprobamos que el asiento cuadre (debe === haber y > 0)
export const asientoBalanceado = (a) => {
    if (!a || !Array.isArray(a.partidas)) return false;
    const d = sumDebe(a.partidas); const h = sumHaber(a.partidas);
    return d > 0 && d === h;
};

// ordena asientos por fecha desc o por id desc si tienen la misma fecha
export const generarLibroDiario = (asientos = []) => [...asientos].sort((a, b) => (a.fecha || "").localeCompare(b.fecha || "") || String(a.id).localeCompare(String(b.id)));

// armar el libro mayor por cuenta a partir de los asientos
export const generarLibroMayor = (asientos = []) => {
    const mayor = {};
    asientos.forEach(a => {
        (a.partidas || []).forEach(p => {
            const cuentaId = p.cuenta?.id || p.cuentaId || "";
            if (!cuentaId) return;
            mayor[cuentaId] ||= { cuentaId, nombre: p.cuenta?.nombre || cuentaId, movimientos: [], debe: 0, haber: 0, saldo: 0 };
            mayor[cuentaId].movimientos.push({ fecha: a.fecha, descripcion: a.descripcion, debe: toNum(p.debe), haber: toNum(p.haber) });
            mayor[cuentaId].debe = round2(mayor[cuentaId].debe + toNum(p.debe));
            mayor[cuentaId].haber = round2(mayor[cuentaId].haber + toNum(p.haber));
        });
    });
    Object.values(mayor).forEach(c => c.saldo = round2(c.debe - c.haber));
    return mayor;
};