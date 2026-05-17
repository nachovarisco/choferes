import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Building2, CheckCircle2, Clock, MapPin, Package } from "lucide-react";
import { Badge, DataTable, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import type { TripStop } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function ClientesDelViajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const trip = data.trips.find((item) => item.slug === id.toLowerCase());

  if (!trip) {
    notFound();
  }

  const findClient = (slug: string) => data.clients.find((client) => client.slug === slug);
  const clients = trip.clientSlugs.map((slug) => findClient(slug)).filter((client) => Boolean(client));
  const turnClients = clients.filter((client) => client?.requiresTurn).length;

  return (
    <div>
      <PageHeader
        eyebrow={`Viajes / ${trip.id}`}
        title="Clientes y paradas del viaje"
        description="Vista unificada de todos los clientes incluidos en este viaje, con requisitos, turnos y paradas."
        actions={
          <>
            <LinkButton href={`/viajes/${trip.slug}`}>Volver al viaje</LinkButton>
            <LinkButton href="/clientes" tone="dark">
              Ver cartera completa
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Clientes" value={String(clients.length)} icon={<Building2 size={18} />} />
        <StatCard title="Paradas" value={String(trip.stops.length)} icon={<MapPin size={18} />} tone="blue" />
        <StatCard title="Requieren turno" value={String(turnClients)} icon={<Clock size={18} />} tone={turnClients > 0 ? "amber" : "green"} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {trip.clientSlugs.map((slug) => {
          const client = findClient(slug);
          const stops = trip.stops.filter((stop) => stop.clientSlug === slug);

          if (!client) {
            return null;
          }

          return (
            <Panel
              key={client.slug}
              title={client.name}
              action={
                <Link href={`/clientes/${client.slug}`} className="text-sm font-medium text-blue-600 hover:underline">
                  Ficha cliente
                </Link>
              }
            >
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <Badge key={tag} tone={client.requiresTurn ? "amber" : "slate"}>
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-950">Requisitos documentales</p>
                <div className="flex flex-wrap gap-2">
                  {client.requirements.map((requirement) => (
                    <Badge key={requirement} tone="green">
                      <CheckCircle2 size={14} />
                      {requirement}
                    </Badge>
                  ))}
                </div>
              </div>

              <DataTable
                data={stops}
                getKey={(stop) => `${client.slug}-${stop.number}`}
                columns={[
                  { header: "Parada", cell: (stop) => `#${stop.number}` },
                  { header: "Dirección", cell: (stop) => stop.address },
                  { header: "Mercadería", cell: (stop) => <StopGoods stop={stop} /> },
                  {
                    header: "Estado",
                    cell: (stop) => <Badge tone={stop.delivered ? "green" : stop.alert ? "amber" : "blue"}>{stop.status}</Badge>,
                  },
                ]}
              />
            </Panel>
          );
        })}
      </section>
    </div>
  );
}

function StopGoods({ stop }: { stop: TripStop }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Package size={16} />
      {stop.goods}
      {stop.alert ? (
        <Badge tone="amber">
          <AlertTriangle size={14} />
          {stop.alert}
        </Badge>
      ) : null}
    </span>
  );
}
