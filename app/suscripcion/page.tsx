import { Badge, Card, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function SuscripcionPage() {
  const data = await getConfigurationData();
  const sub = data.subscription;

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Suscripcion local"
        description="Plan y limites guardados en SQLite por tenant. Todavia no hay pasarela de pago real."
        actions={<LinkButton href="/planes" tone="dark">Ver planes</LinkButton>}
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Plan" value={sub?.plan ?? "Sin plan"} />
        <StatCard title="Estado" value={sub?.status ?? "Pendiente"} tone={sub?.status === "Activa" ? "green" : "amber"} />
        <StatCard title="Usuarios" value={`${data.users.length} / ${sub?.usersLimit ?? 0}`} tone="blue" />
        <StatCard title="Unidades" value={`${data.session.tenantCode}`} tone="purple" />
      </section>
      <Card className="p-6">
        <h2 className="font-semibold text-slate-950">Limites actuales</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Limit label="Usuarios" value={sub?.usersLimit ?? 0} />
          <Limit label="Choferes" value={sub?.driversLimit ?? 0} />
          <Limit label="Unidades" value={sub?.unitsLimit ?? 0} />
          <Limit label="Storage MB" value={sub?.storageLimitMb ?? 0} />
        </div>
        <Badge tone="blue" className="mt-5">Feature flags por plan quedan para Fase 3</Badge>
      </Card>
    </div>
  );
}

function Limit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value.toLocaleString("es-AR")}</p>
    </div>
  );
}
