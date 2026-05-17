import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Building2, CheckCircle2, Clock, Phone, User } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/ui";
import { statusTone, tripRoute } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const client = data.clients.find((item) => item.slug === id.toLowerCase());

  if (!client) {
    notFound();
  }

  const clientTrips = data.trips.filter((trip) => trip.clientSlugs.includes(client.slug));
  const findDriver = (slug: string) => data.drivers.find((driver) => driver.slug === slug);
  const findUnit = (unitId: string) => data.units.find((unit) => unit.id === unitId);

  return (
    <div>
      <PageHeader
        eyebrow="Clientes"
        title={client.name}
        description="Ficha operativa del cliente, requisitos, contactos y viajes recientes."
      />

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-200">
              <Building2 size={26} className="text-slate-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{client.name}</h2>
              <p className="text-sm text-slate-500">{client.code} · {client.contact}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <Badge key={tag} tone={client.requiresTurn ? "amber" : "slate"}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-700" />
            <h2 className="font-semibold text-amber-900">Atención</h2>
          </div>
          <p className="text-sm text-amber-900">
            {client.requiresTurn ? "Este cliente requiere pedir turno antes de descargar." : "Revisar condiciones particulares antes de enviar unidad."}
          </p>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Viajes este mes" value={String(client.tripsThisMonth)} icon={<Building2 size={18} />} />
        <StatCard title="Demora promedio" value={client.delayAverage} icon={<Clock size={18} />} tone={client.openIncidents > 0 ? "amber" : "green"} />
        <StatCard title="Incidencias abiertas" value={String(client.openIncidents)} icon={<AlertTriangle size={18} />} tone={client.openIncidents > 0 ? "red" : "green"} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Contactos">
          <Info icon={<User size={18} />} text={client.contact} />
          <Info icon={<Building2 size={18} />} text={`Código: ${client.code}`} />
          <Info icon={<Phone size={18} />} text={client.phone} />
          <Info icon={<Clock size={18} />} text={`Recepción: ${client.reception}`} />
        </Panel>

        <Panel title="Requisitos documentales">
          {client.requirements.map((requirement) => (
            <Doc key={requirement} text={requirement} />
          ))}
        </Panel>

        <Panel title="Indicadores">
          <Metric label="Viajes este mes" value={String(client.tripsThisMonth)} />
          <Metric label="Demora promedio" value={client.delayAverage} />
          <Metric label="Incidencias abiertas" value={String(client.openIncidents)} danger={client.openIncidents > 0} />
        </Panel>
      </section>

      <section className="mt-6">
        <DataTable
          data={clientTrips}
          getKey={(trip) => trip.slug}
          emptyText="Este cliente todavía no tiene viajes cargados."
          columns={[
            {
              header: "Viaje",
              cell: (trip) => (
                <Link href={`/viajes/${trip.slug}`} className="font-medium text-blue-600 hover:underline">
                  {trip.id}
                </Link>
              ),
            },
            { header: "Ruta", cell: (trip) => tripRoute(trip) },
            { header: "Chofer", cell: (trip) => findDriver(trip.driverSlug)?.name ?? "Sin chofer" },
            { header: "Unidad", cell: (trip) => findUnit(trip.unitId)?.plate ?? "Sin unidad" },
            { header: "Estado", cell: (trip) => <Badge tone={statusTone(trip.status)}>{trip.status}</Badge> },
          ]}
        />
      </section>
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      {text}
    </div>
  );
}

function Doc({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <CheckCircle2 size={18} className="text-emerald-600" />
      {text}
    </div>
  );
}

function Metric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-bold ${danger ? "text-red-600" : "text-slate-950"}`}>{value}</span>
    </div>
  );
}
