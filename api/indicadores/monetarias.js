import { bcraGet } from "../lib/bcraClient.js";
import { withCache } from "../lib/cache.js";

const CATALOG_TTL_MS = 60 * 60 * 1000;

export default async function handler(req, res) {
  try {
    const search = (req.query.search || "").toString().trim().toLowerCase();

    const data = await withCache("catalogo:monetarias", CATALOG_TTL_MS, async () => {
      const json = await bcraGet("/estadisticas/v4.0/Monetarias");
      return json.results || [];
    });

    const filtrado = search
      ? data.filter((v) => v.descripcion?.toLowerCase().includes(search))
      : data;

    res.status(200).json(filtrado.slice(0, 100));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}
