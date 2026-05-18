import { Badge, DataTable, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function InvitacionPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Invitaciones"
        description="Codigos de invitacion guardados por tenant para alta futura de administrativos y choferes."
        actions={<LinkButton href="/registro" tone="dark">Registro demo</LinkButton>}
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Codigo empresa" value={data.session.tenantCode} />
        <StatCard title="Invitaciones" value={String(data.invitations.length)} tone="blue" />
        <StatCard title="Pendientes" value={String(data.invitations.filter((item) => item.status === "Pendiente").length)} tone="amber" />
      </section>
      <DataTable
        data={data.invitations}
        getKey={(item) => item.id}
        columns={[
          { header: "Codigo", cell: (item) => <span className="font-mono text-xs">{item.code}</span> },
          { header: "Contacto", cell: (item) => item.email || item.phone || "-" },
          { header: "Rol", cell: (item) => <Badge tone={item.role === "chofer" ? "green" : "blue"}>{item.role}</Badge> },
          { header: "Estado", cell: (item) => <Badge tone={item.status === "Pendiente" ? "amber" : "green"}>{item.status}</Badge> },
          { header: "Creada", cell: (item) => item.createdAt.toLocaleString("es-AR") },
        ]}
      />
    </div>
  );
}
