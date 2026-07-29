const DESTACADOS = [
  {
    tipo: "cambiaria",
    moneda: "USD",
    descripcion: 'Tipo de cambio de referencia (Com. "A" 3500) - USD',
  },
  {
    tipo: "cambiaria",
    moneda: "EUR",
    descripcion: "Tipo de cambio de referencia - EUR",
  },
  {
    tipo: "cambiaria",
    moneda: "BRL",
    descripcion: "Tipo de cambio de referencia - BRL",
  },
];

export default function handler(req, res) {
  res.status(200).json(DESTACADOS);
}
