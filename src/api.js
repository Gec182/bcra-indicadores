// En Vercel, frontend y funciones (/api/*) se sirven del mismo origen, así
// que por default no hace falta ninguna URL base. Se puede overridear con
// VITE_API_BASE_URL para apuntar a otro backend (ej. testing local con
// `vercel dev`, que ya sirve todo junto en el mismo puerto).
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status} consultando ${path}`);
  }
  return res.json();
}

export function getDestacados() {
  return getJSON("/api/indicadores/destacados");
}

export function searchMonetarias(query) {
  const q = encodeURIComponent(query || "");
  return getJSON(`/api/indicadores/monetarias?search=${q}`);
}

export function getSerie({ tipo, id, moneda, desde, hasta, frecuencia }) {
  const params = new URLSearchParams({ tipo, desde, hasta, frecuencia });
  if (id !== undefined) params.set("id", id);
  if (moneda !== undefined) params.set("moneda", moneda);
  return getJSON(`/api/series?${params.toString()}`);
}
