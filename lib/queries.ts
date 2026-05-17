import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { fallbackLiveData, type LiveData } from "@/lib/live-data";
import type {
  CashMovement,
  Client,
  DocumentRecord,
  Driver,
  Incident,
  MaintenanceJob,
  Order,
  Trip,
  TripStop,
  Unit,
} from "@/lib/data";

function readJsonArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function formatDate(value: Date) {
  return value.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toDriver(driver: Awaited<ReturnType<typeof prisma.driver.findMany>>[number]): Driver {
  return {
    slug: driver.slug,
    name: driver.name,
    initials: driver.initials,
    status: driver.status as Driver["status"],
    category: driver.category as Driver["category"],
    phone: driver.phone,
    dni: driver.dni,
    license: driver.license,
    licenseRisk: driver.licenseRisk,
    tripsThisMonth: driver.tripsThisMonth,
    punctuality: driver.punctuality,
    incidents: driver.incidents,
    unitId: driver.unitId ?? undefined,
    lastActivity: driver.lastActivity,
  };
}

type UnitWithDriver = Awaited<
  ReturnType<
    typeof prisma.unit.findMany<{
      include: { assignedDriver: true };
    }>
  >
>[number];

function toUnit(unit: UnitWithDriver): Unit {
  return {
    id: unit.id,
    brand: unit.brand,
    model: unit.model,
    plate: unit.plate,
    status: unit.status as Unit["status"],
    base: unit.base,
    driverSlug: unit.assignedDriver?.slug,
    km: unit.km,
    docs: readJsonArray(unit.docs),
    technicalNotes: readJsonArray(unit.technicalNotes),
    serviceDue: unit.serviceDue,
    hasRisk: unit.hasRisk,
  };
}

function toClient(client: Awaited<ReturnType<typeof prisma.client.findMany>>[number]): Client {
  return {
    code: client.code,
    slug: client.slug,
    name: client.name,
    contact: client.contact,
    phone: client.phone,
    reception: client.reception,
    tripsThisMonth: client.tripsThisMonth,
    status: client.status,
    requiresTurn: client.requiresTurn,
    tags: readJsonArray(client.tags),
    requirements: readJsonArray(client.requirements),
    delayAverage: client.delayAverage,
    openIncidents: client.openIncidents,
  };
}

type TripWithRelations = Awaited<
  ReturnType<
    typeof prisma.trip.findMany<{
      include: {
        clients: { include: { client: true } };
        driver: true;
        mainClient: true;
        stops: { include: { client: true }; orderBy: { number: "asc" } };
        timeline: { orderBy: { order: "asc" } };
        unit: true;
      };
    }>
  >
>[number];

function toTrip(trip: TripWithRelations): Trip {
  const stops: TripStop[] = trip.stops.map((stop) => ({
    number: stop.number,
    clientSlug: stop.client.slug,
    address: stop.address,
    goods: stop.goods,
    status: stop.status as TripStop["status"],
    note: stop.note,
    delivered: stop.delivered,
    alert: stop.alert ?? undefined,
    returnInfo: stop.returnInfo ?? undefined,
  }));

  const clientSlugs = trip.clients.length > 0
    ? trip.clients.map((tripClient) => tripClient.client.slug)
    : Array.from(new Set(stops.map((stop) => stop.clientSlug)));

  return {
    id: trip.code,
    slug: trip.slug,
    mainClientSlug: trip.mainClient.slug,
    clientSlugs,
    origin: trip.origin,
    destination: trip.destination,
    driverSlug: trip.driver?.slug ?? "",
    unitId: trip.unit?.id ?? "",
    status: trip.status as Trip["status"],
    alert: trip.alert,
    date: formatDate(trip.date),
    assignedCash: trip.assignedCash,
    spentCash: trip.spentCash,
    stops,
    timeline: trip.timeline.map((event) => ({
      time: event.time,
      text: event.text,
      state: event.state as Trip["timeline"][number]["state"],
    })),
  };
}

type OrderWithClient = Awaited<
  ReturnType<
    typeof prisma.loadOrder.findMany<{
      include: { client: true };
    }>
  >
>[number];

function toOrder(order: OrderWithClient): Order {
  return {
    code: order.code,
    slug: order.slug,
    clientSlug: order.client.slug,
    load: order.load,
    origin: order.origin,
    destination: order.destination,
    driverSlug: order.driverId ?? undefined,
    unitId: order.unitId ?? undefined,
    status: order.status as Order["status"],
    docs: order.docs,
    risk: order.risk,
  };
}

function toDocument(document: Awaited<ReturnType<typeof prisma.document.findMany>>[number]): DocumentRecord {
  return {
    id: document.id,
    name: document.name,
    owner: document.owner,
    association: document.association,
    type: document.type as DocumentRecord["type"],
    due: document.due,
    status: document.status as DocumentRecord["status"],
    fileUrl: document.fileUrl ?? undefined,
  };
}

function toIncident(incident: Awaited<ReturnType<typeof prisma.incident.findMany>>[number]): Incident {
  return {
    id: incident.id,
    type: incident.type as Incident["type"],
    title: incident.title,
    detail: incident.detail,
    tone: incident.tone as Incident["tone"],
  };
}

type MovementWithRelations = Awaited<
  ReturnType<
    typeof prisma.cashMovement.findMany<{
      include: { driver: true; trip: true; unit: true };
    }>
  >
>[number];

function toCashMovement(movement: MovementWithRelations): CashMovement {
  return {
    id: movement.id,
    date: formatDate(movement.date),
    type: movement.type as CashMovement["type"],
    category: movement.category,
    tripSlug: movement.trip.slug,
    driverSlug: movement.driver?.slug ?? "",
    unitId: movement.unit?.id ?? "",
    amount: movement.amount,
    status: movement.status,
    risk: movement.risk,
  };
}

function toMaintenanceJob(job: Awaited<ReturnType<typeof prisma.maintenanceJob.findMany>>[number]): MaintenanceJob {
  return {
    id: job.id,
    unitId: job.unitId,
    issue: job.issue,
    status: job.status as MaintenanceJob["status"],
    next: job.next,
    risk: job.risk,
  };
}

export const getLiveData = cache(async (): Promise<LiveData> => {
  try {
    const [
      drivers,
      units,
      clients,
      trips,
      orders,
      documents,
      incidents,
      cashMovements,
      maintenanceJobs,
    ] = await Promise.all([
      prisma.driver.findMany({ orderBy: { name: "asc" } }),
      prisma.unit.findMany({
        include: { assignedDriver: true },
        orderBy: { plate: "asc" },
      }),
      prisma.client.findMany({ orderBy: { code: "asc" } }),
      prisma.trip.findMany({
        include: {
          clients: { include: { client: true } },
          driver: true,
          mainClient: true,
          stops: { include: { client: true }, orderBy: { number: "asc" } },
          timeline: { orderBy: { order: "asc" } },
          unit: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.loadOrder.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.incident.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.cashMovement.findMany({
        include: { driver: true, trip: true, unit: true },
        orderBy: { date: "desc" },
      }),
      prisma.maintenanceJob.findMany({ orderBy: { updatedAt: "desc" } }),
    ]);

    if (clients.length === 0 && trips.length === 0) {
      return fallbackLiveData;
    }

    return {
      cashMovements: cashMovements.map(toCashMovement),
      clients: clients.map(toClient),
      documents: documents.map(toDocument),
      drivers: drivers.map(toDriver),
      incidents: incidents.map(toIncident),
      maintenanceJobs: maintenanceJobs.map(toMaintenanceJob),
      orders: orders.map(toOrder),
      trips: trips.map(toTrip),
      units: units.map(toUnit),
    };
  } catch {
    return fallbackLiveData;
  }
});

export async function getTripBySlug(slug: string) {
  const data = await getLiveData();
  return data.trips.find((trip) => trip.slug === slug.toLowerCase());
}

export async function getOrderBySlug(slug: string) {
  const data = await getLiveData();
  const normalized = slug.toLowerCase();
  return data.orders.find((order) => order.slug === normalized || order.code.toLowerCase() === normalized);
}

export async function getDriverBySlug(slug: string) {
  const data = await getLiveData();
  return data.drivers.find((driver) => driver.slug === slug.toLowerCase());
}

export async function getUnitById(id: string) {
  const data = await getLiveData();
  return data.units.find((unit) => unit.id === id.toLowerCase());
}

export async function getClientBySlug(slug: string) {
  const data = await getLiveData();
  return data.clients.find((client) => client.slug === slug.toLowerCase());
}

export async function getIncidentById(id: string) {
  const data = await getLiveData();
  return data.incidents.find((incident) => incident.id === id);
}
