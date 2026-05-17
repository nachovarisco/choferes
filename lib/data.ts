export type Tone = "slate" | "blue" | "green" | "amber" | "red" | "purple";

export type DriverStatus =
  | "Disponible"
  | "En viaje"
  | "En carga"
  | "Descansando"
  | "No disponible";

export type TripStatus =
  | "Pendiente"
  | "Asignado"
  | "En carga"
  | "En viaje"
  | "Demorado"
  | "Finalizado";

export type UnitStatus = "Operativa" | "En viaje" | "Mantenimiento" | "Bloqueada";

export type DocumentStatus = "Vigente" | "Por vencer" | "Vencido" | "Pendiente";

export type Driver = {
  slug: string;
  name: string;
  initials: string;
  status: DriverStatus;
  category: "Nexo Aberturas" | "Tercero" | "Mixto";
  phone: string;
  dni: string;
  license: string;
  licenseRisk: boolean;
  tripsThisMonth: number;
  punctuality: number;
  incidents: number;
  unitId?: string;
  lastActivity: string;
};

export type Unit = {
  id: string;
  brand: string;
  model: string;
  plate: string;
  status: UnitStatus;
  base: string;
  driverSlug?: string;
  km: number;
  docs: string[];
  technicalNotes: string[];
  serviceDue: string;
  hasRisk: boolean;
};

export type Client = {
  code: string;
  slug: string;
  name: string;
  contact: string;
  phone: string;
  reception: string;
  tripsThisMonth: number;
  status: string;
  requiresTurn: boolean;
  tags: string[];
  requirements: string[];
  delayAverage: string;
  openIncidents: number;
};

export type TripStop = {
  number: number;
  clientSlug: string;
  address: string;
  goods: string;
  status: "Pendiente" | "En camino" | "Entregado" | "No disponible";
  note: string;
  delivered: boolean;
  alert?: string;
  returnInfo?: string;
};

export type Trip = {
  id: string;
  slug: string;
  mainClientSlug: string;
  clientSlugs: string[];
  origin: string;
  destination: string;
  driverSlug: string;
  unitId: string;
  status: TripStatus;
  alert: string;
  date: string;
  assignedCash: number;
  spentCash: number;
  stops: TripStop[];
  timeline: Array<{
    time: string;
    text: string;
    state: "done" | "active" | "pending";
  }>;
};

export type Order = {
  code: string;
  slug: string;
  clientSlug: string;
  load: string;
  origin: string;
  destination: string;
  driverSlug?: string;
  unitId?: string;
  status: "Pendiente" | "Asignada" | "En carga" | "Observada";
  docs: string;
  risk: boolean;
};

export type DocumentRecord = {
  id: string;
  name: string;
  owner: string;
  association: string;
  type: "Chofer" | "Unidad" | "Empresa" | "Cliente" | "Viaje";
  due: string;
  status: DocumentStatus;
  fileUrl?: string;
};

export type Incident = {
  id: string;
  type: "Crítica" | "Alta" | "Media" | "Resuelta";
  title: string;
  detail: string;
  tone: Tone;
};

export type CashMovement = {
  id: string;
  date: string;
  type: "Ingreso" | "Egreso";
  category: string;
  tripSlug: string;
  driverSlug: string;
  unitId: string;
  amount: number;
  status: string;
  risk?: boolean;
};

export type MaintenanceJob = {
  id: string;
  unitId: string;
  issue: string;
  status: "En taller" | "Programado" | "Próximo" | "Bloqueada";
  next: string;
  risk: boolean;
};

export const documentTypes: DocumentRecord["type"][] = [
  "Chofer",
  "Unidad",
  "Empresa",
  "Cliente",
  "Viaje",
];

export const drivers: Driver[] = [
  {
    slug: "juan-perez",
    name: "Juan Pérez",
    initials: "JP",
    status: "En viaje",
    category: "Nexo Aberturas",
    phone: "343 555-1200",
    dni: "32.456.789",
    license: "Licencia vence en 3 días",
    licenseRisk: true,
    tripsThisMonth: 18,
    punctuality: 91,
    incidents: 2,
    unitId: "ab123cd",
    lastActivity: "hace 18 min",
  },
  {
    slug: "luis-gomez",
    name: "Luis Gómez",
    initials: "LG",
    status: "Disponible",
    category: "Tercero",
    phone: "343 555-8831",
    dni: "28.211.902",
    license: "Documentación vigente",
    licenseRisk: false,
    tripsThisMonth: 22,
    punctuality: 96,
    incidents: 0,
    unitId: "ac456ef",
    lastActivity: "hace 45 min",
  },
  {
    slug: "carlos-diaz",
    name: "Carlos Díaz",
    initials: "CD",
    status: "Descansando",
    category: "Mixto",
    phone: "343 555-4490",
    dni: "30.889.411",
    license: "Documentación vigente",
    licenseRisk: false,
    tripsThisMonth: 15,
    punctuality: 93,
    incidents: 1,
    unitId: "ad789gh",
    lastActivity: "ayer",
  },
  {
    slug: "martin-silva",
    name: "Martín Silva",
    initials: "MS",
    status: "En carga",
    category: "Nexo Aberturas",
    phone: "343 555-9912",
    dni: "27.458.109",
    license: "Seguro ART pendiente",
    licenseRisk: true,
    tripsThisMonth: 12,
    punctuality: 88,
    incidents: 3,
    unitId: "ae321jk",
    lastActivity: "hace 8 min",
  },
  {
    slug: "roberto-nunez",
    name: "Roberto Núñez",
    initials: "RN",
    status: "Disponible",
    category: "Mixto",
    phone: "343 555-3321",
    dni: "34.112.776",
    license: "Documentación vigente",
    licenseRisk: false,
    tripsThisMonth: 9,
    punctuality: 94,
    incidents: 0,
    unitId: "af654lm",
    lastActivity: "hace 2 h",
  },
  {
    slug: "diego-fernandez",
    name: "Diego Fernández",
    initials: "DF",
    status: "No disponible",
    category: "Tercero",
    phone: "343 555-7844",
    dni: "29.875.451",
    license: "Licencia vencida",
    licenseRisk: true,
    tripsThisMonth: 4,
    punctuality: 76,
    incidents: 2,
    lastActivity: "hace 3 días",
  },
];

export const units: Unit[] = [
  {
    id: "ab123cd",
    brand: "Volvo",
    model: "370",
    plate: "AB123CD",
    status: "En viaje",
    base: "Paraná",
    driverSlug: "juan-perez",
    km: 482000,
    docs: ["Seguro vigente", "VTV vigente", "Póliza vence en 12 días"],
    technicalNotes: ["Service próximo", "Chequeo de cubiertas delanteras"],
    serviceDue: "8.000 km",
    hasRisk: true,
  },
  {
    id: "ac456ef",
    brand: "Scania",
    model: "360",
    plate: "AC456EF",
    status: "Operativa",
    base: "Rosario",
    driverSlug: "luis-gomez",
    km: 421500,
    docs: ["Seguro vigente", "VTV vigente"],
    technicalNotes: ["Sin observaciones"],
    serviceDue: "18.000 km",
    hasRisk: false,
  },
  {
    id: "ad789gh",
    brand: "Mercedes-Benz",
    model: "1938",
    plate: "AD789GH",
    status: "Mantenimiento",
    base: "Santa Fe",
    driverSlug: "carlos-diaz",
    km: 389200,
    docs: ["Seguro vigente", "VTV vigente"],
    technicalNotes: ["Cambio cubiertas", "Revisión de frenos"],
    serviceDue: "En taller",
    hasRisk: true,
  },
  {
    id: "ae321jk",
    brand: "Iveco",
    model: "Cursor 330",
    plate: "AE321JK",
    status: "Operativa",
    base: "Paraná",
    driverSlug: "martin-silva",
    km: 512800,
    docs: ["Seguro vigente", "VTV vencida"],
    technicalNotes: ["Control documental urgente"],
    serviceDue: "12.000 km",
    hasRisk: true,
  },
  {
    id: "af654lm",
    brand: "Volvo",
    model: "VM 330",
    plate: "AF654LM",
    status: "Operativa",
    base: "Paraná",
    driverSlug: "roberto-nunez",
    km: 358000,
    docs: ["Seguro vence en 20 días", "VTV vigente"],
    technicalNotes: ["Sin observaciones"],
    serviceDue: "22.000 km",
    hasRisk: false,
  },
  {
    id: "ag987no",
    brand: "Mercedes",
    model: "1938",
    plate: "AG987NO",
    status: "Bloqueada",
    base: "Córdoba",
    km: 544300,
    docs: ["Seguro vencido", "Inspección pendiente"],
    technicalNotes: ["Unidad fuera de servicio"],
    serviceDue: "Urgente",
    hasRisk: true,
  },
];

export const clients: Client[] = [
  {
    code: "CLI-0001",
    slug: "easy",
    name: "Easy",
    contact: "Operaciones Buenos Aires",
    phone: "11 5555-1200",
    reception: "08:00 a 16:00",
    tripsThisMonth: 42,
    status: "Requiere turno",
    requiresTurn: true,
    tags: ["Pedir turno", "Documentación previa", "Remito físico"],
    requirements: ["Licencia chofer", "Seguro unidad", "VTV", "ART", "Constancia AFIP"],
    delayAverage: "1h 20m",
    openIncidents: 1,
  },
  {
    code: "CLI-0002",
    slug: "cencosud",
    name: "Cencosud",
    contact: "Logística Regional",
    phone: "341 555-7100",
    reception: "07:00 a 15:00",
    tripsThisMonth: 31,
    status: "Horario estricto",
    requiresTurn: true,
    tags: ["Pedir turno", "Horario estricto", "Avisar antes de llegar"],
    requirements: ["Licencia chofer", "Seguro unidad", "VTV", "Póliza", "DNI chofer"],
    delayAverage: "55m",
    openIncidents: 0,
  },
  {
    code: "CLI-0003",
    slug: "dhinox",
    name: "Dhinox",
    contact: "Depósito Santa Fe",
    phone: "342 555-3340",
    reception: "09:00 a 17:00",
    tripsThisMonth: 18,
    status: "Documentación completa",
    requiresTurn: false,
    tags: ["Remito físico", "Avisar antes de llegar"],
    requirements: ["Remito", "Seguro unidad", "Habilitación unidad"],
    delayAverage: "35m",
    openIncidents: 1,
  },
  {
    code: "CLI-0004",
    slug: "julicroc",
    name: "Julicroc",
    contact: "Administración",
    phone: "11 5555-8830",
    reception: "08:30 a 15:30",
    tripsThisMonth: 15,
    status: "Revisión pendiente",
    requiresTurn: false,
    tags: ["No recibe sin OC", "Remito firmado"],
    requirements: ["Orden de carga", "Remito firmado", "Constancia fiscal"],
    delayAverage: "2h 05m",
    openIncidents: 2,
  },
  {
    code: "CLI-0005",
    slug: "lafedar",
    name: "Lafedar",
    contact: "Planta Paraná",
    phone: "343 555-6621",
    reception: "10:00 a 18:00",
    tripsThisMonth: 9,
    status: "Operativo",
    requiresTurn: false,
    tags: ["Avisar antes de llegar", "Ingreso por portón 2"],
    requirements: ["Remito", "Seguro unidad", "DNI chofer"],
    delayAverage: "20m",
    openIncidents: 0,
  },
];

export const trips: Trip[] = [
  {
    id: "VJ-000124",
    slug: "vj-000124",
    mainClientSlug: "easy",
    clientSlugs: ["easy", "dhinox"],
    origin: "Paraná",
    destination: "Buenos Aires",
    driverSlug: "juan-perez",
    unitId: "ab123cd",
    status: "En viaje",
    alert: "Easy requiere turno",
    date: "16/05/2026",
    assignedCash: 120000,
    spentCash: 96500,
    stops: [
      {
        number: 1,
        clientSlug: "easy",
        address: "Centro de distribución Buenos Aires",
        goods: "Aberturas · 12 bultos",
        status: "Entregado",
        note: "Requiere turno. Remito físico confirmado.",
        delivered: true,
        alert: "Requiere turno",
        returnInfo: "Sin devolución registrada",
      },
      {
        number: 2,
        clientSlug: "dhinox",
        address: "Depósito Zona Sur",
        goods: "Mercadería general · 6 bultos",
        status: "En camino",
        note: "Avisar 30 minutos antes de llegar.",
        delivered: false,
        returnInfo: "Pendiente de entrega",
      },
    ],
    timeline: [
      { time: "08:00", text: "Viaje asignado a Juan Pérez", state: "done" },
      { time: "09:15", text: "Unidad cargada en Paraná", state: "done" },
      { time: "10:05", text: "Salida a ruta", state: "done" },
      { time: "15:40", text: "Entrega Easy completada", state: "done" },
      { time: "Ahora", text: "En camino a Dhinox", state: "active" },
    ],
  },
  {
    id: "VJ-000125",
    slug: "vj-000125",
    mainClientSlug: "cencosud",
    clientSlugs: ["cencosud"],
    origin: "Rosario",
    destination: "Córdoba",
    driverSlug: "luis-gomez",
    unitId: "ac456ef",
    status: "En carga",
    alert: "Documentación pendiente",
    date: "16/05/2026",
    assignedCash: 90000,
    spentCash: 104800,
    stops: [
      {
        number: 1,
        clientSlug: "cencosud",
        address: "Centro regional Córdoba",
        goods: "Palletizado · 10 pallets",
        status: "Pendiente",
        note: "Revisar VTV antes de salir.",
        delivered: false,
        alert: "Falta comprobante",
      },
    ],
    timeline: [
      { time: "09:00", text: "Orden asignada", state: "done" },
      { time: "10:30", text: "En carga", state: "active" },
    ],
  },
  {
    id: "VJ-000126",
    slug: "vj-000126",
    mainClientSlug: "dhinox",
    clientSlugs: ["dhinox", "julicroc", "lafedar"],
    origin: "Santa Fe",
    destination: "Mendoza",
    driverSlug: "carlos-diaz",
    unitId: "ad789gh",
    status: "Asignado",
    alert: "Sin alertas",
    date: "17/05/2026",
    assignedCash: 150000,
    spentCash: 132000,
    stops: [
      {
        number: 1,
        clientSlug: "dhinox",
        address: "Depósito Santa Fe",
        goods: "Acero inoxidable · 6 bultos",
        status: "Pendiente",
        note: "Cargar remitos al salir.",
        delivered: false,
      },
      {
        number: 2,
        clientSlug: "julicroc",
        address: "Planta Mendoza",
        goods: "Mercadería general",
        status: "Pendiente",
        note: "No recibe sin OC.",
        delivered: false,
      },
      {
        number: 3,
        clientSlug: "lafedar",
        address: "Base Mendoza",
        goods: "Farmacéutica · 4 pallets",
        status: "Pendiente",
        note: "Ingreso por portón 2.",
        delivered: false,
      },
    ],
    timeline: [{ time: "Programado", text: "Sale mañana a primera hora", state: "pending" }],
  },
  {
    id: "VJ-000127",
    slug: "vj-000127",
    mainClientSlug: "julicroc",
    clientSlugs: ["julicroc"],
    origin: "Buenos Aires",
    destination: "Neuquén",
    driverSlug: "martin-silva",
    unitId: "ae321jk",
    status: "Demorado",
    alert: "Demora de 4 horas",
    date: "16/05/2026",
    assignedCash: 130000,
    spentCash: 128400,
    stops: [
      {
        number: 1,
        clientSlug: "julicroc",
        address: "Centro Neuquén",
        goods: "Mercadería general",
        status: "En camino",
        note: "Confirmar remito firmado.",
        delivered: false,
        alert: "Demorado",
      },
    ],
    timeline: [
      { time: "07:45", text: "Salida a ruta", state: "done" },
      { time: "Ahora", text: "Demorado por descarga previa", state: "active" },
    ],
  },
];

export const orders: Order[] = [
  {
    code: "OC-000341",
    slug: "oc-000341",
    clientSlug: "easy",
    load: "Aberturas · 18 bultos",
    origin: "Paraná",
    destination: "Buenos Aires",
    driverSlug: "juan-perez",
    unitId: "ab123cd",
    status: "Asignada",
    docs: "Documentación completa",
    risk: false,
  },
  {
    code: "OC-000342",
    slug: "oc-000342",
    clientSlug: "cencosud",
    load: "Palletizado · 10 pallets",
    origin: "Rosario",
    destination: "Córdoba",
    driverSlug: "luis-gomez",
    unitId: "ac456ef",
    status: "En carga",
    docs: "Falta VTV actualizada",
    risk: true,
  },
  {
    code: "OC-000343",
    slug: "oc-000343",
    clientSlug: "dhinox",
    load: "Acero inoxidable · 6 bultos",
    origin: "Santa Fe",
    destination: "Mendoza",
    status: "Pendiente",
    docs: "Pendiente asignación",
    risk: false,
  },
  {
    code: "OC-000344",
    slug: "oc-000344",
    clientSlug: "julicroc",
    load: "Mercadería general",
    origin: "Buenos Aires",
    destination: "Neuquén",
    driverSlug: "martin-silva",
    unitId: "ae321jk",
    status: "Observada",
    docs: "VTV vencida",
    risk: true,
  },
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-lic-juan",
    name: "Licencia Profesional",
    owner: "Juan Pérez",
    association: "Chofer",
    type: "Chofer",
    due: "19/05/2026",
    status: "Por vencer",
  },
  {
    id: "doc-seguro-ab123cd",
    name: "Seguro Unidad",
    owner: "AB123CD",
    association: "Unidad",
    type: "Unidad",
    due: "12/09/2026",
    status: "Vigente",
  },
  {
    id: "doc-vtv-ae321jk",
    name: "VTV",
    owner: "AE321JK",
    association: "Unidad",
    type: "Unidad",
    due: "01/04/2026",
    status: "Vencido",
  },
  {
    id: "doc-art-martin",
    name: "ART",
    owner: "Martín Silva",
    association: "Chofer",
    type: "Chofer",
    due: "-",
    status: "Pendiente",
  },
  {
    id: "doc-afip-nexo",
    name: "Constancia AFIP",
    owner: "Transporte Nexo",
    association: "Empresa",
    type: "Empresa",
    due: "31/12/2026",
    status: "Vigente",
  },
  {
    id: "doc-remito-vj-000124",
    name: "Remito firmado",
    owner: "VJ-000124 · Easy",
    association: "Viaje + Cliente",
    type: "Viaje",
    due: "-",
    status: "Pendiente",
  },
  {
    id: "doc-requisito-easy",
    name: "Constancia fiscal cliente",
    owner: "Easy",
    association: "Cliente",
    type: "Cliente",
    due: "30/06/2026",
    status: "Vigente",
  },
];

export const incidents: Incident[] = [
  {
    id: "inc-vtv-ae321jk",
    type: "Crítica",
    title: "VTV vencida en unidad AE321JK",
    detail: "Camión asignado a Martín Silva.",
    tone: "red",
  },
  {
    id: "inc-easy-demora",
    type: "Alta",
    title: "Viaje Easy con demora de 4 horas",
    detail: "Paraná → Buenos Aires · Chofer Juan Pérez",
    tone: "amber",
  },
  {
    id: "inc-lic-juan",
    type: "Media",
    title: "Licencia de Juan Pérez vence en 3 días",
    detail: "Renovar documentación personal.",
    tone: "blue",
  },
  {
    id: "inc-seguro-ag987no",
    type: "Alta",
    title: "Seguro unidad AG987NO vencido",
    detail: "Unidad fuera de servicio.",
    tone: "red",
  },
  {
    id: "inc-remito-dhinox",
    type: "Resuelta",
    title: "Remito faltante cargado correctamente",
    detail: "Cliente Dhinox.",
    tone: "green",
  },
];

export const cashMovements: CashMovement[] = [
  {
    id: "mov-1",
    date: "16/05/2026",
    type: "Egreso",
    category: "Peaje",
    tripSlug: "vj-000124",
    driverSlug: "juan-perez",
    unitId: "ab123cd",
    amount: -18500,
    status: "Rendido",
  },
  {
    id: "mov-2",
    date: "16/05/2026",
    type: "Egreso",
    category: "Combustible",
    tripSlug: "vj-000124",
    driverSlug: "juan-perez",
    unitId: "ab123cd",
    amount: -62000,
    status: "Rendido",
  },
  {
    id: "mov-3",
    date: "16/05/2026",
    type: "Egreso",
    category: "Gomería",
    tripSlug: "vj-000125",
    driverSlug: "luis-gomez",
    unitId: "ac456ef",
    amount: -82000,
    status: "Falta comprobante",
    risk: true,
  },
  {
    id: "mov-4",
    date: "15/05/2026",
    type: "Ingreso",
    category: "Asignación a chofer",
    tripSlug: "vj-000126",
    driverSlug: "carlos-diaz",
    unitId: "ad789gh",
    amount: 150000,
    status: "Asignado",
  },
];

export const maintenanceJobs: MaintenanceJob[] = [
  {
    id: "mnt-ae321jk",
    unitId: "ae321jk",
    issue: "Reparación de motor",
    status: "En taller",
    next: "Sin fecha estimada",
    risk: true,
  },
  {
    id: "mnt-ab123cd",
    unitId: "ab123cd",
    issue: "Cambio de aceite y filtros",
    status: "Programado",
    next: "28/05/2026",
    risk: false,
  },
  {
    id: "mnt-ac456ef",
    unitId: "ac456ef",
    issue: "Revisión de frenos",
    status: "Próximo",
    next: "02/06/2026",
    risk: false,
  },
  {
    id: "mnt-ag987no",
    unitId: "ag987no",
    issue: "Seguro vencido + inspección",
    status: "Bloqueada",
    next: "Urgente",
    risk: true,
  },
];

export function money(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("es-AR")}`;
}

export function findDriver(slug: string) {
  return drivers.find((driver) => driver.slug === slug);
}

export function findUnit(id: string) {
  return units.find((unit) => unit.id === id.toLowerCase());
}

export function findClient(slug: string) {
  return clients.find((client) => client.slug === slug);
}

export function findTrip(slug: string) {
  return trips.find((trip) => trip.slug === slug.toLowerCase());
}

export function findOrder(slug: string) {
  const normalized = slug.toLowerCase();
  return orders.find((order) => order.slug === normalized || order.code.toLowerCase() === normalized);
}

export function findIncident(id: string) {
  return incidents.find((incident) => incident.id === id);
}

export function getDriverTrips(slug: string) {
  return trips.filter((trip) => trip.driverSlug === slug);
}

export function getUnitTrips(id: string) {
  return trips.filter((trip) => trip.unitId === id.toLowerCase());
}

export function getClientTrips(slug: string) {
  return trips.filter((trip) => trip.clientSlugs.includes(slug));
}

export function clientNames(slugs: string[]) {
  return slugs.map((slug) => findClient(slug)?.name ?? slug).join(" + ");
}

export function tripRoute(trip: Trip) {
  return `${trip.origin} → ${trip.destination}`;
}

export function statusTone(status: string): Tone {
  if (["Crítica", "Alta", "Vencido", "Bloqueada", "Mantenimiento", "Demorado"].includes(status)) {
    return "red";
  }

  if (["En carga", "Por vencer", "Observada", "Próximo", "Programado"].includes(status)) {
    return "amber";
  }

  if (["Disponible", "Operativa", "Vigente", "Entregado", "Finalizado", "Resuelta"].includes(status)) {
    return "green";
  }

  if (["En viaje", "Asignado", "Asignada", "Pendiente"].includes(status)) {
    return "blue";
  }

  return "slate";
}
