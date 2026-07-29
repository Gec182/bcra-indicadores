import { bcraGet } from "../lib/bcraClient.js";
import { withCache } from "../lib/cache.js";

const CATALOG_TTL_MS = 60 * 60 * 1000;

export default async function handler(_req, res) {
  try {
    const data = await withCache("catalogo:divisas", CATALOG_TTL_MS, async () => {
      const json = await bcraGet("/estadisticascambiarias/v1.0/Maestros/Divisas");
      return json.results || [];
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Error interno" });
  }
}
