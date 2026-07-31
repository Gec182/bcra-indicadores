const DESTACADOS = [
  {
    tipo: "cambiaria",
    moneda: "USD",
    descripcion: 'Tipo de cambio de referencia (Com. "A" 3500) - USD',
    label: "USD",
  },
  {
    tipo: "cambiaria",
    moneda: "EUR",
    descripcion: "Tipo de cambio de referencia - EUR",
    label: "EUR",
  },
  {
    tipo: "cambiaria",
    moneda: "BRL",
    descripcion: "Tipo de cambio de referencia - BRL",
    label: "BRL",
  },
  {
    tipo: "monetaria",
    id: 1,
    descripcion: "Reservas internacionales",
    label: "Reservas",
  },
  {
    tipo: "monetaria",
    id: 109,
    descripcion: "M2",
    label: "M2",
  },
  {
    tipo: "monetaria",
    id: 882,
    descripcion: "Préstamos totales al sector privado no financiero (moneda nacional y extranjera)",
    label: "Préstamos $+US$",
  },
  {
    tipo: "monetaria",
    id: 893,
    descripcion: "Préstamos totales al sector privado no financiero (moneda nacional)",
    label: "Préstamos $",
  },
  {
    tipo: "monetaria",
    id: 904,
    descripcion: "Préstamos totales al sector privado no financiero (moneda extranjera)",
    label: "Préstamos US$",
  },
  {
    tipo: "monetaria",
    id: 981,
    descripcion: "Depósitos totales del sector privado no financiero (moneda nacional y extranjera)",
    label: "Depósitos $+US$",
  },
  {
    tipo: "monetaria",
    id: 992,
    descripcion: "Depósitos totales del sector privado no financiero (moneda nacional)",
    label: "Depósitos $",
  },
  {
    tipo: "monetaria",
    id: 1003,
    descripcion: "Depósitos totales del sector privado no financiero (moneda extranjera)",
    label: "Depósitos US$",
  },
];

export default function handler(req, res) {
  res.status(200).json(DESTACADOS);
}
