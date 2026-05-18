import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  cashMovements,
  clients,
  documents,
  drivers,
  incidents,
  maintenanceJobs,
  orders,
  trips,
  units,
} from "../lib/data";

const prisma = new PrismaClient();
const tenantId = "tnx";

function json(value: unknown) {
  return JSON.stringify(value);
}

function parseDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.device.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.cashMovement.deleteMany();
  await prisma.maintenanceJob.deleteMany();
  await prisma.document.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.operationalConfirmation.deleteMany();
  await prisma.tripTimeline.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.tripClient.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.loadOrder.deleteMany();
  await prisma.clientHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.operationalRule.deleteMany();
  await prisma.configOption.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.client.deleteMany();

  await prisma.tenant.create({
    data: {
      id: tenantId,
      code: "TNX-4421",
      name: "Transporte Nexo",
      legalName: "Transporte Nexo SRL",
      plan: "Profesional",
      status: "Activo",
    },
  });

  await prisma.branch.createMany({
    data: [
      { tenantId, code: "PAR", name: "Parana", city: "Parana", status: "Activa" },
      { tenantId, code: "ROS", name: "Rosario", city: "Rosario", status: "Activa" },
    ],
  });

  await prisma.subscription.create({
    data: {
      tenantId,
      plan: "Profesional",
      status: "Activa",
      usersLimit: 30,
      driversLimit: 80,
      unitsLimit: 80,
      storageLimitMb: 10240,
    },
  });

  await prisma.companySettings.create({
    data: {
      id: `company-${tenantId}`,
      tenantId,
      name: "Transporte Nexo",
      legalName: "Transporte Nexo SRL",
      branchName: "Parana",
      country: "Argentina",
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires",
    },
  });

  await prisma.user.create({
    data: {
      id: "usr-ignacio",
      tenantId,
      name: "Ignacio",
      email: "ignacio@nexo.local",
      passwordHash: await bcrypt.hash("nexo1234", 12),
      role: "ADMIN",
      branch: "Paraná",
    },
  });

  for (const unit of units) {
    await prisma.unit.create({
      data: {
        id: unit.id,
        tenantId,
        brand: unit.brand,
        model: unit.model,
        plate: unit.plate,
        status: unit.status,
        base: unit.base,
        km: unit.km,
        docs: json(unit.docs),
        technicalNotes: json(unit.technicalNotes),
        serviceDue: unit.serviceDue,
        hasRisk: unit.hasRisk,
      },
    });
  }

  for (const driver of drivers) {
    await prisma.driver.create({
      data: {
        id: driver.slug,
        tenantId,
        slug: driver.slug,
        name: driver.name,
        initials: driver.initials,
        status: driver.status,
        category: driver.category,
        phone: driver.phone,
        dni: driver.dni,
        license: driver.license,
        licenseRisk: driver.licenseRisk,
        tripsThisMonth: driver.tripsThisMonth,
        punctuality: driver.punctuality,
        incidents: driver.incidents,
        lastActivity: driver.lastActivity,
        unitId: driver.unitId,
      },
    });
  }

  for (const client of clients) {
    await prisma.client.create({
      data: {
        id: client.slug,
        tenantId,
        code: client.code,
        slug: client.slug,
        name: client.name,
        contact: client.contact,
        phone: client.phone,
        reception: client.reception,
        tripsThisMonth: client.tripsThisMonth,
        status: client.status,
        requiresTurn: client.requiresTurn,
        tags: json(client.tags),
        requirements: json(client.requirements),
        delayAverage: client.delayAverage,
        openIncidents: client.openIncidents,
        histories: {
          create: {
            event: "Estado inicial",
            detail: `Cliente ${client.code} cargado en la base inicial.`,
            snapshot: json({
              code: client.code,
              name: client.name,
              contact: client.contact,
              phone: client.phone,
              reception: client.reception,
              status: client.status,
              requiresTurn: client.requiresTurn,
              tags: client.tags,
              requirements: client.requirements,
            }),
          },
        },
      },
    });
  }

  for (const trip of trips) {
    await prisma.trip.create({
      data: {
        id: trip.slug,
        tenantId,
        code: trip.id,
        slug: trip.slug,
        origin: trip.origin,
        destination: trip.destination,
        status: trip.status,
        alert: trip.alert,
        date: parseDate(trip.date),
        assignedCash: trip.assignedCash,
        spentCash: trip.spentCash,
        mainClientId: trip.mainClientSlug,
        driverId: trip.driverSlug,
        unitId: trip.unitId,
        clients: {
          create: trip.clientSlugs.map((clientSlug) => ({
            client: { connect: { id: clientSlug } },
          })),
        },
        stops: {
          create: trip.stops.map((stop) => ({
            number: stop.number,
            clientCode: clients.find((client) => client.slug === stop.clientSlug)?.code ?? "",
            clientName: clients.find((client) => client.slug === stop.clientSlug)?.name ?? stop.clientSlug,
            contact: clients.find((client) => client.slug === stop.clientSlug)?.contact ?? "",
            reception: clients.find((client) => client.slug === stop.clientSlug)?.reception ?? "",
            requiresTurn: clients.find((client) => client.slug === stop.clientSlug)?.requiresTurn ?? false,
            turnStatus: clients.find((client) => client.slug === stop.clientSlug)?.requiresTurn ? "Requiere pedir turno" : "No requiere turno",
            address: stop.address,
            goods: stop.goods,
            status: stop.status,
            note: stop.note,
            delivered: stop.delivered,
            alert: stop.alert,
            returnInfo: stop.returnInfo,
            client: { connect: { id: stop.clientSlug } },
          })),
        },
        timeline: {
          create: trip.timeline.map((event, index) => ({
            time: event.time,
            text: event.text,
            state: event.state,
            order: index + 1,
          })),
        },
      },
    });
  }

  for (const order of orders) {
    await prisma.loadOrder.create({
      data: {
        id: order.slug,
        tenantId,
        code: order.code,
        slug: order.slug,
        clientId: order.clientSlug,
        load: order.load,
        origin: order.origin,
        destination: order.destination,
        driverId: order.driverSlug,
        unitId: order.unitId,
        status: order.status,
        docs: order.docs,
        risk: order.risk,
      },
    });
  }

  for (const document of documents) {
    await prisma.document.create({
      data: {
        id: document.id,
        tenantId,
        name: document.name,
        owner: document.owner,
        association: document.association,
        type: document.type,
        due: document.due,
        status: document.status,
      },
    });
  }

  for (const incident of incidents) {
    await prisma.incident.create({
      data: {
        id: incident.id,
        tenantId,
        type: incident.type,
        title: incident.title,
        detail: incident.detail,
        tone: incident.tone,
        status: incident.type === "Resuelta" ? "Cerrada" : "Abierta",
      },
    });
  }

  for (const movement of cashMovements) {
    await prisma.cashMovement.create({
      data: {
        id: movement.id,
        tenantId,
        date: parseDate(movement.date),
        type: movement.type,
        category: movement.category,
        tripId: movement.tripSlug,
        driverId: movement.driverSlug,
        unitId: movement.unitId,
        amount: movement.amount,
        status: movement.status,
        risk: movement.risk ?? false,
      },
    });
  }

  for (const job of maintenanceJobs) {
    await prisma.maintenanceJob.create({
      data: {
        id: job.id,
        tenantId,
        unitId: job.unitId,
        issue: job.issue,
        status: job.status,
        next: job.next,
        risk: job.risk,
      },
    });
  }

  await prisma.invitation.createMany({
    data: [
      {
        tenantId,
        code: "TNX-ADM-001",
        email: "admin.demo@nexo.local",
        role: "administrativo",
        status: "Pendiente",
      },
      {
        tenantId,
        code: "TNX-CHF-001",
        phone: "3435551200",
        role: "chofer",
        status: "Pendiente",
      },
    ],
  });

  await prisma.device.createMany({
    data: [
      {
        tenantId,
        userId: "usr-ignacio",
        label: "MacBook Operaciones",
        platform: "Web",
        status: "Activo",
        lastSeenAt: new Date(),
      },
      {
        tenantId,
        driverId: "juan-perez",
        label: "Celular Juan Perez",
        platform: "PWA Android",
        status: "Activo",
        lastSeenAt: new Date(),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        tenantId,
        driverId: "juan-perez",
        title: "Tenes un viaje asignado",
        body: "VJ-000124 listo para confirmar recepcion.",
        priority: "Alta",
        status: "Pendiente",
      },
      {
        tenantId,
        title: "Documento por vencer",
        body: "Licencia profesional de Juan Perez vence pronto.",
        priority: "Media",
        status: "Pendiente",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
