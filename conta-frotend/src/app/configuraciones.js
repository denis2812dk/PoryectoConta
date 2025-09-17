export function redondear2(n) {
    const num = Number(n) || 0;
    return Number(num.toFixed(2))
}

export function converNumero(n) {

    const v = Number(n);
    return Number.isFinite(v) ? v : 0;

}
export function sumDebe(partidas) {
    return redondear2(partidas.reduce((acum, p) => acum + converNumero(p.debe), 0));
  }
  
  export function sumHaber(partidas) {
    return redondear2(partidas.reduce((acum, p) => acum + converNumero(p.haber), 0));
  }
export function asientoBalance(asiento) {
    if (!asiento || !Array.isArray(asiento.partidas)) return false;
    const d = sumDebe(asiento.partidas);
    const h = sumHaber(asiento.partidas);
    return d > 0 && d == h;
}

export function validacionAsientos(asiento, catalogo = []) {

    if (!asiento) errors.push("Asiento vacío");
    if (!asiento?.fecha) errors.push("Falta la fecha");
    if (!asiento?.descripcion?.trim()) errors.push("Faltadescripción");
    if (!Array.isArray(asiento?.partidas) || asiento.partidas.length < 2) {
        errors.push("Debe tener al menos 2 partidas.");
    }

    const cuentasIds = new Set(catalogo.map(c => c.id));
    (asiento.partidas || []).forEach((p, idx) => {
        const row = idx + 1;
        if (!p?.cuentaId) {
            errors.push(`Partida ${row}: falta cuentaId.`);
        } else if (catalogo.length && !cuentasIds.has(p.cuentaId)) {
            errors.push(`Partida ${row}: cuentaId "${p.cuentaId}" no existe en catálogo.`);
        }
        const d = toNum(p.debe);
        const h = toNum(p.haber);
        if (d > 0 && h > 0) errors.push(`Partida ${row}: no puede llevar valores en Debe y Haber a la vez.`);
        if (d < 0 || h < 0) errors.push(`Partida ${row}: montos no pueden ser negativos.`);
        if (d === 0 && h === 0) errors.push(`Partida ${row}: Debe o Haber deben ser > 0.`);
    });


    if (!asientoBalanceado(asiento)) {
        const d = sumDebe(asiento.partidas);
        const h = sumHaber(asiento.partidas);
        errors.push(`El asiento no está balanceado (Debe ${d} ≠ Haber ${h}).`);
    }

    return { ok: errors.length === 0, errors };
}

export function generarLibroDiario(asientos = []) {
    return [...asientos].sort((a, b) => {
        const fa = (a?.fecha || "");
        const fb = (b?.fecha || "");
        if (fa !== fb) return fa.localeCompare(fb);
        const ia = (a?.id || "");
        const ib = (b?.id || "");
        return ia.localeCompare(ib);
    });
}

export function generarLibroMayor(asientos = []) {
    const mayor = {};

    asientos.forEach(asiento => {
        const { fecha, descripcion } = asiento || {};
        (asiento?.partidas || []).forEach(p => {
            const cuentaId = p?.cuentaId || "";
            if (!cuentaId) return;

            if (!mayor[cuentaId]) {
                mayor[cuentaId] = {
                    cuentaId,
                    movimientos: [],
                    debe: 0,
                    haber: 0,
                    saldo: 0
                };
            }
            const debe = toNum(p.debe);

            const haber = toNum(p.haber);

            mayor[cuentaId].movimientos.push({
                fecha: fecha || "",
                descripcion: descripcion || "",
                debe: round2(debe),
                haber: round2(haber)
            });

            mayor[cuentaId].debe = round2(mayor[cuentaId].debe + debe);
            mayor[cuentaId].haber = round2(mayor[cuentaId].haber + haber);
        });
    });

    Object.values(mayor).forEach(cuenta => {
        cuenta.saldo = round2(cuenta.debe - cuenta.haber);

    });

    return mayor;
}  

export function saldoCuenta(mayor, cuentaId) {
    return round2(mayor?.[cuentaId]?.saldo ?? 0);
}

export function filtrarAsientos(asientos = [], filtros = {}) {
    const { texto = "", desde = null, hasta = null } = filtros;
    const q = (texto || "").trim().toLowerCase();
    return asientos.filter(a => {
        const desc = (a?.descripcion || "").toLowerCase();
        const fecha = a?.fecha || "";
        const okTexto = !q || desc.includes(q);
        const okDesde = !desde || (fecha >= desde);
        const okHasta = !hasta || (fecha <= hasta);
        return okTexto && okDesde && okHasta;
    });
}


