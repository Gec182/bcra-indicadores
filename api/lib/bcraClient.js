import { Agent } from "undici";

const BASE_URL = "https://api.bcra.gob.ar";

// La API pública del BCRA es conocida por servir un certificado TLS con una
// cadena incompleta/autofirmada en algunos entornos, lo que hace que Node
// rechace la conexión con UNABLE_TO_VERIFY_LEAF_SIGNATURE. Muchas
// integraciones (incluida la documentación no oficial) resuelven esto
// deshabilitando la verificación del certificado únicamente para este host.
//
// Esto es un trade-off de seguridad: estás confiando en la respuesta del
// servidor sin validar su certificado. Es razonable para consumir datos
// públicos de solo lectura, pero si el BCRA corrige su cadena de
// certificados en el futuro, se puede (y conviene) volver a poner esto en
// `true`.
const INSECURE_TLS = process.env.BCRA_TLS_INSECURE !== "false";

const insecureAgent = new Agent({
  connect: { rejectUnauthorized: false },
});

/**
 * Llama a un endpoint de la API del BCRA y devuelve el JSON parseado.
 * @param {string} path - path del endpoint, ej "/estadisticas/v4.0/Monetarias"
 * @param {Record<string, string | number | undefined>} params - query params
 */
export async function bcraGet(path, params = {}) {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    dispatcher: INSECURE_TLS ? insecureAgent : undefined,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Intentamos parsear el body como JSON (el BCRA suele devolver algo tipo
    // {"status":400,"errorMessages":["..."]}). Si no es JSON, mostramos el
    // texto crudo tal cual, recortado para no ensuciar la respuesta.
    let detalle = body;
    try {
      const json = JSON.parse(body);
      detalle = json.errorMessages?.join(" | ") || json.message || JSON.stringify(json);
    } catch {
      // no era JSON, dejamos el texto tal cual
    }
    if (detalle && detalle.length > 300) detalle = detalle.slice(0, 300) + "…";

    const err = new Error(
      `BCRA API respondió ${res.status} ${res.statusText} para ${url.pathname}${url.search}` +
        (detalle ? ` — Detalle: ${detalle}` : "")
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}
