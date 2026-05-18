import type {
  CashMovement,
  Client,
  DocumentRecord,
  Driver,
  Incident,
  Tone,
  Trip,
  TripStatus,
  Unit,
} from "@/lib/data";
import type { LiveData } from "@/lib/live-data";

export const demoDataEvent = "nexo-demo-data-updated";
export const demoDataStorageKey = "nexo-demo-v1";

export type DemoSnapshot = {
  version: 1;
  liveData: LiveData;
  updatedAt: string;
  events: string[];
};

export function readDemoSnapshot(): DemoSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(demoDataStorageKey);
    return raw ? (JSON.parse(raw) as DemoSnapshot) : null;
  } catch {
    return null;
  }
}

export function getDemoLiveData(base: LiveData): LiveData {
  return readDemoSnapshot()?.liveData ?? base;
}

export function saveDemoLiveData(liveData: LiveData, event: string) {
  if (typeof window === "undefined") {
    return;
  }

  const previous = readDemoSnapshot();
  const snapshot: DemoSnapshot = {
    version: 1,
    liveData,
    updatedAt: new Date().toISOString(),
    events: [`${timeLabel()} - ${event}`, ...(previous?.events ?? [])].slice(0, 40),
  };

  window.localStorage.setItem(demoDataStorageKey, JSON.stringify(snapshot));
  window.dispatchEvent(new Event(demoDataEvent));
}

export function clearDemoLiveData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(demoDataStorageKey);
  window.dispatchEvent(new Event(demoDataEvent));
}

export function demoSummary() {
  const snapshot = readDemoSnapshot();

  if (!snapshot) {
    return null;
  }

  const data = snapshot.liveData;

  return {
    updatedAt: snapshot.updatedAt,
    events: snapshot.events,
    totals: {
      clients: data.clients.length,
      drivers: data.drivers.length,
      units: data.units.length,
      trips: data.trips.length,
      documents: data.documents.length,
      movements: data.cashMovements.length,
      incidents: data.incidents.length,
    },
  };
}

export function addDemoClient(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const name = value(formData, "name");
  const code = normalizeClientCode(value(formData, "code")) || nextClientCode(data.clients);
  const requiresTurn = isTruthy(value(formData, "requiresTurn"));
  const notes = value(formData, "notes");
  const documentation = value(formData, "documentation");
  const slug = uniqueSlug(slugify(name), data.clients.map((client) => client.slug));
  const client: Client = {
    code,
    slug,
    name,
    contact: value(formData, "contact"),
    phone: value(formData, "phone"),
    reception: value(formData, "reception"),
    tripsThisMonth: 0,
    status: requiresTurn ? "Requiere turno" : "Operativo",
    requiresTurn,
    tags: notes ? [notes] : [requiresTurn ? "Requiere turno previo" : "Sin restricciones criticas"],
    requirements: documentation === "Completa"
      ? ["Licencia chofer", "Seguro unidad", "VTV", "ART", "Constancia AFIP"]
      : ["Remito", "Seguro unidad"],
    delayAverage: "0m",
    openIncidents: 0,
  };

  return {
    data: { ...data, clients: [client, ...data.clients.filter((item) => item.code !== code && item.slug !== slug)] },
    label: `Cliente ${client.code} creado en demo`,
  };
}

export function addDemoDriver(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const name = value(formData, "name");
  const slug = uniqueSlug(slugify(name), data.drivers.map((driver) => driver.slug));
  const unitPlate = value(formData, "unitPlate");
  const unit = data.units.find((item) => item.plate === unitPlate);
  const licenseDue = value(formData, "licenseDue");
  const driver: Driver = {
    slug,
    name,
    initials: initials(name),
    status: "Disponible",
    category: categoryValue(value(formData, "category")),
    phone: value(formData, "phone"),
    dni: value(formData, "dni"),
    license: licenseDue ? `Licencia vence ${formatInputDate(licenseDue)}` : "Documentacion pendiente de verificar",
    licenseRisk: Boolean(licenseDue && daysUntil(licenseDue) <= 30),
    tripsThisMonth: 0,
    punctuality: 100,
    incidents: 0,
    unitId: unit?.id,
    lastActivity: "Alta demo",
  };

  return {
    data: { ...data, drivers: [driver, ...data.drivers.filter((item) => item.slug !== slug)] },
    label: `Chofer ${driver.name} creado en demo`,
  };
}

export function addDemoUnit(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const plate = value(formData, "plate").toUpperCase();
  const id = uniqueSlug(plate.toLowerCase(), data.units.map((unit) => unit.id));
  const insuranceDue = value(formData, "insuranceDue");
  const vtvDue = value(formData, "vtvDue");
  const docs = [
    insuranceDue ? `Seguro vence ${formatInputDate(insuranceDue)}` : "Seguro pendiente",
    vtvDue ? `VTV vence ${formatInputDate(vtvDue)}` : "VTV pendiente",
  ];
  const hasRisk = [insuranceDue, vtvDue].some((date) => date && daysUntil(date) <= 30);
  const unit: Unit = {
    id,
    brand: value(formData, "brand"),
    model: value(formData, "model"),
    plate,
    status: "Operativa",
    base: value(formData, "base"),
    km: Number(value(formData, "km") || 0),
    docs,
    technicalNotes: [`Tipo: ${value(formData, "type") || "Camion"}`],
    serviceDue: "Control inicial pendiente",
    hasRisk,
  };

  return {
    data: { ...data, units: [unit, ...data.units.filter((item) => item.plate !== plate && item.id !== id)] },
    label: `Unidad ${unit.plate} creada en demo`,
  };
}

export function addDemoTrip(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const codeNumber = data.trips.length + 1;
  const id = `VJ-DEMO-${String(codeNumber).padStart(3, "0")}`;
  const slug = uniqueSlug(slugify(id), data.trips.map((trip) => trip.slug));
  const clientCodes = formData.getAll("stopClientCode").map((item) => String(item));
  const selectedClients = clientCodes
    .map((code) => findClientByCode(data.clients, code))
    .filter(Boolean) as Client[];
  const clientSlugs = uniqueValues(selectedClients.map((client) => client.slug));
  const fallbackClientSlug = clientSlugs[0] ?? data.clients[0]?.slug ?? "sin-cliente";
  const addresses = values(formData, "stopAddress");
  const contacts = values(formData, "stopContact");
  const receptions = values(formData, "stopReception");
  const goods = values(formData, "stopGoods");
  const statuses = values(formData, "stopInitialStatus");
  const notes = values(formData, "stopNote");
  const turnStatuses = values(formData, "stopTurnStatus");
  const stops = clientCodes.map((code, index) => {
    const client = findClientByCode(data.clients, code);
    const status = stopStatus(statuses[index]);

    return {
      number: index + 1,
      clientSlug: client?.slug ?? fallbackClientSlug,
      clientCode: client?.code ?? normalizeClientCode(code),
      clientName: client?.name ?? normalizeClientCode(code),
      contact: contacts[index] || client?.contact,
      reception: receptions[index] || client?.reception,
      requiresTurn: client?.requiresTurn ?? turnStatuses[index]?.includes("Requiere"),
      turnStatus: turnStatuses[index] || "No requiere turno",
      address: addresses[index] || value(formData, "destination"),
      goods: goods[index] || "Mercaderia sin detalle",
      status,
      note: notes[index] || "",
      delivered: status === "Entregado",
      alert: client?.requiresTurn ? "Requiere turno" : undefined,
    };
  });
  const status = tripStatus(value(formData, "status"));
  const assignedCash = Number(value(formData, "assignedCash") || 0);
  const trip: Trip = {
    id,
    slug,
    mainClientSlug: fallbackClientSlug,
    clientSlugs: clientSlugs.length > 0 ? clientSlugs : [fallbackClientSlug],
    origin: value(formData, "origin"),
    destination: value(formData, "destination"),
    driverSlug: cleanAssignment(value(formData, "driverSlug")),
    unitId: cleanAssignment(value(formData, "unitId")),
    status,
    alert: value(formData, "alert") || "Sin alertas",
    date: value(formData, "date") || new Date().toISOString().slice(0, 10),
    assignedCash,
    spentCash: 0,
    stops,
    timeline: [
      { time: timeLabel(), text: "Viaje creado en modo demo.", state: "done" },
      { time: "Pendiente", text: "Esperando confirmacion operativa.", state: status === "Pendiente" ? "active" : "pending" },
      { time: "Pendiente", text: "Portal Chofer listo para simular estados.", state: "pending" },
    ],
  };

  const updatedClients = data.clients.map((client) =>
    trip.clientSlugs.includes(client.slug)
      ? { ...client, tripsThisMonth: client.tripsThisMonth + 1 }
      : client,
  );

  return {
    data: { ...data, clients: updatedClients, trips: [trip, ...data.trips] },
    label: `Viaje ${trip.id} creado en demo`,
  };
}

export function addDemoDocument(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const due = value(formData, "due");
  const file = formData.get("file");
  const fileName = file instanceof File && file.name ? file.name : "";
  const document: DocumentRecord = {
    id: `DOC-DEMO-${String(data.documents.length + 1).padStart(3, "0")}`,
    name: value(formData, "name"),
    owner: value(formData, "owner"),
    association: value(formData, "association"),
    type: documentType(value(formData, "category")),
    due: due ? formatInputDate(due) : "Sin vencimiento",
    status: documentStatus(due),
    fileUrl: fileName ? `#${encodeURIComponent(fileName)}` : undefined,
  };

  return {
    data: { ...data, documents: [document, ...data.documents] },
    label: `Documento ${document.id} cargado en demo`,
  };
}

export function addDemoCashMovement(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const tripCode = value(formData, "tripCode");
  const trip = data.trips.find((item) => item.id === tripCode || item.slug === tripCode);
  const rawAmount = Number(value(formData, "amount") || 0);
  const type = value(formData, "type") === "Ingreso" ? "Ingreso" : "Egreso";
  const amount = type === "Ingreso" ? Math.abs(rawAmount) : -Math.abs(rawAmount);
  const movement: CashMovement = {
    id: `MOV-DEMO-${String(data.cashMovements.length + 1).padStart(3, "0")}`,
    date: formatInputDate(value(formData, "date")) || new Date().toLocaleDateString("es-AR"),
    type,
    category: value(formData, "category"),
    tripSlug: trip?.slug ?? "",
    driverSlug: trip?.driverSlug ?? data.drivers[0]?.slug ?? "",
    unitId: trip?.unitId ?? data.units[0]?.id ?? "",
    amount,
    status: value(formData, "status"),
    risk: value(formData, "status").toLowerCase().includes("falta"),
  };
  const trips = trip
    ? data.trips.map((item) =>
        item.slug === trip.slug
          ? {
              ...item,
              assignedCash: type === "Ingreso" ? item.assignedCash + Math.abs(amount) : item.assignedCash,
              spentCash: type === "Egreso" ? item.spentCash + Math.abs(amount) : item.spentCash,
            }
          : item,
      )
    : data.trips;

  return {
    data: { ...data, cashMovements: [movement, ...data.cashMovements], trips },
    label: `Movimiento ${movement.id} registrado en demo`,
  };
}

export function addDemoIncident(data: LiveData, formData: FormData): { data: LiveData; label: string } {
  const priority = value(formData, "priority") || "Media";
  const incident: Incident = {
    id: `INC-DEMO-${String(data.incidents.length + 1).padStart(3, "0")}`,
    type: incidentType(priority),
    title: value(formData, "title"),
    detail: `${value(formData, "owner") || "Operacion general"} - ${value(formData, "detail")}`,
    tone: incidentTone(priority),
  };

  return {
    data: { ...data, incidents: [incident, ...data.incidents] },
    label: `Incidencia ${incident.id} creada en demo`,
  };
}

export function updateTripStatus(data: LiveData, tripSlug: string, status: TripStatus): LiveData {
  return {
    ...data,
    trips: data.trips.map((trip) =>
      trip.slug === tripSlug
        ? {
            ...trip,
            status,
            timeline: [
              { time: timeLabel(), text: `Estado actualizado a ${status} desde demo.`, state: "done" },
              ...trip.timeline,
            ],
          }
        : trip,
    ),
  };
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function values(formData: FormData, name: string) {
  return formData.getAll(name).map((item) => String(item).trim());
}

function timeLabel() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "demo";
}

function uniqueSlug(base: string, used: string[]) {
  let next = base || "demo";
  let index = 2;

  while (used.includes(next)) {
    next = `${base}-${index}`;
    index += 1;
  }

  return next;
}

function uniqueValues(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function normalizeClientCode(raw: string) {
  const trimmed = raw.trim().toUpperCase();

  if (!trimmed) {
    return "";
  }

  if (/^\d+$/.test(trimmed)) {
    return `CLI-${trimmed.padStart(4, "0")}`;
  }

  return trimmed.replace(/\s+/g, "-");
}

function nextClientCode(clients: Client[]) {
  let number = clients.length + 1;
  let code = `CLI-${String(number).padStart(4, "0")}`;
  const used = new Set(clients.map((client) => normalizeClientCode(client.code)));

  while (used.has(code)) {
    number += 1;
    code = `CLI-${String(number).padStart(4, "0")}`;
  }

  return code;
}

function findClientByCode(clients: Client[], code: string) {
  const normalized = normalizeClientCode(code);
  return clients.find((client) => normalizeClientCode(client.code) === normalized || client.slug === code.trim().toLowerCase());
}

function isTruthy(input: string) {
  const value = input.toLowerCase();
  return value === "si" || value === "sí" || value === "sÃ­" || value === "true" || value === "1";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CH";
}

function categoryValue(value: string): Driver["category"] {
  if (value === "Tercero" || value === "Mixto") {
    return value;
  }

  return "Nexo Aberturas";
}

function cleanAssignment(value: string) {
  return value === "sin-asignar" ? "" : value;
}

function tripStatus(value: string): TripStatus {
  if (["Pendiente", "Asignado", "En carga", "En viaje", "Demorado", "Finalizado"].includes(value)) {
    return value as TripStatus;
  }

  return "Pendiente";
}

function stopStatus(value: string) {
  if (["Pendiente", "En camino", "Entregado", "No disponible"].includes(value)) {
    return value as Trip["stops"][number]["status"];
  }

  return "Pendiente";
}

function documentType(value: string): DocumentRecord["type"] {
  if (["Chofer", "Unidad", "Empresa", "Cliente", "Viaje"].includes(value)) {
    return value as DocumentRecord["type"];
  }

  return "Empresa";
}

function documentStatus(due: string): DocumentRecord["status"] {
  if (!due) {
    return "Pendiente";
  }

  const days = daysUntil(due);

  if (days < 0) {
    return "Vencido";
  }

  return days <= 30 ? "Por vencer" : "Vigente";
}

function incidentType(priority: string): Incident["type"] {
  if (priority === "Alta") {
    return "Alta";
  }

  if (priority === "Media") {
    return "Media";
  }

  return "Crítica";
}

function incidentTone(priority: string): Tone {
  if (priority === "Media") {
    return "amber";
  }

  return "red";
}

function daysUntil(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    return 999;
  }

  return Math.ceil((parsed.getTime() - today.getTime()) / 86_400_000);
}

function formatInputDate(date: string) {
  if (!date) {
    return "";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}
