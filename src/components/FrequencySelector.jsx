const OPCIONES = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
];

export default function FrequencySelector({ value, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">Frecuencia</label>
      <div className="segmented" role="tablist" aria-label="Frecuencia de la serie">
        {OPCIONES.map((op) => (
          <button
            key={op.value}
            type="button"
            role="tab"
            aria-selected={value === op.value}
            className={`segmented-btn ${value === op.value ? "is-active" : ""}`}
            onClick={() => onChange(op.value)}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
