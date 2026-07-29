import { useState } from "react";
import IndicatorPicker from "./components/IndicatorPicker.jsx";
import DateRangePicker from "./components/DateRangePicker.jsx";
import FrequencySelector from "./components/FrequencySelector.jsx";
import SeriesChart from "./components/SeriesChart.jsx";
import { getSerie } from "./api.js";
import "./App.css";

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function fechaHaceMeses(meses) {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return toISODate(d);
}

const INDICADOR_INICIAL = {
  tipo: "cambiaria",
  moneda: "USD",
  descripcion: 'Tipo de cambio de referencia (Com. "A" 3500) - USD',
};

export default function App() {
  const [indicador, setIndicador] = useState(INDICADOR_INICIAL);
  const [rango, setRango] = useState({ desde: fechaHaceMeses(36), hasta: toISODate(new Date()) });
  const [frecuencia, setFrecuencia] = useState("diaria");
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [huboConsulta, setHuboConsulta] = useState(false);

  async function actualizar() {
    setLoading(true);
    setError(null);
    setHuboConsulta(true);
    try {
      const data = await getSerie({
        tipo: indicador.tipo,
        id: indicador.id,
        moneda: indicador.moneda,
        desde: rango.desde,
        hasta: rango.hasta,
        frecuencia,
      });
      setPuntos(data.puntos);
    } catch (e) {
      setError(e.message);
      setPuntos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-mark">BCRA</span>
          <span className="app-header-sep">/</span>
          <span>Indicadores</span>
        </div>
        <span className="app-header-sub">series públicas del Banco Central de la República Argentina</span>
      </header>

      <main className="app-main">
        <aside className="controls-panel">
          <IndicatorPicker value={indicador} onSelect={setIndicador} />
          <DateRangePicker desde={rango.desde} hasta={rango.hasta} onChange={setRango} />
          <FrequencySelector value={frecuencia} onChange={setFrecuencia} />

          <button type="button" className="btn-actualizar" onClick={actualizar} disabled={loading}>
            {loading ? "Consultando…" : "Actualizar"}
          </button>
        </aside>

        <section className="chart-panel">
          <SeriesChart
            puntos={puntos}
            loading={loading}
            error={error}
            indicador={indicador?.descripcion}
            frecuencia={frecuencia}
          />
          {!huboConsulta && (
            <p className="chart-panel-hint">
              Ya está cargado el tipo de cambio A3500 de los últimos 3 años — tocá "Actualizar" para traerlo.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
