import { Badge, DataTable, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function SucursalesPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Sucursales"
        description="Bases operativas reales del tenant activo para preparar caja, flota y usuarios por base."
        actions={<LinkButton href="/configuracion" tone="dark">Configurar empresa</LinkButton>}
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Tenant" value={data.tenant?.code ?? data.session.tenantCode} />
        <StatCard title="Sucursales" value={String(data.branches.length)} tone="blue" />
        <StatCard title="Activas" value={String(data.branches.filter((branch) => branch.status === "Activa").length)} tone="green" />
      </section>
      <DataTable
        data={data.branches}
        getKey={(branch) => branch.id}
        columns={[
          { header: "Codigo", cell: (branch) => <span className="font-mono text-xs">{branch.code}</span> },
          { header: "Sucursal", cell: (branch) => <span className="font-medium text-slate-950">{branch.name}</span> },
          { header: "Ciudad", cell: (branch) => branch.city || "-" },
          { header: "Direccion", cell: (branch) => branch.address || "-" },
          { header: "Estado", cell: (branch) => <Badge tone={branch.status === "Activa" ? "green" : "slate"}>{branch.status}</Badge> },
        ]}
      />
    </div>
  );
}
