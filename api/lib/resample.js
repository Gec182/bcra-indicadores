/**
 * Dado un array de puntos { fecha: "YYYY-MM-DD", valor: number } ordenado o no,
 * lo agrupa por período (semana ISO o mes) y devuelve, por período, el último
 * valor informado dentro de ese período (criterio estándar para series
 * financieras: el cierre del período).
 */
export function resample(series, frecuencia) {
  const puntos = [...series].sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (frecuencia === "diaria" || !frecuencia) {
    return puntos;
  }

  const keyFn = frecuencia === "mensual" ? monthKey : weekKey;

  const porPeriodo = new Map();
  for (const punto of puntos) {
    const key = keyFn(punto.fecha);
    // Como puntos está ordenado ascendente, el último que pisa cada key
    // termina siendo el más reciente del período.
    porPeriodo.set(key, punto);
  }

  return [...porPeriodo.values()];
}

function monthKey(fechaISO) {
  return fechaISO.slice(0, 7); // "YYYY-MM"
}

function weekKey(fechaISO) {
  const d = new Date(fechaISO + "T00:00:00Z");
  // ISO week: lunes = inicio de semana
  const dayNum = (d.getUTCDay() + 6) % 7; // 0 = lunes ... 6 = domingo
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - dayNum);
  return monday.toISOString().slice(0, 10); // "YYYY-MM-DD" del lunes de esa semana
}
