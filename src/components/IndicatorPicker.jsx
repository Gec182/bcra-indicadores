import { useEffect, useRef, useState } from "react";
import { getDestacados, searchMonetarias } from "../api.js";

export default function IndicatorPicker({ value, onSelect }) {
  const [destacados, setDestacados] = useState([]);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    getDestacados().then(setDestacados).catch(() => setDestacados([]));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMonetarias(query);
        setResultados(data);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function elegirDestacado(d) {
    onSelect({ tipo: "cambiaria", moneda: d.moneda, descripcion: d.descripcion });
    setAbierto(false);
    setQuery("");
  }

  function elegirMonetaria(v) {
    onSelect({ tipo: "monetaria", id: v.idVariable, descripcion: v.descripcion });
    setAbierto(false);
    setQuery("");
  }

  return (
    <div className="field-group indicator-picker">
      <label className="field-label">Indicador</label>

      <button
        type="button"
        className="indicator-current"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="indicator-current-text">
          {value?.descripcion || "Elegí un indicador…"}
        </span>
        <span className="indicator-current-caret">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="indicator-dropdown">
          <div className="indicator-chip-row">
            {destacados.map((d) => (
              <button
                key={d.moneda}
                type="button"
                className="preset-chip"
                onClick={() => elegirDestacado(d)}
              >
                {d.moneda}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="indicator-search"
            placeholder="Buscar en variables monetarias del BCRA (reservas, tasas, base monetaria…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="indicator-results">
            {buscando && <div className="indicator-hint">Buscando…</div>}
            {!buscando && query && resultados.length === 0 && (
              <div className="indicator-hint">Sin resultados para "{query}"</div>
            )}
            {resultados.map((r) => (
              <button
                key={r.idVariable}
                type="button"
                className="indicator-result-item"
                onClick={() => elegirMonetaria(r)}
              >
                <span>{r.descripcion}</span>
                <span className="indicator-result-meta">{r.periodicidad}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
