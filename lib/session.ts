import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const defaultTenantId = "tnx";
export const defaultTenantCode = "TNX-4421";

export type MockSession = {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  userId: string;
  userName: string;
  role: string;
  branch: string;
};

export async function getMockSession(): Promise<MockSession> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("nexo-tenant-id")?.value || defaultTenantId;
  const userId = cookieStore.get("nexo-user-id")?.value || "usr-ignacio";
  const [tenant, user] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }).catch(() => null),
    prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { roleRef: true },
    }).catch(() => null),
  ]);

  return {
    tenantId,
    tenantCode: tenant?.code ?? defaultTenantCode,
    tenantName: tenant?.name ?? "Transporte Nexo",
    userId: user?.id ?? userId,
    userName: user?.name ?? "Ignacio",
    role: user?.roleRef?.slug ?? user?.role.toLowerCase() ?? "administrador",
    branch: user?.branch ?? "Parana",
  };
}

export async function ensureTenantDefaults() {
  await prisma.tenant.upsert({
    where: { id: defaultTenantId },
    update: {
      code: defaultTenantCode,
      name: "Transporte Nexo",
      legalName: "Transporte Nexo SRL",
      plan: "Profesional",
      status: "Activo",
    },
    create: {
      id: defaultTenantId,
      code: defaultTenantCode,
      name: "Transporte Nexo",
      legalName: "Transporte Nexo SRL",
      plan: "Profesional",
      status: "Activo",
    },
  });

  await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: defaultTenantId, code: "PAR" } },
    update: { name: "Parana", status: "Activa" },
    create: {
      tenantId: defaultTenantId,
      code: "PAR",
      name: "Parana",
      city: "Parana",
      status: "Activa",
    },
  });

  await prisma.subscription.upsert({
    where: { tenantId: defaultTenantId },
    update: { plan: "Profesional", status: "Activa" },
    create: {
      tenantId: defaultTenantId,
      plan: "Profesional",
      status: "Activa",
      usersLimit: 30,
      driversLimit: 80,
      unitsLimit: 80,
      storageLimitMb: 10240,
    },
  });
}
