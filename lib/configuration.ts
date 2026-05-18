import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ensureTenantDefaults, getMockSession } from "@/lib/session";

export const configKinds = {
  documentTypes: "document-type",
  expenseCategories: "expense-category",
  tripStatuses: "trip-status",
  driverCategories: "driver-category",
  alertTypes: "alert-type",
} as const;

export const configKindLabels: Record<string, string> = {
  [configKinds.documentTypes]: "Tipos de documentos",
  [configKinds.expenseCategories]: "Categorias de gastos",
  [configKinds.tripStatuses]: "Estados de viaje",
  [configKinds.driverCategories]: "Categorias de choferes",
  [configKinds.alertTypes]: "Alertas operativas",
};

export const permissionCatalog = [
  { key: "dashboard.view", module: "Dashboard", action: "Ver", description: "Ver tablero operativo y KPIs generales." },
  { key: "trips.view", module: "Viajes", action: "Ver", description: "Ver viajes, paradas y trazabilidad." },
  { key: "trips.create", module: "Viajes", action: "Crear", description: "Crear viajes y asociar cargas." },
  { key: "trips.update", module: "Viajes", action: "Editar", description: "Editar estados, asignaciones y paradas." },
  { key: "trips.confirm", module: "Viajes", action: "Confirmar", description: "Confirmar acciones con doble validacion." },
  { key: "trips.assigned_only", module: "Viajes", action: "Asignados", description: "Ver solamente viajes propios asignados." },
  { key: "orders.manage", module: "Ordenes", action: "Gestionar", description: "Crear y administrar ordenes de carga." },
  { key: "drivers.manage", module: "Choferes", action: "Gestionar", description: "Alta, edicion y seguimiento de choferes." },
  { key: "units.manage", module: "Unidades", action: "Gestionar", description: "Administrar flota, estados y mantenimiento." },
  { key: "clients.manage", module: "Clientes", action: "Gestionar", description: "Gestionar cartera, codigos e historial de clientes." },
  { key: "documents.manage", module: "Documentos", action: "Gestionar", description: "Cargar, revisar y validar documentacion." },
  { key: "documents.upload", module: "Documentos", action: "Subir", description: "Subir remitos, fotos y comprobantes." },
  { key: "cash.view", module: "Caja", action: "Ver", description: "Ver caja general, rendiciones y gastos." },
  { key: "cash.manage", module: "Caja", action: "Gestionar", description: "Registrar movimientos y cerrar rendiciones." },
  { key: "maintenance.view", module: "Mantenimiento", action: "Ver", description: "Ver estado tecnico de unidades." },
  { key: "maintenance.manage", module: "Mantenimiento", action: "Gestionar", description: "Crear trabajos y bloquear unidades." },
  { key: "incidents.create", module: "Incidencias", action: "Crear", description: "Informar incidencias, reclamos y novedades." },
  { key: "incidents.manage", module: "Incidencias", action: "Gestionar", description: "Resolver y clasificar incidencias." },
  { key: "reports.view", module: "Reportes", action: "Ver", description: "Ver reportes y estadisticas completas." },
  { key: "settings.view", module: "Configuracion", action: "Ver", description: "Ver configuracion de empresa y reglas." },
  { key: "settings.manage", module: "Configuracion", action: "Administrar", description: "Editar empresa, reglas y listas maestras." },
  { key: "users.manage", module: "Usuarios", action: "Administrar", description: "Gestionar usuarios, roles y permisos." },
  { key: "driver_app.use", module: "App Chofer", action: "Usar", description: "Acceder a la experiencia mobile-first del chofer." },
];

const allPermissions = permissionCatalog.map((permission) => permission.key);

export const roleCatalog = [
  {
    slug: "administrador",
    name: "Administrador",
    description: "Acceso total al sistema, configuracion, permisos, estadisticas y auditoria.",
    level: 100,
    permissions: allPermissions,
  },
  {
    slug: "administrativo",
    name: "Administrativo",
    description: "Gestion operativa de viajes, cargas, documentos, incidencias, gastos y rendiciones.",
    level: 50,
    permissions: [
      "dashboard.view",
      "trips.view",
      "trips.create",
      "trips.update",
      "orders.manage",
      "drivers.manage",
      "units.manage",
      "clients.manage",
      "documents.manage",
      "documents.upload",
      "cash.manage",
      "maintenance.view",
      "incidents.create",
      "incidents.manage",
      "reports.view",
      "settings.view",
    ],
  },
  {
    slug: "chofer",
    name: "Chofer",
    description: "Acceso movil a viajes asignados, paradas, confirmaciones, remitos e incidencias.",
    level: 10,
    permissions: [
      "trips.view",
      "trips.update",
      "trips.assigned_only",
      "documents.upload",
      "incidents.create",
      "maintenance.view",
      "driver_app.use",
    ],
  },
];

export const defaultConfigOptions = [
  { kind: configKinds.documentTypes, label: "Licencia profesional", value: "licencia-profesional", color: "blue", sortOrder: 1 },
  { kind: configKinds.documentTypes, label: "VTV / RTO", value: "vtv-rto", color: "amber", sortOrder: 2 },
  { kind: configKinds.documentTypes, label: "Seguro unidad", value: "seguro-unidad", color: "green", sortOrder: 3 },
  { kind: configKinds.documentTypes, label: "ART / cobertura", value: "art-cobertura", color: "purple", sortOrder: 4 },
  { kind: configKinds.documentTypes, label: "Remito firmado", value: "remito-firmado", color: "slate", sortOrder: 5 },
  { kind: configKinds.documentTypes, label: "Foto de entrega", value: "foto-entrega", color: "slate", sortOrder: 6 },
  { kind: configKinds.expenseCategories, label: "Combustible", value: "combustible", color: "amber", sortOrder: 1 },
  { kind: configKinds.expenseCategories, label: "Peaje", value: "peaje", color: "blue", sortOrder: 2 },
  { kind: configKinds.expenseCategories, label: "Viaticos", value: "viaticos", color: "green", sortOrder: 3 },
  { kind: configKinds.expenseCategories, label: "Gomeria", value: "gomeria", color: "red", sortOrder: 4 },
  { kind: configKinds.expenseCategories, label: "Taller", value: "taller", color: "purple", sortOrder: 5 },
  { kind: configKinds.tripStatuses, label: "Pendiente", value: "pendiente", color: "slate", sortOrder: 1 },
  { kind: configKinds.tripStatuses, label: "Asignado", value: "asignado", color: "blue", sortOrder: 2 },
  { kind: configKinds.tripStatuses, label: "Llevar a atracar", value: "llevar-a-atracar", color: "amber", sortOrder: 3, requiresDoubleValidation: true },
  { kind: configKinds.tripStatuses, label: "Atracado confirmado", value: "atracado-confirmado", color: "green", sortOrder: 4 },
  { kind: configKinds.tripStatuses, label: "En carga", value: "en-carga", color: "amber", sortOrder: 5 },
  { kind: configKinds.tripStatuses, label: "Cargado", value: "cargado", color: "green", sortOrder: 6 },
  { kind: configKinds.tripStatuses, label: "En viaje", value: "en-viaje", color: "blue", sortOrder: 7 },
  { kind: configKinds.tripStatuses, label: "En descarga", value: "en-descarga", color: "amber", sortOrder: 8 },
  { kind: configKinds.tripStatuses, label: "Entregado", value: "entregado", color: "green", sortOrder: 9 },
  { kind: configKinds.tripStatuses, label: "Finalizado", value: "finalizado", color: "green", sortOrder: 10 },
  { kind: configKinds.tripStatuses, label: "Demorado", value: "demorado", color: "red", sortOrder: 11, blocksOperation: true },
  { kind: configKinds.driverCategories, label: "Nexo Aberturas", value: "nexo-aberturas", color: "blue", sortOrder: 1 },
  { kind: configKinds.driverCategories, label: "Tercero", value: "tercero", color: "purple", sortOrder: 2 },
  { kind: configKinds.driverCategories, label: "Mixto", value: "mixto", color: "green", sortOrder: 3 },
  { kind: configKinds.driverCategories, label: "Eventual", value: "eventual", color: "slate", sortOrder: 4 },
  { kind: configKinds.alertTypes, label: "Documento vencido", value: "documento-vencido", color: "red", sortOrder: 1, blocksOperation: true },
  { kind: configKinds.alertTypes, label: "Falta remito", value: "falta-remito", color: "amber", sortOrder: 2 },
  { kind: configKinds.alertTypes, label: "Unidad bloqueada", value: "unidad-bloqueada", color: "red", sortOrder: 3, blocksOperation: true },
  { kind: configKinds.alertTypes, label: "Cliente requiere turno", value: "cliente-requiere-turno", color: "amber", sortOrder: 4, requiresDoubleValidation: true },
];

export const defaultOperationalRules = [
  {
    code: "RULE-ATRACAR-001",
    name: "Doble validacion para atracar",
    description: "Cuando el chofer marca Llevar a atracar, carga/logistica debe confirmar antes de avanzar a En carga.",
    appliesTo: "Viajes",
    trigger: "Estado Llevar a atracar",
    action: "Crear confirmacion pendiente para trafico/carga.",
    severity: "Alta",
    doubleValidation: true,
  },
  {
    code: "RULE-DOC-001",
    name: "Bloqueo por documentacion critica",
    description: "Documentos vencidos de chofer o unidad generan alerta critica antes de asignar viaje.",
    appliesTo: "Documentos",
    trigger: "Documento vencido",
    action: "Bloquear asignacion hasta regularizar o autorizar.",
    severity: "Critica",
    requiresAdmin: true,
  },
  {
    code: "RULE-TURNO-001",
    name: "Clientes con turno obligatorio",
    description: "Si el cliente requiere turno, el viaje queda observado hasta registrar turno solicitado.",
    appliesTo: "Clientes",
    trigger: "Cliente requiere turno",
    action: "Agregar alerta en parada y exigir confirmacion.",
    severity: "Media",
    doubleValidation: true,
  },
];

export async function audit(action: string, entity: string, entityId: string, detail: string, metadata: Record<string, unknown> = {}) {
  const session = await getMockSession();
  await prisma.auditLog.create({
    data: {
      tenantId: session.tenantId,
      actorName: session.userName,
      actorRole: session.role,
      action,
      entity,
      entityId,
      detail,
      metadata: JSON.stringify(metadata),
    },
  });
}

export async function ensureConfigurationDefaults() {
  await ensureTenantDefaults();
  const session = await getMockSession();
  const tenantId = session.tenantId;

  await prisma.companySettings.upsert({
    where: { tenantId },
    update: {},
    create: { id: `company-${tenantId}`, tenantId },
  });

  for (const option of defaultConfigOptions) {
    await prisma.configOption.upsert({
      where: { kind_value: { kind: option.kind, value: option.value } },
      update: {},
      create: {
        ...option,
        tenantId,
        requiresDoubleValidation: "requiresDoubleValidation" in option ? Boolean(option.requiresDoubleValidation) : false,
        blocksOperation: "blocksOperation" in option ? Boolean(option.blocksOperation) : false,
      },
    });
  }

  for (const permission of permissionCatalog) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission,
    });
  }

  for (const role of roleCatalog) {
    const savedRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: true,
      },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: true,
      },
      include: { permissions: true },
    });

    if (savedRole.permissions.length === 0) {
      const permissions = await prisma.permission.findMany({
        where: { key: { in: role.permissions } },
        select: { id: true },
      });

      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: savedRole.id,
          permissionId: permission.id,
        })),
      });
    }
  }

  for (const rule of defaultOperationalRules) {
    await prisma.operationalRule.upsert({
      where: { code: rule.code },
      update: {},
      create: { ...rule, tenantId },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { slug: "administrador" } });
  if (adminRole) {
    await prisma.user.updateMany({
      where: { tenantId, roleId: null },
      data: {
        roleId: adminRole.id,
        role: "ADMIN",
        status: "Activo",
      },
    });
  }
}

export const getConfigurationData = cache(async () => {
  await ensureConfigurationDefaults();
  const session = await getMockSession();
  const tenantFilter = { tenantId: session.tenantId };

  const [company, options, roles, permissions, users, rules, auditLogs, tenant, branches, subscription, invitations, devices, notifications] = await Promise.all([
    prisma.companySettings.findFirst({ where: tenantFilter }),
    prisma.configOption.findMany({ where: tenantFilter, orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { label: "asc" }] }),
    prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        users: true,
      },
      orderBy: { level: "desc" },
    }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.user.findMany({ where: tenantFilter, include: { roleRef: true }, orderBy: { name: "asc" } }),
    prisma.operationalRule.findMany({ where: tenantFilter, orderBy: [{ enabled: "desc" }, { severity: "asc" }, { name: "asc" }] }),
    prisma.auditLog.findMany({ where: tenantFilter, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.tenant.findUnique({ where: { id: session.tenantId } }),
    prisma.branch.findMany({ where: tenantFilter, orderBy: { name: "asc" } }),
    prisma.subscription.findUnique({ where: { tenantId: session.tenantId } }),
    prisma.invitation.findMany({ where: tenantFilter, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.device.findMany({ where: tenantFilter, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.notification.findMany({ where: tenantFilter, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return {
    tenant,
    session,
    branches,
    company,
    subscription,
    invitations,
    devices,
    notifications,
    options,
    optionsByKind: options.reduce<Record<string, typeof options>>((groups, option) => {
      groups[option.kind] = [...(groups[option.kind] ?? []), option];
      return groups;
    }, {}),
    roles,
    permissions,
    permissionsByModule: permissions.reduce<Record<string, typeof permissions>>((groups, permission) => {
      groups[permission.module] = [...(groups[permission.module] ?? []), permission];
      return groups;
    }, {}),
    users,
    rules,
    auditLogs,
  };
});
