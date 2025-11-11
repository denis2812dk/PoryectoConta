const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function http(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    // Acepta JSON; sólo envías Content-Type si mandas body
    headers: { Accept: "application/json", ...(opts.body ? { "Content-Type": "application/json" } : {}) },
    credentials: "include",
    ...opts,
  });

  // Lee SIEMPRE como texto primero (evita 'Unexpected token')
  const text = await res.text();

  // Intenta parsear a JSON sólo si parece JSON
  const looksJson =
    (res.headers.get("content-type") || "").includes("application/json") ||
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"));

  const parsed = looksJson
    ? safeParse(text)   // intenta JSON.parse, si falla devuelve null
    : null;

  if (!res.ok) {
  // arma un mensaje de error usando lo que haya disponible (error, texto o status)
    const msg =
      (parsed && (parsed.error || parsed.message)) ||
      (text && text.slice(0, 400)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204 || text.length === 0) return null;

  // Si es JSON válido, devuelve el objeto; si no, devuelve el texto crudo
  return parsed ?? text;
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

async function httpVoid(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", ...(opts.body ? { "Content-Type": "application/json" } : {}) },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      msg = j.error || j.message || msg;
    } catch {
      if (text) msg = text.slice(0, 400);
    }
    throw new Error(msg);
  }
  return; // sin cuerpo
}

export const api = {
  getCuentas: () => http("/cuentas"),
  crearCuenta: (cuenta) => http("/cuentas", { method: "POST", body: JSON.stringify(cuenta) }),
  getAsientos: () => http("/asientos"),
  crearAsiento: (req) => http("/asientos", { method: "POST", body: JSON.stringify(req) }),
  eliminarCuenta: (id) => httpVoid(`/cuentas/${id}`, { method: "DELETE" }),
  inactivarCuenta: (id) => httpVoid(`/cuentas/${id}/inactivar`, { method: "PATCH" }),
  reactivarCuenta: (id) => httpVoid(`/cuentas/${id}/reactivar`, { method: "PATCH" }),
  actualizarCuenta: (id, body) => http(`/cuentas/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  getMayor: (params) => {
    const qs = new URLSearchParams(params || {}).toString();
    return http(`/mayor${qs ? `?${qs}` : ""}`);
  },
  getAsientosRecientes: () => http("/asientos"),
};

export const reportes = {
  balanceComprobacion: (desde, hasta) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ desde, hasta }).filter(([_, v]) => v)
      )
    ).toString();
    return http(`/reportes/balance-comprobacion${qs ? `?${qs}` : ""}`);
  },

  estadoResultados: (desde, hasta) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ desde, hasta }).filter(([_, v]) => v)
      )
    ).toString();
    return http(`/reportes/estado-resultados${qs ? `?${qs}` : ""}`);
  },

  balanceGeneral: (hasta) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ hasta }).filter(([_, v]) => v)
      )
    ).toString();
    return http(`/reportes/balance-general${qs ? `?${qs}` : ""}`);
  }
};