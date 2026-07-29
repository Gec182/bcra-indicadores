import { bcraGet } from "./lib/bcraClient.js";
import { withCache } from "./lib/cache.js";
import { resample } from "./lib/resample.js";

const SERIES_TTL_MS = 5 * 60 * 1000;
const PAGE_LIMIT = 3000;
const MAX_PAGES = 10;

export default async function handler(req, res) {
  try {
    const { tipo, id, moneda, desde, hasta, frecuencia = "diaria" } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: "Faltan los parámetros 'desde' y 'hasta' (YYYY-MM-DD)." });
    }

    let puntos;
    if (tipo === "monetaria") {
      if (!id) return res.status(400).json({ error: "Falta el parámetro 'id' (idVariable)." });
      puntos = await getSerieMonetaria(id, desde, hasta);
    } else if (tipo === "cambiaria") {
      if (!moneda) return res.status(400).json({ error: "Falta el parámetro 'moneda' (código ISO)." });
      puntos = await getSerieCambiaria(moneda, desde, hasta);
    } else {
      return res.status(400).json({ error: "El parámetro 'tipo' debe ser 'monetaria' o 'cambiaria'." });
    }

    const resampleada = resample(puntos, frecuencia);
    res.status(200).json({ frecuencia, cantidad: resampleada.length, puntos: resampleada });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}

async function getSerieMonetaria(idVariable, desde, hasta) {
  const cacheKey = `serie:monetaria:${idVariable}:${desde}:${hasta}`;
  return withCache(cacheKey, SERIES_TTL_MS, async () => {
    const puntos = [];
    let offset = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const json = await bcraGet(`/estadisticas/v4.0/Monetarias/${idVariable}`, {
        Desde: desde,
        Hasta: hasta,
        Limit: PAGE_LIMIT,
        Offset: offset,
      });
      const detalle = json.results?.[0]?.detalle || [];
      for (const d of detalle) puntos.push({ fecha: d.fecha, valor: d.valor });

      if (detalle.length < PAGE_LIMIT) break;
      offset += PAGE_LIMIT;
    }
    return puntos;
  });
}

async function getSerieCambiaria(moneda, desde, hasta) {
  const cacheKey = `serie:cambiaria:${moneda}:${desde}:${hasta}`;
  return withCache(cacheKey, SERIES_TTL_MS, async () => {
    const puntos = [];
    let offset = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const json = await bcraGet(`/estadisticascambiarias/v1.0/Cotizaciones/${moneda}`, {
        fechaDesde: desde,
        fechaHasta: hasta,
        limit: PAGE_LIMIT,
        offset,
      });
      const dias = json.results || [];
      for (const dia of dias) {
        const detalleMoneda = dia.detalle?.find((x) => x.codigoMoneda === moneda) || dia.detalle?.[0];
        if (detalleMoneda) {
          puntos.push({ fecha: dia.fecha, valor: detalleMoneda.tipoCotizacion });
        }
      }
      if (dias.length < PAGE_LIMIT) break;
      offset += PAGE_LIMIT;
    }
    return puntos;
  });
}
