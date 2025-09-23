// app/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function http(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || JSON.stringify(data) || res.statusText);
  }
  return res.json();
}

export const api = {
  getCuentas: () => http("/cuentas"),
  crearCuenta: (cuenta) => http("/cuentas", { method: "POST", body: JSON.stringify(cuenta) }),
  getAsientos: () => http("/asientos"),
  crearAsiento: (req) => http("/asientos", { method: "POST", body: JSON.stringify(req) }),

  // NUEVO: mayorización y asientos recientes
  getMayor: (params) => {
    const qs = new URLSearchParams(params || {}).toString();
    return http(`/mayor${qs ? `?${qs}` : ""}`);
  },
  getAsientosRecientes: () => http("/asientos"), // luego ordenamos y cortamos en el front
};