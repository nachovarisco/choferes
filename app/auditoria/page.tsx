import { Badge, DataTable, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function AuditoriaPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Auditoria"
        description="Registro local por tenant, actor, rol, entidad y fecha. Base para trazabilidad operativa."
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Eventos recientes" value={String(data.auditLogs.length)} />
        <StatCard title="Actor actual" value={data.session.userName} tone="blue" />
        <StatCard title="Tenant" value={data.session.tenantCode} tone="green" />
      </section>
      <DataTable
        data={data.auditLogs}
        getKey={(log) => log.id}
        columns={[
          { header: "Accion", cell: (log) => <span className="font-medium text-slate-950">{log.action}</span> },
          { header: "Actor", cell: (log) => `${log.actorName} - ${log.actorRole}` },
          { header: "Entidad", cell: (log) => <Badge>{log.entity}</Badge> },
          { header: "Detalle", cell: (log) => log.detail },
          { header: "Fecha", cell: (log) => log.createdAt.toLocaleString("es-AR") },
        ]}
      />
    </div>
  );
}
