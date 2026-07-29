import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const fmtNumero = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmtFecha(fechaISO) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-fecha">{fmtFecha(label)}</div>
      <div className="chart-tooltip-valor">{fmtNumero.format(payload[0].value)}</div>
    </div>
  );
}

export default function SeriesChart({ puntos, loading, error, indicador, frecuencia }) {
  if (error) {
    return <div className="chart-state chart-state-error">⚠ {error}</div>;
  }

  if (loading) {
    return <div className="chart-state">Consultando al BCRA…</div>;
  }

  if (!puntos || puntos.length === 0) {
    return (
      <div className="chart-state">
        Elegí un indicador y un rango de fechas, y tocá "Actualizar" para ver el gráfico.
      </div>
    );
  }

  const valores = puntos.map((p) => p.valor);
  const ultimo = puntos[puntos.length - 1];
  const primero = puntos[0];
  const variacion = ((ultimo.valor - primero.valor) / primero.valor) * 100;
  const min = Math.min(...valores);
  const max = Math.max(...valores);

  return (
    <div className="chart-wrap">
      <div className="ticker-row">
        <div className="ticker-main">
          <span className="ticker-label">{indicador}</span>
          <span className="ticker-dot" aria-hidden="true" />
        </div>
        <div className="ticker-value">{fmtNumero.format(ultimo.valor)}</div>
        <div className={`ticker-delta ${variacion >= 0 ? "is-up" : "is-down"}`}>
          {variacion >= 0 ? "▲" : "▼"} {fmtNumero.format(Math.abs(variacion))}% en el período
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={puntos} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillSerie" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="fecha"
            tickFormatter={fmtFecha}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            minTickGap={40}
          />
          <YAxis
            domain={["auto", "auto"]}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            width={60}
            tickFormatter={(v) => fmtNumero.format(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#fillSerie)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="stats-row">
        <Stat label="Mínimo" value={fmtNumero.format(min)} />
        <Stat label="Máximo" value={fmtNumero.format(max)} />
        <Stat label="Puntos" value={puntos.length} />
        <Stat label="Frecuencia" value={frecuencia} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
