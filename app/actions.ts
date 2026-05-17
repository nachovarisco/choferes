"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function requiredString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function normalizeClientCode(value: string) {
  const trimmed = value.trim().toUpperCase();

  if (!trimmed) {
    return "";
  }

  if (/^\d+$/.test(trimmed)) {
    return `CLI-${trimmed.padStart(4, "0")}`;
  }

  return trimmed.replace(/\s+/g, "-");
}

async function generateClientCode() {
  const clients = await prisma.client.findMany({
    select: { code: true },
  });
  const usedCodes = new Set(clients.map((client) => normalizeClientCode(client.code)));
  let nextNumber = clients.length + 1;
  let code = `CLI-${String(nextNumber).padStart(4, "0")}`;

  while (usedCodes.has(code)) {
    nextNumber += 1;
    code = `CLI-${String(nextNumber).padStart(4, "0")}`;
  }

  return code;
}

function getAllStringValues(formData: FormData, name: string) {
  return formData.getAll(name).map((value) => String(value).trim());
}

function revalidateOperations() {
  [
    "/dashboard",
    "/viajes",
    "/ordenes",
    "/choferes",
    "/unidades",
    "/clientes",
    "/documentos",
    "/alertas",
    "/caja",
    "/mantenimiento",
    "/reportes",
  ].forEach((route) => revalidatePath(route));
}

function documentStatusFromDue(due: string) {
  if (!due) {
    return "Pendiente";
  }

  const dueDate = new Date(`${due}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(dueDate.getTime())) {
    return "Pendiente";
  }

  const days = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return "Vencido";
  }

  return days <= 30 ? "Por vencer" : "Vigente";
}

function formatInputDate(due: string) {
  if (!due) {
    return "-";
  }

  const [year, month, day] = due.split("-");
  return `${day}/${month}/${year}`;
}

const clientSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2),
  contact: z.string().min(2),
  phone: z.string().min(2),
  reception: z.string().min(2),
  requiresTurn: z.string(),
  documentation: z.string(),
  notes: z.string().optional(),
});

export async function createClientAction(formData: FormData) {
  const parsed = clientSchema.parse({
    code: requiredString(formData, "code"),
    name: requiredString(formData, "name"),
    contact: requiredString(formData, "contact"),
    phone: requiredString(formData, "phone"),
    reception: requiredString(formData, "reception"),
    requiresTurn: requiredString(formData, "requiresTurn"),
    documentation: requiredString(formData, "documentation"),
    notes: requiredString(formData, "notes"),
  });

  const slug = slugify(parsed.name);
  const code = normalizeClientCode(parsed.code ?? "") || await generateClientCode();
  const requiresTurn = parsed.requiresTurn === "Sí";
  const clientData = {
    code,
    slug,
    name: parsed.name,
    contact: parsed.contact,
    phone: parsed.phone,
    reception: parsed.reception,
    requiresTurn,
    status: requiresTurn ? "Requiere turno" : "Operativo",
    tags: JSON.stringify(parsed.notes ? [parsed.notes] : []),
    requirements: JSON.stringify(
      parsed.documentation === "Completa"
        ? ["Licencia chofer", "Seguro unidad", "VTV", "ART", "Constancia AFIP"]
        : ["Remito", "Seguro unidad"],
    ),
  };
  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        { slug },
        { code },
      ],
    },
  });

  if (existing) {
    await prisma.client.update({
      where: { id: existing.id },
      data: clientData,
    });
  } else {
    await prisma.client.create({
      data: {
        id: slug,
        ...clientData,
        delayAverage: "0m",
      },
    });
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

const unitSchema = z.object({
  plate: z.string().min(5),
  type: z.string().min(2),
  brand: z.string().min(2),
  model: z.string().min(1),
  km: z.coerce.number().int().nonnegative().default(0),
  base: z.string().min(2),
  insuranceDue: z.string().optional(),
  vtvDue: z.string().optional(),
});

export async function createUnitAction(formData: FormData) {
  const parsed = unitSchema.parse({
    plate: requiredString(formData, "plate").toUpperCase(),
    type: requiredString(formData, "type"),
    brand: requiredString(formData, "brand"),
    model: requiredString(formData, "model"),
    km: requiredString(formData, "km") || "0",
    base: requiredString(formData, "base"),
    insuranceDue: requiredString(formData, "insuranceDue"),
    vtvDue: requiredString(formData, "vtvDue"),
  });

  const id = parsed.plate.toLowerCase();
  const docs = [
    parsed.insuranceDue ? `Seguro vence ${parsed.insuranceDue}` : "Seguro pendiente",
    parsed.vtvDue ? `VTV vence ${parsed.vtvDue}` : "VTV pendiente",
  ];

  await prisma.unit.upsert({
    where: { plate: parsed.plate },
    update: {
      brand: parsed.brand,
      model: parsed.model,
      base: parsed.base,
      km: parsed.km,
      docs: JSON.stringify(docs),
      hasRisk: true,
    },
    create: {
      id,
      plate: parsed.plate,
      brand: parsed.brand,
      model: parsed.model,
      status: "Operativa",
      base: parsed.base,
      km: parsed.km,
      docs: JSON.stringify(docs),
      technicalNotes: JSON.stringify([parsed.type]),
      serviceDue: "Sin programar",
      hasRisk: true,
    },
  });

  revalidatePath("/unidades");
  revalidatePath("/mantenimiento");
  redirect("/unidades");
}

const driverSchema = z.object({
  name: z.string().min(2),
  dni: z.string().min(5),
  phone: z.string().min(2),
  category: z.string().min(2),
  licenseDue: z.string().optional(),
  unitPlate: z.string().optional(),
});

export async function createDriverAction(formData: FormData) {
  const parsed = driverSchema.parse({
    name: requiredString(formData, "name"),
    dni: requiredString(formData, "dni"),
    phone: requiredString(formData, "phone"),
    category: requiredString(formData, "category"),
    licenseDue: requiredString(formData, "licenseDue"),
    unitPlate: requiredString(formData, "unitPlate"),
  });

  const slug = slugify(parsed.name);
  const initials = parsed.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const unit = parsed.unitPlate && parsed.unitPlate !== "Sin asignar"
    ? await prisma.unit.findUnique({ where: { plate: parsed.unitPlate } })
    : null;

  await prisma.driver.upsert({
    where: { slug },
    update: {
      dni: parsed.dni,
      phone: parsed.phone,
      category: parsed.category,
      license: parsed.licenseDue ? `Licencia vence ${parsed.licenseDue}` : "Documentación pendiente",
      licenseRisk: true,
      unitId: unit?.id,
    },
    create: {
      id: slug,
      slug,
      name: parsed.name,
      initials,
      dni: parsed.dni,
      phone: parsed.phone,
      category: parsed.category,
      status: "Disponible",
      license: parsed.licenseDue ? `Licencia vence ${parsed.licenseDue}` : "Documentación pendiente",
      licenseRisk: true,
      unitId: unit?.id,
    },
  });

  revalidatePath("/choferes");
  redirect("/choferes");
}

const orderSchema = z.object({
  clientName: z.string().min(2),
  reference: z.string().optional(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  load: z.string().min(2),
  priority: z.string(),
  docs: z.string(),
  status: z.string(),
  estimatedDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createOrderAction(formData: FormData) {
  const parsed = orderSchema.parse({
    clientName: requiredString(formData, "clientName"),
    reference: requiredString(formData, "reference"),
    origin: requiredString(formData, "origin"),
    destination: requiredString(formData, "destination"),
    load: requiredString(formData, "load"),
    priority: requiredString(formData, "priority"),
    docs: requiredString(formData, "docs"),
    status: requiredString(formData, "status"),
    estimatedDate: requiredString(formData, "estimatedDate"),
    notes: requiredString(formData, "notes"),
  });

  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { code: normalizeClientCode(parsed.clientName) },
        { name: parsed.clientName },
      ],
    },
  });

  if (!client) {
    throw new Error("Cliente inexistente");
  }

  const count = await prisma.loadOrder.count();
  const code = parsed.reference || `OC-${String(count + 1).padStart(6, "0")}`;
  const slug = slugify(code);

  await prisma.loadOrder.create({
    data: {
      id: slug,
      code,
      slug,
      clientId: client.id,
      load: parsed.load,
      origin: parsed.origin,
      destination: parsed.destination,
      status: parsed.status,
      docs: parsed.docs,
      risk: parsed.docs !== "Completa",
    },
  });

  revalidatePath("/ordenes");
  redirect("/ordenes");
}

const incidentSchema = z.object({
  priority: z.string(),
  type: z.string(),
  title: z.string().min(2),
  owner: z.string(),
  detail: z.string().min(2),
});

export async function createIncidentAction(formData: FormData) {
  const parsed = incidentSchema.parse({
    priority: requiredString(formData, "priority"),
    type: requiredString(formData, "type"),
    title: requiredString(formData, "title"),
    owner: requiredString(formData, "owner"),
    detail: requiredString(formData, "detail"),
  });

  const id = `inc-${slugify(parsed.title)}-${Date.now().toString(36)}`;

  await prisma.incident.create({
    data: {
      id,
      type: parsed.priority,
      title: parsed.title,
      detail: `${parsed.owner} · ${parsed.detail}`,
      tone: parsed.priority === "Crítica" ? "red" : parsed.priority === "Alta" ? "amber" : "blue",
      status: "Abierta",
    },
  });

  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  redirect("/alertas");
}

const maintenanceSchema = z.object({
  unitPlate: z.string().min(2),
  kind: z.string().min(2),
  date: z.string().optional(),
  priority: z.string(),
  detail: z.string().min(2),
});

export async function createMaintenanceAction(formData: FormData) {
  const parsed = maintenanceSchema.parse({
    unitPlate: requiredString(formData, "unitPlate").split(" · ")[0],
    kind: requiredString(formData, "kind"),
    date: requiredString(formData, "date"),
    priority: requiredString(formData, "priority"),
    detail: requiredString(formData, "detail"),
  });

  const unit = await prisma.unit.findUnique({ where: { plate: parsed.unitPlate } });

  if (!unit) {
    throw new Error("Unidad inexistente");
  }

  await prisma.maintenanceJob.create({
    data: {
      id: `mnt-${unit.id}-${Date.now().toString(36)}`,
      unitId: unit.id,
      issue: `${parsed.kind}: ${parsed.detail}`,
      status: parsed.priority === "Crítica" ? "En taller" : "Programado",
      next: parsed.date || "A confirmar",
      risk: parsed.priority !== "Normal",
    },
  });

  await prisma.unit.update({
    where: { id: unit.id },
    data: {
      hasRisk: true,
      technicalNotes: JSON.stringify([parsed.kind, parsed.detail]),
    },
  });

  revalidatePath("/mantenimiento");
  revalidatePath("/unidades");
  redirect("/mantenimiento");
}

const cashMovementSchema = z.object({
  type: z.string(),
  category: z.string(),
  tripCode: z.string(),
  amount: z.coerce.number().int(),
  date: z.string().min(1),
  status: z.string(),
});

export async function createCashMovementAction(formData: FormData) {
  const parsed = cashMovementSchema.parse({
    type: requiredString(formData, "type"),
    category: requiredString(formData, "category"),
    tripCode: requiredString(formData, "tripCode"),
    amount: requiredString(formData, "amount"),
    date: requiredString(formData, "date"),
    status: requiredString(formData, "status"),
  });

  const trip = await prisma.trip.findUnique({
    where: { code: parsed.tripCode },
    include: { driver: true, unit: true },
  });

  if (!trip) {
    throw new Error("Viaje inexistente");
  }

  const amount = parsed.type === "Egreso" ? -Math.abs(parsed.amount) : Math.abs(parsed.amount);

  await prisma.cashMovement.create({
    data: {
      id: `mov-${Date.now().toString(36)}`,
      date: new Date(`${parsed.date}T00:00:00`),
      type: parsed.type,
      category: parsed.category,
      amount,
      status: parsed.status,
      risk: parsed.status === "Falta comprobante",
      tripId: trip.id,
      driverId: trip.driverId,
      unitId: trip.unitId,
    },
  });

  await prisma.trip.update({
    where: { id: trip.id },
    data: {
      spentCash: parsed.type === "Egreso" ? trip.spentCash + Math.abs(parsed.amount) : trip.spentCash,
      assignedCash: parsed.type === "Ingreso" ? trip.assignedCash + Math.abs(parsed.amount) : trip.assignedCash,
    },
  });

  revalidatePath("/caja");
  revalidatePath(`/viajes/${trip.slug}/rendicion`);
  redirect("/caja");
}

const tripSchema = z.object({
  orderSlug: z.string().optional(),
  date: z.string().min(1),
  origin: z.string().min(2),
  destination: z.string().min(2),
  driverSlug: z.string().optional(),
  unitId: z.string().optional(),
  status: z.string().min(2),
  assignedCash: z.coerce.number().int().nonnegative().default(0),
  alert: z.string().optional(),
});

async function resolveTripClient(formData: FormData, index: number) {
  const existingSlug = getAllStringValues(formData, "stopClientSlug")[index];
  const requestedCode = normalizeClientCode(getAllStringValues(formData, "stopClientCode")[index] ?? "");
  const newName = getAllStringValues(formData, "stopNewClientName")[index];
  const newContact = getAllStringValues(formData, "stopNewClientContact")[index];
  const newPhone = getAllStringValues(formData, "stopNewClientPhone")[index];
  const newReception = getAllStringValues(formData, "stopNewClientReception")[index];
  const newRequiresTurn = getAllStringValues(formData, "stopNewClientRequiresTurn")[index];
  const newNotes = getAllStringValues(formData, "stopNewClientNotes")[index];

  if (existingSlug) {
    const existing = await prisma.client.findFirst({
      where: {
        OR: [
          { slug: existingSlug },
          { id: existingSlug },
        ],
      },
    });

    if (existing) {
      return existing;
    }
  }

  if (requestedCode) {
    const byCode = await prisma.client.findUnique({ where: { code: requestedCode } });

    if (byCode) {
      return byCode;
    }
  }

  if (!newName) {
    return null;
  }

  const slug = slugify(newName);
  const code = requestedCode || await generateClientCode();
  const requiresTurn = newRequiresTurn === "Sí";
  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        { slug },
        { code },
      ],
    },
  });
  const data = {
    code,
    slug,
    name: newName,
    contact: newContact || "Contacto a confirmar",
    phone: newPhone || "Sin teléfono",
    reception: newReception || "A confirmar",
    tripsThisMonth: 0,
    status: requiresTurn ? "Requiere turno" : "Alta rápida",
    requiresTurn,
    tags: JSON.stringify(newNotes ? [newNotes] : ["Alta desde viaje"]),
    requirements: JSON.stringify(["Remito", "Seguro unidad"]),
    delayAverage: "0m",
    openIncidents: 0,
  };

  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.client.create({
    data: {
      id: slug,
      ...data,
    },
  });
}

export async function createTripAction(formData: FormData) {
  const parsed = tripSchema.parse({
    orderSlug: requiredString(formData, "orderSlug"),
    date: requiredString(formData, "date"),
    origin: requiredString(formData, "origin"),
    destination: requiredString(formData, "destination"),
    driverSlug: requiredString(formData, "driverSlug"),
    unitId: requiredString(formData, "unitId"),
    status: requiredString(formData, "status"),
    assignedCash: requiredString(formData, "assignedCash") || "0",
    alert: requiredString(formData, "alert"),
  });

  const order = parsed.orderSlug
    ? await prisma.loadOrder.findFirst({ where: { slug: parsed.orderSlug }, include: { client: true } })
    : null;

  const stopClientSlugs = getAllStringValues(formData, "stopClientSlug");
  const stopAddresses = getAllStringValues(formData, "stopAddress");
  const stopGoods = getAllStringValues(formData, "stopGoods");
  const stopNotes = getAllStringValues(formData, "stopNote");
  const resolvedClients = await Promise.all(
    stopClientSlugs.map((_, index) => resolveTripClient(formData, index)),
  );
  const resolvedClientIds = resolvedClients
    .map((client) => client?.id)
    .filter((clientId): clientId is string => Boolean(clientId));
  const uniqueClientIds = Array.from(new Set(resolvedClientIds.length > 0 ? resolvedClientIds : order ? [order.clientId] : []));

  if (uniqueClientIds.length === 0) {
    throw new Error("El viaje necesita al menos un cliente.");
  }

  if (resolvedClientIds.length !== stopClientSlugs.length && !order) {
    throw new Error("Uno o más clientes no existen.");
  }

  const driver = parsed.driverSlug && parsed.driverSlug !== "sin-asignar"
    ? await prisma.driver.findUnique({ where: { slug: parsed.driverSlug } })
    : null;
  const unit = parsed.unitId && parsed.unitId !== "sin-asignar"
    ? await prisma.unit.findUnique({ where: { id: parsed.unitId } })
    : null;
  const tripCount = await prisma.trip.count();
  const code = `VJ-${String(125 + tripCount).padStart(6, "0")}`;
  const slug = slugify(code);

  const trip = await prisma.trip.create({
    data: {
      id: slug,
      code,
      slug,
      origin: parsed.origin,
      destination: parsed.destination,
      date: new Date(`${parsed.date}T00:00:00`),
      status: parsed.status,
      alert: parsed.alert || (order?.risk ? order.docs : "Sin alertas"),
      assignedCash: parsed.assignedCash,
      spentCash: 0,
      mainClientId: uniqueClientIds[0],
      driverId: driver?.id,
      unitId: unit?.id,
      clients: {
        create: uniqueClientIds.map((clientId) => ({
          client: { connect: { id: clientId } },
        })),
      },
      stops: {
        create: stopClientSlugs.map((_, index) => ({
          number: index + 1,
          client: { connect: { id: resolvedClientIds[index] ?? order?.clientId } },
          address: stopAddresses[index] || parsed.destination,
          goods: stopGoods[index] || order?.load || "Carga general",
          status: "Pendiente",
          note: stopNotes[index] || "Sin observaciones",
          delivered: false,
        })),
      },
      timeline: {
        create: [
          {
            order: 1,
            time: "Ahora",
            text: order ? `Viaje creado desde ${order.code}` : "Viaje creado desde tráfico",
            state: parsed.status === "Pendiente" ? "pending" : "active",
          },
        ],
      },
    },
  });

  if (order) {
    await prisma.loadOrder.update({
      where: { id: order.id },
      data: {
        status: parsed.status === "Pendiente" ? "Pendiente" : "Asignada",
        driverId: driver?.id,
        unitId: unit?.id,
      },
    });
  }

  if (driver && parsed.status !== "Pendiente") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { status: parsed.status === "En viaje" ? "En viaje" : "En carga", lastActivity: "Ahora" },
    });
  }

  if (unit && parsed.status !== "Pendiente") {
    await prisma.unit.update({
      where: { id: unit.id },
      data: { status: parsed.status === "En viaje" ? "En viaje" : "Operativa" },
    });
  }

  revalidateOperations();
  redirect(`/viajes/${trip.slug}`);
}

const documentSchema = z.object({
  category: z.string().min(2),
  name: z.string().min(2),
  reference: z.string().optional(),
  owner: z.string().min(2),
  association: z.string().min(2),
  due: z.string().optional(),
  notes: z.string().optional(),
});

export async function createDocumentAction(formData: FormData) {
  const parsed = documentSchema.parse({
    category: requiredString(formData, "category"),
    name: requiredString(formData, "name"),
    reference: requiredString(formData, "reference"),
    owner: requiredString(formData, "owner"),
    association: requiredString(formData, "association"),
    due: requiredString(formData, "due"),
    notes: requiredString(formData, "notes"),
  });

  const id = `doc-${slugify(`${parsed.name}-${parsed.owner}`)}-${Date.now().toString(36)}`;
  const file = formData.get("file");
  let fileUrl: string | undefined;

  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".bin";
    const fileName = `${id}${ext.toLowerCase()}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), bytes);
    fileUrl = `/uploads/documents/${fileName}`;
  }

  await prisma.document.create({
    data: {
      id,
      name: parsed.reference ? `${parsed.name} · ${parsed.reference}` : parsed.name,
      owner: parsed.owner,
      association: parsed.association,
      type: parsed.category,
      due: formatInputDate(parsed.due ?? ""),
      status: documentStatusFromDue(parsed.due ?? ""),
      fileUrl,
    },
  });

  if ((parsed.due && documentStatusFromDue(parsed.due) !== "Vigente") || parsed.notes) {
    await prisma.incident.create({
      data: {
        id: `inc-doc-${slugify(parsed.owner)}-${Date.now().toString(36)}`,
        type: documentStatusFromDue(parsed.due ?? "") === "Vencido" ? "Alta" : "Media",
        title: `Revisar documento ${parsed.name}`,
        detail: `${parsed.owner} · ${parsed.notes || "Documento cargado con seguimiento administrativo."}`,
        tone: documentStatusFromDue(parsed.due ?? "") === "Vencido" ? "red" : "amber",
        status: "Abierta",
      },
    });
  }

  revalidateOperations();
  redirect("/documentos");
}

export async function resolveIncidentAction(formData: FormData) {
  const id = requiredString(formData, "id");

  if (!id) {
    throw new Error("Incidencia inexistente.");
  }

  await prisma.incident.update({
    where: { id },
    data: {
      type: "Resuelta",
      tone: "green",
      status: "Cerrada",
    },
  });

  revalidateOperations();
  revalidatePath(`/alertas/${id}`);
  redirect(`/alertas/${id}`);
}

export async function updateTripStopAction(formData: FormData) {
  const tripSlug = requiredString(formData, "tripSlug");
  const stopNumber = Number(requiredString(formData, "stopNumber"));
  const status = requiredString(formData, "status");
  const returnInfo = requiredString(formData, "returnInfo");

  const trip = await prisma.trip.findUnique({
    where: { slug: tripSlug },
    include: { timeline: true },
  });

  if (!trip || !Number.isInteger(stopNumber)) {
    throw new Error("Parada inexistente.");
  }

  const delivered = status === "Entregado";

  await prisma.tripStop.update({
    where: {
      tripId_number: {
        tripId: trip.id,
        number: stopNumber,
      },
    },
    data: {
      status,
      delivered,
      alert: delivered ? null : status === "No disponible" ? "No disponible" : undefined,
      returnInfo: returnInfo || (delivered ? "Entrega confirmada" : undefined),
    },
  });

  await prisma.tripTimeline.create({
    data: {
      tripId: trip.id,
      order: trip.timeline.length + 1,
      time: "Ahora",
      text: `Parada ${stopNumber}: ${status}`,
      state: delivered ? "done" : "active",
    },
  });

  const stops = await prisma.tripStop.findMany({ where: { tripId: trip.id } });
  const allDelivered = stops.every((stop) => (stop.number === stopNumber ? delivered : stop.delivered));

  if (allDelivered) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "Finalizado", alert: "Sin alertas" },
    });
  }

  revalidateOperations();
  revalidatePath(`/viajes/${trip.slug}`);
  redirect(`/viajes/${trip.slug}`);
}

type ImportRow = Record<string, string>;

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function cellToString(value: ExcelJS.CellValue | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("es-AR");
  }

  if (typeof value === "object") {
    if ("text" in value && value.text) {
      return String(value.text).trim();
    }

    if ("result" in value) {
      return cellToString(value.result as ExcelJS.CellValue);
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("").trim();
    }
  }

  return String(value).trim();
}

function pick(row: ImportRow, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];

    if (value) {
      return value;
    }
  }

  return "";
}

function toBoolean(value: string) {
  return ["si", "sí", "true", "1", "x", "requiere", "yes"].includes(
    value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
  );
}

function listFromCell(value: string, fallback: string[] = []) {
  const list = value
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return list.length > 0 ? list : fallback;
}

function rowsFromWorksheet(sheet: ExcelJS.Worksheet) {
  const rows: ImportRow[] = [];
  const headers: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];

    if (rowNumber === 1) {
      values.forEach((value) => {
        headers.push(normalizeHeader(cellToString(value as ExcelJS.CellValue)));
      });
      return;
    }

    const record: ImportRow = {};
    values.forEach((value, index) => {
      const header = headers[index];

      if (header) {
        record[header] = cellToString(value as ExcelJS.CellValue);
      }
    });

    if (Object.values(record).some(Boolean)) {
      rows.push(record);
    }
  });

  return rows;
}

function parseDelimitedRows(text: string) {
  const delimiter = text.includes(";") ? ";" : ",";
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = splitDelimitedLine(lines[0] ?? "", delimiter).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter);
    const row: ImportRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });

    return row;
  });
}

function splitDelimitedLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

async function findOrCreateImportClient(row: ImportRow) {
  const name = pick(row, ["cliente", "nombre", "razon social", "razón social", "empresa"]);

  if (!name) {
    return null;
  }

  const code = normalizeClientCode(pick(row, ["codigo", "código", "code", "id"])) || await generateClientCode();
  const slug = slugify(name);
  const requiresTurn = toBoolean(pick(row, ["requiere turno", "turno", "requiereTurno"]));
  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        { code },
        { slug },
        { name },
      ],
    },
  });
  const data = {
    code,
    slug,
    name,
    contact: pick(row, ["contacto", "contacto operativo", "responsable"]) || "Contacto a confirmar",
    phone: pick(row, ["telefono", "teléfono", "celular", "phone"]) || "Sin teléfono",
    reception: pick(row, ["recepcion", "recepción", "horario", "horario recepcion"]) || "A confirmar",
    status: pick(row, ["estado", "status"]) || (requiresTurn ? "Requiere turno" : "Operativo"),
    requiresTurn,
    tags: JSON.stringify(listFromCell(pick(row, ["etiquetas", "tags", "condiciones"]), requiresTurn ? ["Pedir turno"] : [])),
    requirements: JSON.stringify(listFromCell(pick(row, ["requisitos", "documentos", "documentacion"]), ["Remito", "Seguro unidad"])),
  };

  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.client.create({
    data: {
      id: slug,
      ...data,
      delayAverage: pick(row, ["demora", "demora promedio"]) || "0m",
      openIncidents: Number(pick(row, ["incidencias", "incidencias abiertas"]) || 0),
      tripsThisMonth: Number(pick(row, ["viajes", "viajes mes", "viajes este mes"]) || 0),
    },
  });
}

async function importClients(rows: ImportRow[]) {
  let imported = 0;

  for (const row of rows) {
    const client = await findOrCreateImportClient(row);

    if (client) {
      imported += 1;
    }
  }

  return imported;
}

async function importUnits(rows: ImportRow[]) {
  let imported = 0;

  for (const row of rows) {
    const plate = pick(row, ["patente", "dominio", "unidad", "plate"]).toUpperCase();

    if (!plate) {
      continue;
    }

    const id = plate.toLowerCase();

    await prisma.unit.upsert({
      where: { plate },
      update: {
        brand: pick(row, ["marca", "brand"]) || "Sin marca",
        model: pick(row, ["modelo", "model"]) || "Sin modelo",
        base: pick(row, ["base", "sucursal"]) || "Paraná",
        status: pick(row, ["estado", "status"]) || "Operativa",
        km: Number(pick(row, ["km", "kilometros", "kilómetros"]) || 0),
        docs: JSON.stringify(listFromCell(pick(row, ["documentos", "docs"]))),
        technicalNotes: JSON.stringify(listFromCell(pick(row, ["notas", "observaciones", "tecnico", "técnico"]))),
        serviceDue: pick(row, ["service", "proximo service", "próximo service"]) || "Sin programar",
        hasRisk: toBoolean(pick(row, ["riesgo", "observada", "bloqueada"])),
      },
      create: {
        id,
        plate,
        brand: pick(row, ["marca", "brand"]) || "Sin marca",
        model: pick(row, ["modelo", "model"]) || "Sin modelo",
        base: pick(row, ["base", "sucursal"]) || "Paraná",
        status: pick(row, ["estado", "status"]) || "Operativa",
        km: Number(pick(row, ["km", "kilometros", "kilómetros"]) || 0),
        docs: JSON.stringify(listFromCell(pick(row, ["documentos", "docs"]))),
        technicalNotes: JSON.stringify(listFromCell(pick(row, ["notas", "observaciones", "tecnico", "técnico"]))),
        serviceDue: pick(row, ["service", "proximo service", "próximo service"]) || "Sin programar",
        hasRisk: toBoolean(pick(row, ["riesgo", "observada", "bloqueada"])),
      },
    });

    imported += 1;
  }

  return imported;
}

async function importDrivers(rows: ImportRow[]) {
  let imported = 0;

  for (const row of rows) {
    const name = pick(row, ["chofer", "nombre", "nombre y apellido"]);
    const dni = pick(row, ["dni", "documento"]);

    if (!name || !dni) {
      continue;
    }

    const slug = slugify(name);
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    const unitPlate = pick(row, ["unidad", "patente", "dominio"]).toUpperCase();
    const unit = unitPlate ? await prisma.unit.findUnique({ where: { plate: unitPlate } }) : null;
    const license = pick(row, ["licencia", "vencimiento licencia", "documentacion", "documentación"]) || "Documentación pendiente";
    const existing = await prisma.driver.findFirst({
      where: {
        OR: [
          { slug },
          { dni },
        ],
      },
    });
    const data = {
      slug,
      name,
      initials,
      dni,
      status: pick(row, ["estado", "status"]) || "Disponible",
      category: pick(row, ["categoria", "categoría", "tipo"]) || "Mixto",
      phone: pick(row, ["telefono", "teléfono", "celular"]) || "Sin teléfono",
      license,
      licenseRisk: toBoolean(pick(row, ["riesgo licencia", "licencia riesgo", "riesgo"])),
      unitId: unit?.id,
      lastActivity: pick(row, ["actividad", "ultima actividad", "última actividad"]) || "Sin actividad",
    };

    if (existing) {
      await prisma.driver.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.driver.create({
        data: {
          id: slug,
          ...data,
        },
      });
    }

    imported += 1;
  }

  return imported;
}

async function importOrders(rows: ImportRow[]) {
  let imported = 0;

  for (const row of rows) {
    const load = pick(row, ["carga", "mercaderia", "mercadería", "load"]);
    const clientCode = normalizeClientCode(pick(row, ["codigo cliente", "código cliente", "cliente codigo", "cliente código"]));
    const clientName = pick(row, ["cliente", "nombre cliente"]);
    const client = clientCode
      ? await prisma.client.findUnique({ where: { code: clientCode } })
      : await prisma.client.findFirst({ where: { name: clientName } });

    if (!load || !client) {
      continue;
    }

    const count = await prisma.loadOrder.count();
    const code = pick(row, ["codigo", "código", "orden", "oc"]) || `OC-${String(count + 1).padStart(6, "0")}`;
    const slug = slugify(code);

    await prisma.loadOrder.upsert({
      where: { code },
      update: {
        clientId: client.id,
        load,
        origin: pick(row, ["origen", "origin"]) || "A confirmar",
        destination: pick(row, ["destino", "destination"]) || "A confirmar",
        status: pick(row, ["estado", "status"]) || "Pendiente",
        docs: pick(row, ["documentos", "docs", "documentacion"]) || "Pendiente",
        risk: toBoolean(pick(row, ["riesgo", "observada"])),
      },
      create: {
        id: slug,
        code,
        slug,
        clientId: client.id,
        load,
        origin: pick(row, ["origen", "origin"]) || "A confirmar",
        destination: pick(row, ["destino", "destination"]) || "A confirmar",
        status: pick(row, ["estado", "status"]) || "Pendiente",
        docs: pick(row, ["documentos", "docs", "documentacion"]) || "Pendiente",
        risk: toBoolean(pick(row, ["riesgo", "observada"])),
      },
    });

    imported += 1;
  }

  return imported;
}

export async function importOperationsAction(formData: FormData) {
  const file = formData.get("file");
  const csvEntity = requiredString(formData, "csvEntity") || "Clientes";

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Subí un archivo Excel o CSV para importar.");
  }

  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const sheets: Record<string, ImportRow[]> = {};

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
    const text = buffer.toString("utf8");
    sheets[csvEntity] = parseDelimitedRows(text);
  } else {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as Buffer);
    workbook.eachSheet((sheet) => {
      sheets[sheet.name] = rowsFromWorksheet(sheet);
    });
  }

  const summary = {
    clientes: 0,
    choferes: 0,
    unidades: 0,
    ordenes: 0,
  };

  const entries = Object.entries(sheets).map(([sheetName, rows]) => ({
    rows,
    sheet: normalizeHeader(sheetName),
  }));
  const byKind = (kind: "cliente" | "chofer" | "unidad" | "orden") =>
    entries.filter(({ sheet }) => {
      if (kind === "cliente") return sheet.includes("cliente");
      if (kind === "chofer") return sheet.includes("chofer") || sheet.includes("driver");
      if (kind === "unidad") return sheet.includes("unidad") || sheet.includes("flota") || sheet.includes("camion");
      return sheet.includes("orden") || sheet.includes("carga");
    });

  for (const entry of byKind("cliente")) summary.clientes += await importClients(entry.rows);
  for (const entry of byKind("unidad")) summary.unidades += await importUnits(entry.rows);
  for (const entry of byKind("chofer")) summary.choferes += await importDrivers(entry.rows);
  for (const entry of byKind("orden")) summary.ordenes += await importOrders(entry.rows);

  revalidateOperations();
  redirect(
    `/importar?clientes=${summary.clientes}&choferes=${summary.choferes}&unidades=${summary.unidades}&ordenes=${summary.ordenes}`,
  );
}
