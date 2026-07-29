const PRESETS = [
  { label: "6M", meses: 6 },
  { label: "1A", meses: 12 },
  { label: "3A", meses: 36 },
  { label: "5A", meses: 60 },
  { label: "Todo", meses: null },
];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function fechaDesdeMeses(meses) {
  if (meses === null) return "2000-01-01"; // "todo": tope razonable hacia atrás
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return toISODate(d);
}

export default function DateRangePicker({ desde, hasta, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">Rango de fechas</label>

      <div className="preset-row">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="preset-chip"
            onClick={() =>
              onChange({ desde: fechaDesdeMeses(p.meses), hasta: toISODate(new Date()) })
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="date-inputs">
        <input
          type="date"
          value={desde}
          max={hasta}
          onChange={(e) => onChange({ desde: e.target.value, hasta })}
        />
        <span className="date-sep">→</span>
        <input
          type="date"
          value={hasta}
          min={desde}
          max={toISODate(new Date())}
          onChange={(e) => onChange({ desde, hasta: e.target.value })}
        />
      </div>
    </div>
  );
}
