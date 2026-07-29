import { bcraGet } from "./lib/bcraClient.js";
import { withCache } from "./lib/cache.js";
import { resample } from "./lib/resample.js";

const SERIES_TTL_MS = 5 * 60 * 1000;
const PAGE_LIMIT_MONETARIA = 3000; // máximo documentado para /estadisticas/v4.0/Monetarias
const PAGE_LIMIT_CAMBIARIA = 1000; // el BCRA respondió: "El límite debe estar entre 10 y 1000"
const MAX_PAGES = 10;
const DIAS_MAX_POR_VENTANA = 365; // la API de Cotizaciones del BCRA rechaza (400) rangos de más de 1 año

// Parte [desde, hasta] en tramos de como máximo `DIAS_MAX_POR_VENTANA` días.
function ventanasDeFecha(desde, hasta) {
  const ventanas = [];
  let inicio = new Date(desde + "T00:00:00Z");
  const fin = new Date(hasta + "T00:00:00Z");

  while (inicio <= fin) {
    const finVentana = new Date(inicio);
    finVentana.setUTCDate(finVentana.getUTCDate() + DIAS_MAX_POR_VENTANA - 1);
    if (finVentana > fin) finVentana.setTime(fin.getTime());

    ventanas.push({
      desde: inicio.toISOString().slice(0, 10),
      hasta: finVentana.toISOString().slice(0, 10),
    });

    inicio = new Date(finVentana);
    inicio.setUTCDate(inicio.getUTCDate() + 1);
  }

  return ventanas;
}

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
    for (const ventana of ventanasDeFecha(desde, hasta)) {
      let offset = 0;
      for (let page = 0; page < MAX_PAGES; page++) {
        const json = await bcraGet(`/estadisticas/v4.0/Monetarias/${idVariable}`, {
          Desde: ventana.desde,
          Hasta: ventana.hasta,
          Limit: PAGE_LIMIT_MONETARIA,
          Offset: offset,
        });
        const detalle = json.results?.[0]?.detalle || [];
        for (const d of detalle) puntos.push({ fecha: d.fecha, valor: d.valor });

        if (detalle.length < PAGE_LIMIT_MONETARIA) break;
        offset += PAGE_LIMIT_MONETARIA;
      }
    }
    return puntos;
  });
}

async function getSerieCambiaria(moneda, desde, hasta) {
  const cacheKey = `serie:cambiaria:${moneda}:${desde}:${hasta}`;
  return withCache(cacheKey, SERIES_TTL_MS, async () => {
    const puntos = [];
    for (const ventana of ventanasDeFecha(desde, hasta)) {
      let offset = 0;
      for (let page = 0; page < MAX_PAGES; page++) {
        const json = await bcraGet(`/estadisticascambiarias/v1.0/Cotizaciones/${moneda}`, {
          fechaDesde: ventana.desde,
          fechaHasta: ventana.hasta,
          limit: PAGE_LIMIT_CAMBIARIA,
          offset,
        });
        const dias = json.results || [];
        for (const dia of dias) {
          const detalleMoneda = dia.detalle?.find((x) => x.codigoMoneda === moneda) || dia.detalle?.[0];
          if (detalleMoneda) {
            puntos.push({ fecha: dia.fecha, valor: detalleMoneda.tipoCotizacion });
          }
        }
        if (dias.length < PAGE_LIMIT_CAMBIARIA) break;
        offset += PAGE_LIMIT_CAMBIARIA;
      }
    }
    return puntos;
  });
}
