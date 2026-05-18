"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit, ensureConfigurationDefaults } from "@/lib/configuration";
import { prisma } from "@/lib/prisma";
import { ensureTenantDefaults, getMockSession } from "@/lib/session";

async function currentTenantId() {
  await ensureTenantDefaults();
  return (await getMockSession()).tenantId;
}

export async function switchMockSessionAction(formData: FormData) {
  const tenantId = requiredString(formData, "tenantId") || "tnx";
  const userId = requiredString(formData, "userId") || "usr-ignacio";
  const returnTo = requiredString(formData, "returnTo") || "/dashboard";
  const cookieStore = await cookies();

  cookieStore.set("nexo-tenant-id", tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("nexo-user-id", userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/");
  redirect(returnTo);
}

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
  const tenantId = await currentTenantId();
  const clients = await prisma.client.findMany({
    where: { tenantId },
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

function clientHistorySnapshot(data: Record<string, unknown>) {
  return JSON.stringify({
    code: data.code,
    name: data.name,
    contact: data.contact,
    phone: data.phone,
    reception: data.reception,
    status: data.status,
    requiresTurn: data.requiresTurn,
    tags: data.tags,
    requirements: data.requirements,
  });
}

async function recordClientHistory({
  clientId,
  detail,
  event,
  snapshot,
}: {
  clientId: string;
  detail: string;
  event: string;
  snapshot: Record<string, unknown>;
}) {
  await prisma.clientHistory.create({
    data: {
      clientId,
      event,
      detail,
      snapshot: clientHistorySnapshot(snapshot),
    },
  });
}

function getAllStringValues(formData: FormData, name: string) {
  return formData.getAll(name).map((value) => String(value).trim());
}

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true" || formData.get(name) === "1";
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

function revalidateConfiguration() {
  ["/configuracion", "/dashboard", "/viajes", "/chofer"].forEach((route) => revalidatePath(route));
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
  const tenantId = await currentTenantId();
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
  const requiresTurn = toBoolean(parsed.requiresTurn);
  const clientData = {
    tenantId,
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
      tenantId,
      OR: [
        { slug },
        { code },
      ],
    },
  });

  if (existing) {
    const client = await prisma.client.update({
      where: { id: existing.id },
      data: clientData,
    });

    await recordClientHistory({
      clientId: client.id,
      event: "Ficha actualizada",
      detail: `Se actualizo la ficha operativa de ${client.name}.`,
      snapshot: clientData,
    });
  } else {
    const client = await prisma.client.create({
      data: {
        id: slug,
        ...clientData,
        delayAverage: "0m",
      },
    });

    await recordClientHistory({
      clientId: client.id,
      event: "Alta de cliente",
      detail: `Se creo el cliente ${client.code} desde Clientes.`,
      snapshot: clientData,
    });
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

const companySettingsSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().min(2),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  address: z.string().optional(),
  branchName: z.string().min(2),
  country: z.string().min(2),
  currency: z.string().min(2),
  timezone: z.string().min(2),
  website: z.string().optional(),
  primaryColor: z.string().min(4),
  accentColor: z.string().min(4),
  backgroundColor: z.string().min(4),
});

export async function updateCompanySettingsAction(formData: FormData) {
  await ensureConfigurationDefaults();
  const tenantId = await currentTenantId();

  const parsed = companySettingsSchema.parse({
    name: requiredString(formData, "name"),
    legalName: requiredString(formData, "legalName"),
    taxId: requiredString(formData, "taxId"),
    phone: requiredString(formData, "phone"),
    email: requiredString(formData, "email"),
    address: requiredString(formData, "address"),
    branchName: requiredString(formData, "branchName"),
    country: requiredString(formData, "country"),
    currency: requiredString(formData, "currency"),
    timezone: requiredString(formData, "timezone"),
    website: requiredString(formData, "website"),
    primaryColor: requiredString(formData, "primaryColor"),
    accentColor: requiredString(formData, "accentColor"),
    backgroundColor: requiredString(formData, "backgroundColor"),
  });
  const file = formData.get("logo");
  let logoUrl: string | undefined;

  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".png";
    const fileName = `empresa-logo-${Date.now().toString(36)}${ext.toLowerCase()}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "branding");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), bytes);
    logoUrl = `/uploads/branding/${fileName}`;
  }

  await prisma.companySettings.upsert({
    where: { tenantId },
    update: {
      ...parsed,
      ...(logoUrl ? { logoUrl } : {}),
    },
    create: {
      id: `company-${tenantId}`,
      tenantId,
      ...parsed,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  await audit("Configurar empresa", "CompanySettings", "default", `Se actualizo la identidad de ${parsed.name}.`, parsed);
  revalidateConfiguration();
  redirect("/configuracion#empresa");
}

const configOptionSchema = z.object({
  kind: z.string().min(2),
  label: z.string().min(2),
  value: z.string().optional(),
  description: z.string().optional(),
  color: z.string().min(2),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createConfigOptionAction(formData: FormData) {
  await ensureConfigurationDefaults();
  const tenantId = await currentTenantId();

  const parsed = configOptionSchema.parse({
    kind: requiredString(formData, "kind"),
    label: requiredString(formData, "label"),
    value: requiredString(formData, "value"),
    description: requiredString(formData, "description"),
    color: requiredString(formData, "color") || "slate",
    sortOrder: requiredString(formData, "sortOrder") || "0",
  });
  const value = slugify(parsed.value || parsed.label);

  await prisma.configOption.upsert({
    where: { kind_value: { kind: parsed.kind, value } },
    update: {
      label: parsed.label,
      tenantId,
      description: parsed.description ?? "",
      color: parsed.color,
      sortOrder: parsed.sortOrder,
      active: true,
      requiresDoubleValidation: checkboxValue(formData, "requiresDoubleValidation"),
      blocksOperation: checkboxValue(formData, "blocksOperation"),
    },
    create: {
      kind: parsed.kind,
      tenantId,
      label: parsed.label,
      value,
      description: parsed.description ?? "",
      color: parsed.color,
      sortOrder: parsed.sortOrder,
      active: true,
      requiresDoubleValidation: checkboxValue(formData, "requiresDoubleValidation"),
      blocksOperation: checkboxValue(formData, "blocksOperation"),
    },
  });

  await audit("Configurar opcion", "ConfigOption", value, `Se guardo ${parsed.label} en ${parsed.kind}.`);
  revalidateConfiguration();
  redirect(`/configuracion#${parsed.kind}`);
}

export async function toggleConfigOptionAction(formData: FormData) {
  const id = requiredString(formData, "id");
  const kind = requiredString(formData, "kind");
  const active = checkboxValue(formData, "active");

  if (!id) {
    throw new Error("Opcion inexistente.");
  }

  const option = await prisma.configOption.update({
    where: { id },
    data: { active },
  });

  await audit(active ? "Activar opcion" : "Desactivar opcion", "ConfigOption", id, option.label);
  revalidateConfiguration();
  redirect(`/configuracion#${kind}`);
}

const operationalRuleSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().min(2),
  appliesTo: z.string().min(2),
  trigger: z.string().min(2),
  action: z.string().min(2),
  severity: z.string().min(2),
});

export async function createOperationalRuleAction(formData: FormData) {
  await ensureConfigurationDefaults();
  const tenantId = await currentTenantId();

  const parsed = operationalRuleSchema.parse({
    code: requiredString(formData, "code") || `RULE-${Date.now().toString(36).toUpperCase()}`,
    name: requiredString(formData, "name"),
    description: requiredString(formData, "description"),
    appliesTo: requiredString(formData, "appliesTo"),
    trigger: requiredString(formData, "trigger"),
    action: requiredString(formData, "action"),
    severity: requiredString(formData, "severity"),
  });

  await prisma.operationalRule.upsert({
    where: { code: parsed.code },
    update: {
      ...parsed,
      tenantId,
      enabled: checkboxValue(formData, "enabled"),
      requiresAdmin: checkboxValue(formData, "requiresAdmin"),
      doubleValidation: checkboxValue(formData, "doubleValidation"),
    },
    create: {
      ...parsed,
      tenantId,
      enabled: checkboxValue(formData, "enabled"),
      requiresAdmin: checkboxValue(formData, "requiresAdmin"),
      doubleValidation: checkboxValue(formData, "doubleValidation"),
    },
  });

  await audit("Configurar regla", "OperationalRule", parsed.code, parsed.name, parsed);
  revalidateConfiguration();
  redirect("/configuracion#validaciones");
}

export async function updateRolePermissionsAction(formData: FormData) {
  await ensureConfigurationDefaults();

  const roleId = requiredString(formData, "roleId");
  const permissionKeys = getAllStringValues(formData, "permissionKey");

  if (!roleId) {
    throw new Error("Rol inexistente.");
  }

  const permissions = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true, key: true },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId } });

  if (permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
      })),
    });
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  await audit("Actualizar permisos", "Role", roleId, `Permisos actualizados para ${role?.name ?? roleId}.`, {
    permissions: permissions.map((permission) => permission.key),
  });

  revalidateConfiguration();
  redirect("/configuracion#roles");
}

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  branch: z.string().min(2),
  roleId: z.string().min(2),
  status: z.string().min(2),
});

export async function createSystemUserAction(formData: FormData) {
  await ensureConfigurationDefaults();
  const tenantId = await currentTenantId();

  const parsed = userSchema.parse({
    name: requiredString(formData, "name"),
    email: requiredString(formData, "email"),
    phone: requiredString(formData, "phone"),
    branch: requiredString(formData, "branch"),
    roleId: requiredString(formData, "roleId"),
    status: requiredString(formData, "status"),
  });
  const role = await prisma.role.findUnique({ where: { id: parsed.roleId } });
  const passwordHash = await bcrypt.hash(requiredString(formData, "password") || "nexo1234", 12);

  await prisma.user.upsert({
    where: { email: parsed.email },
    update: {
      name: parsed.name,
      tenantId,
      phone: parsed.phone ?? "",
      branch: parsed.branch,
      roleId: parsed.roleId,
      role: role?.slug.toUpperCase() ?? "ADMIN",
      status: parsed.status,
    },
    create: {
      name: parsed.name,
      tenantId,
      email: parsed.email,
      passwordHash,
      phone: parsed.phone ?? "",
      branch: parsed.branch,
      roleId: parsed.roleId,
      role: role?.slug.toUpperCase() ?? "ADMIN",
      status: parsed.status,
    },
  });

  await audit("Guardar usuario", "User", parsed.email, `Se guardo el usuario ${parsed.name} con rol ${role?.name ?? "Sin rol"}.`);
  revalidateConfiguration();
  redirect("/configuracion#usuarios");
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
  const tenantId = await currentTenantId();
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
      tenantId,
      model: parsed.model,
      base: parsed.base,
      km: parsed.km,
      docs: JSON.stringify(docs),
      hasRisk: true,
    },
    create: {
      id,
      tenantId,
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
  const tenantId = await currentTenantId();
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
    ? await prisma.unit.findFirst({ where: { plate: parsed.unitPlate, tenantId } })
    : null;

  await prisma.driver.upsert({
    where: { slug },
    update: {
      dni: parsed.dni,
      tenantId,
      phone: parsed.phone,
      category: parsed.category,
      license: parsed.licenseDue ? `Licencia vence ${parsed.licenseDue}` : "Documentación pendiente",
      licenseRisk: true,
      unitId: unit?.id,
    },
    create: {
      id: slug,
      tenantId,
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
  const tenantId = await currentTenantId();
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
      tenantId,
      OR: [
        { code: normalizeClientCode(parsed.clientName) },
        { name: parsed.clientName },
      ],
    },
  });

  if (!client) {
    throw new Error("Cliente inexistente");
  }

  const count = await prisma.loadOrder.count({ where: { tenantId } });
  const code = parsed.reference || `OC-${String(count + 1).padStart(6, "0")}`;
  const slug = slugify(code);

  await prisma.loadOrder.create({
    data: {
      id: slug,
      tenantId,
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
  const tenantId = await currentTenantId();
  const returnTo = requiredString(formData, "returnTo");
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
      tenantId,
      type: parsed.priority,
      title: parsed.title,
      detail: `${parsed.owner} · ${parsed.detail}`,
      tone: parsed.priority === "Crítica" ? "red" : parsed.priority === "Alta" ? "amber" : "blue",
      status: "Abierta",
    },
  });

  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  redirect(returnTo || "/alertas");
}

const maintenanceSchema = z.object({
  unitPlate: z.string().min(2),
  kind: z.string().min(2),
  date: z.string().optional(),
  priority: z.string(),
  detail: z.string().min(2),
});

export async function createMaintenanceAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const parsed = maintenanceSchema.parse({
    unitPlate: requiredString(formData, "unitPlate").split(" · ")[0],
    kind: requiredString(formData, "kind"),
    date: requiredString(formData, "date"),
    priority: requiredString(formData, "priority"),
    detail: requiredString(formData, "detail"),
  });

  const unit = await prisma.unit.findFirst({ where: { plate: parsed.unitPlate, tenantId } });

  if (!unit) {
    throw new Error("Unidad inexistente");
  }

  await prisma.maintenanceJob.create({
    data: {
      id: `mnt-${unit.id}-${Date.now().toString(36)}`,
      tenantId,
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
  const tenantId = await currentTenantId();
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

  if (!trip || trip.tenantId !== tenantId) {
    throw new Error("Viaje inexistente");
  }

  const amount = parsed.type === "Egreso" ? -Math.abs(parsed.amount) : Math.abs(parsed.amount);

  await prisma.cashMovement.create({
    data: {
      id: `mov-${Date.now().toString(36)}`,
      tenantId,
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

async function resolveTripClient(formData: FormData, index: number, tenantId: string) {
  const existingSlug = getAllStringValues(formData, "stopClientSlug")[index];
  const requestedCode = normalizeClientCode(getAllStringValues(formData, "stopClientCode")[index] ?? "");

  if (existingSlug) {
    const existing = await prisma.client.findFirst({
      where: {
        tenantId,
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
    const byCode = await prisma.client.findFirst({ where: { code: requestedCode, tenantId } });

    if (byCode) {
      return byCode;
    }
  }

  return null;
}

export async function createTripAction(formData: FormData) {
  const tenantId = await currentTenantId();
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
    ? await prisma.loadOrder.findFirst({ where: { slug: parsed.orderSlug, tenantId }, include: { client: true } })
    : null;

  const stopClientSlugs = getAllStringValues(formData, "stopClientSlug");
  const stopClientCodes = getAllStringValues(formData, "stopClientCode");
  const stopAddresses = getAllStringValues(formData, "stopAddress");
  const stopGoods = getAllStringValues(formData, "stopGoods");
  const stopNotes = getAllStringValues(formData, "stopNote");
  const stopContacts = getAllStringValues(formData, "stopContact");
  const stopReceptions = getAllStringValues(formData, "stopReception");
  const stopRequiresTurns = getAllStringValues(formData, "stopRequiresTurn");
  const stopTurnStatuses = getAllStringValues(formData, "stopTurnStatus");
  const stopInitialStatuses = getAllStringValues(formData, "stopInitialStatus");
  const stopCount = Math.max(stopClientCodes.length, stopClientSlugs.length, stopAddresses.length, stopGoods.length, 1);
  const resolvedClients = await Promise.all(
    Array.from({ length: stopCount }, (_, index) => resolveTripClient(formData, index, tenantId)),
  );
  const stopClients = resolvedClients.map((client) => client ?? order?.client ?? null);
  const readyStopClients = stopClients.filter((client): client is NonNullable<typeof client> => Boolean(client));

  if (readyStopClients.length !== stopCount) {
    throw new Error("Uno o mas clientes no existen. Cargalos primero desde Clientes y despues usa su codigo en el viaje.");
  }

  const uniqueClientIds = Array.from(new Set(readyStopClients.map((client) => client.id)));

  const driver = parsed.driverSlug && parsed.driverSlug !== "sin-asignar"
    ? await prisma.driver.findFirst({ where: { slug: parsed.driverSlug, tenantId } })
    : null;
  const unit = parsed.unitId && parsed.unitId !== "sin-asignar"
    ? await prisma.unit.findFirst({ where: { id: parsed.unitId, tenantId } })
    : null;
  const tripCount = await prisma.trip.count({ where: { tenantId } });
  const code = `VJ-${String(125 + tripCount).padStart(6, "0")}`;
  const slug = slugify(code);

  const trip = await prisma.trip.create({
    data: {
      id: slug,
      tenantId,
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
        create: readyStopClients.map((client, index) => {
          const contact = stopContacts[index] || `${client.contact} · ${client.phone}`;
          const reception = stopReceptions[index] || client.reception;
          const turnStatus = stopTurnStatuses[index] || (client.requiresTurn ? "Requiere pedir turno" : "No requiere turno");
          const requiresTurn = client.requiresTurn || toBoolean(stopRequiresTurns[index] ?? "") || turnStatus !== "No requiere turno";

          return {
            number: index + 1,
            client: { connect: { id: client.id } },
            clientCode: client.code,
            clientName: client.name,
            contact,
            reception,
            requiresTurn,
            turnStatus,
            address: stopAddresses[index] || parsed.destination,
            goods: stopGoods[index] || order?.load || "Carga general",
            status: stopInitialStatuses[index] || "Pendiente",
            note: stopNotes[index] || "Sin observaciones",
            alert: requiresTurn ? turnStatus : undefined,
            delivered: false,
          };
        }),
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

  await Promise.all(
    uniqueClientIds.map((clientId) => {
      const client = readyStopClients.find((item) => item.id === clientId);

      return recordClientHistory({
        clientId,
        event: "Viaje asociado",
        detail: `${code} · ${parsed.origin} a ${parsed.destination}`,
        snapshot: {
          code: client?.code,
          name: client?.name,
          contact: client?.contact,
          phone: client?.phone,
          reception: client?.reception,
          status: client?.status,
          requiresTurn: client?.requiresTurn,
          tripCode: code,
          tripDate: parsed.date,
        },
      });
    }),
  );

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

export async function requestOperationalConfirmationAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const tripSlug = requiredString(formData, "tripSlug");
  const returnTo = requiredString(formData, "returnTo");
  const code = requiredString(formData, "code") || "llevar-a-atracar";
  const label = requiredString(formData, "label") || "Llevar a atracar";
  const notes = requiredString(formData, "notes");
  const requestedBy = requiredString(formData, "requestedBy") || "Chofer";

  const trip = await prisma.trip.findFirst({
    where: { slug: tripSlug, tenantId },
    include: { timeline: true },
  });

  if (!trip) {
    throw new Error("Viaje inexistente.");
  }

  const pending = await prisma.operationalConfirmation.findFirst({
    where: {
      tripId: trip.id,
      code,
      status: "Pendiente",
    },
  });

  if (!pending) {
    await prisma.operationalConfirmation.create({
      data: {
        tripId: trip.id,
        code,
        label,
        notes,
        requestedBy,
        requestedRole: "Chofer",
      },
    });
  }

  await prisma.trip.update({
    where: { id: trip.id },
    data: {
      status: label,
      alert: `Pendiente confirmacion: ${label}`,
    },
  });

  await prisma.tripTimeline.create({
    data: {
      tripId: trip.id,
      order: trip.timeline.length + 1,
      time: "Ahora",
      text: `${requestedBy} solicito: ${label}`,
      state: "active",
    },
  });

  await audit("Solicitar confirmacion", "Trip", trip.id, `${trip.code} · ${label}`, { code, notes });
  revalidateOperations();
  revalidatePath("/chofer");
  redirect(returnTo || `/viajes/${trip.slug}`);
}

export async function confirmOperationalAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const confirmationId = requiredString(formData, "confirmationId");
  const tripSlug = requiredString(formData, "tripSlug");
  const returnTo = requiredString(formData, "returnTo");
  const nextStatus = requiredString(formData, "nextStatus") || "Atracado confirmado";
  const confirmedBy = requiredString(formData, "confirmedBy") || "Administrativo";

  const confirmation = await prisma.operationalConfirmation.update({
    where: { id: confirmationId },
    data: {
      status: "Confirmada",
      confirmedBy,
      confirmedRole: "Administrativo",
      confirmedAt: new Date(),
    },
    include: { trip: { include: { timeline: true } } },
  });

  if (confirmation.trip.tenantId !== tenantId) {
    throw new Error("Confirmacion fuera de la empresa activa.");
  }

  await prisma.trip.update({
    where: { id: confirmation.tripId },
    data: {
      status: nextStatus,
      alert: "Sin alertas",
    },
  });

  await prisma.tripTimeline.create({
    data: {
      tripId: confirmation.tripId,
      order: confirmation.trip.timeline.length + 1,
      time: "Ahora",
      text: `${confirmedBy} confirmo: ${confirmation.label}`,
      state: "done",
    },
  });

  await audit("Confirmar accion", "OperationalConfirmation", confirmationId, `${confirmation.trip.code} · ${confirmation.label}`);
  revalidateOperations();
  revalidatePath("/configuracion");
  revalidatePath("/chofer");
  redirect(returnTo || (tripSlug ? `/viajes/${tripSlug}` : "/viajes"));
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
  const tenantId = await currentTenantId();
  const returnTo = requiredString(formData, "returnTo");
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
      tenantId,
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
        tenantId,
        type: documentStatusFromDue(parsed.due ?? "") === "Vencido" ? "Alta" : "Media",
        title: `Revisar documento ${parsed.name}`,
        detail: `${parsed.owner} · ${parsed.notes || "Documento cargado con seguimiento administrativo."}`,
        tone: documentStatusFromDue(parsed.due ?? "") === "Vencido" ? "red" : "amber",
        status: "Abierta",
      },
    });
  }

  revalidateOperations();
  redirect(returnTo || "/documentos");
}

export async function resolveIncidentAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const id = requiredString(formData, "id");

  if (!id) {
    throw new Error("Incidencia inexistente.");
  }

  const incident = await prisma.incident.findFirst({ where: { id, tenantId } });

  if (!incident) {
    throw new Error("Incidencia fuera de la empresa activa.");
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
  const tenantId = await currentTenantId();
  const tripSlug = requiredString(formData, "tripSlug");
  const returnTo = requiredString(formData, "returnTo");
  const stopNumber = Number(requiredString(formData, "stopNumber"));
  const status = requiredString(formData, "status");
  const returnInfo = requiredString(formData, "returnInfo");

  const trip = await prisma.trip.findFirst({
    where: { slug: tripSlug, tenantId },
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
  redirect(returnTo || `/viajes/${trip.slug}`);
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
  const tenantId = await currentTenantId();
  const name = pick(row, ["cliente", "nombre", "razon social", "razón social", "empresa"]);

  if (!name) {
    return null;
  }

  const code = normalizeClientCode(pick(row, ["codigo", "código", "code", "id"])) || await generateClientCode();
  const slug = slugify(name);
  const requiresTurn = toBoolean(pick(row, ["requiere turno", "turno", "requiereTurno"]));
  const existing = await prisma.client.findFirst({
    where: {
      tenantId,
      OR: [
        { code },
        { slug },
        { name },
      ],
    },
  });
  const data = {
    tenantId,
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
    const client = await prisma.client.update({
      where: { id: existing.id },
      data,
    });

    await recordClientHistory({
      clientId: client.id,
      event: "Importacion de clientes",
      detail: `Se actualizo ${client.code} desde archivo.`,
      snapshot: data,
    });

    return client;
  }

  const client = await prisma.client.create({
    data: {
      id: slug,
      ...data,
      delayAverage: pick(row, ["demora", "demora promedio"]) || "0m",
      openIncidents: Number(pick(row, ["incidencias", "incidencias abiertas"]) || 0),
      tripsThisMonth: Number(pick(row, ["viajes", "viajes mes", "viajes este mes"]) || 0),
    },
  });

  await recordClientHistory({
    clientId: client.id,
    event: "Importacion de clientes",
    detail: `Se creo ${client.code} desde archivo.`,
    snapshot: data,
  });

  return client;
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
  const tenantId = await currentTenantId();
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
        tenantId,
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
        tenantId,
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
  const tenantId = await currentTenantId();
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
    const unit = unitPlate ? await prisma.unit.findFirst({ where: { plate: unitPlate, tenantId } }) : null;
    const license = pick(row, ["licencia", "vencimiento licencia", "documentacion", "documentación"]) || "Documentación pendiente";
    const existing = await prisma.driver.findFirst({
      where: {
        tenantId,
        OR: [
          { slug },
          { dni },
        ],
      },
    });
    const data = {
      slug,
      tenantId,
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
  const tenantId = await currentTenantId();
  let imported = 0;

  for (const row of rows) {
    const load = pick(row, ["carga", "mercaderia", "mercadería", "load"]);
    const clientCode = normalizeClientCode(pick(row, ["codigo cliente", "código cliente", "cliente codigo", "cliente código"]));
    const clientName = pick(row, ["cliente", "nombre cliente"]);
    const client = clientCode
      ? await prisma.client.findFirst({ where: { code: clientCode, tenantId } })
      : await prisma.client.findFirst({ where: { name: clientName, tenantId } });

    if (!load || !client) {
      continue;
    }

    const count = await prisma.loadOrder.count({ where: { tenantId } });
    const code = pick(row, ["codigo", "código", "orden", "oc"]) || `OC-${String(count + 1).padStart(6, "0")}`;
    const slug = slugify(code);

    await prisma.loadOrder.upsert({
      where: { code },
      update: {
        clientId: client.id,
        tenantId,
        load,
        origin: pick(row, ["origen", "origin"]) || "A confirmar",
        destination: pick(row, ["destino", "destination"]) || "A confirmar",
        status: pick(row, ["estado", "status"]) || "Pendiente",
        docs: pick(row, ["documentos", "docs", "documentacion"]) || "Pendiente",
        risk: toBoolean(pick(row, ["riesgo", "observada"])),
      },
      create: {
        id: slug,
        tenantId,
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
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
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
