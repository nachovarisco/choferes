import { Badge, DataTable, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function DispositivosPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Dispositivos chofer"
        description="Dispositivos, sesiones y notificaciones guardadas por tenant para preparar PWA/push."
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Dispositivos" value={String(data.devices.length)} tone="blue" />
        <StatCard title="Activos" value={String(data.devices.filter((device) => device.status === "Activo").length)} tone="green" />
        <StatCard title="Notificaciones" value={String(data.notifications.length)} tone="amber" />
        <StatCard title="Pendientes" value={String(data.notifications.filter((item) => item.status === "Pendiente").length)} tone="red" />
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DataTable
          data={data.devices}
          getKey={(device) => device.id}
          columns={[
            { header: "Dispositivo", cell: (device) => <span className="font-medium text-slate-950">{device.label}</span> },
            { header: "Plataforma", cell: (device) => device.platform },
            { header: "Estado", cell: (device) => <Badge tone={device.status === "Activo" ? "green" : "slate"}>{device.status}</Badge> },
            { header: "Ultimo uso", cell: (device) => device.lastSeenAt?.toLocaleString("es-AR") ?? "-" },
          ]}
        />
        <DataTable
          data={data.notifications}
          getKey={(item) => item.id}
          columns={[
            { header: "Aviso", cell: (item) => <span className="font-medium text-slate-950">{item.title}</span> },
            { header: "Prioridad", cell: (item) => <Badge tone={item.priority === "Alta" ? "red" : "amber"}>{item.priority}</Badge> },
            { header: "Estado", cell: (item) => item.status },
            { header: "Fecha", cell: (item) => item.createdAt.toLocaleString("es-AR") },
          ]}
        />
      </section>
    </div>
  );
}
