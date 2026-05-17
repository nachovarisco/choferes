import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { updateTripStopAction } from "@/app/actions";
import { Badge, Button, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import {
  money,
  statusTone,
  tripRoute,
  type Client,
  type TripStop,
} from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function ViajeDetallePage({
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
  const driver = data.drivers.find((item) => item.slug === trip.driverSlug);
  const unit = data.units.find((item) => item.id === trip.unitId);
  const deliveredStops = trip.stops.filter((stop) => stop.delivered).length;
  const balance = trip.assignedCash - trip.spentCash;

  return (
    <div>
      <PageHeader
        eyebrow="Viajes"
        title={trip.id}
        description="Seguimiento operativo del viaje, paradas, documentación e incidencias."
        actions={
          <>
            <LinkButton href={`/viajes/${trip.slug}/rendicion`}>
              <Wallet size={18} />
              Ver rendición
            </LinkButton>
            <LinkButton href="/viajes" tone="dark">
              Volver a viajes
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Estado general" value={trip.status} icon={<Truck size={18} />} tone={statusTone(trip.status)} />
        <StatCard title="Paradas" value={String(trip.stops.length)} icon={<MapPin size={18} />} />
        <StatCard title="Entregadas" value={`${deliveredStops} / ${trip.stops.length}`} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard title="Saldo de caja" value={money(balance)} icon={<Wallet size={18} />} tone={balance < 0 ? "red" : "green"} />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Asignación">
          <InfoLink icon={<User size={18} />} href={driver ? `/choferes/${driver.slug}` : undefined}>
            {driver?.name ?? "Sin chofer"}
          </InfoLink>
          <InfoLink icon={<Truck size={18} />} href={unit ? `/unidades/${unit.id}` : undefined}>
            {unit ? `${unit.brand} ${unit.model} · ${unit.plate}` : "Sin unidad"}
          </InfoLink>
          <InfoLine icon={<Clock size={18} />}>Fecha carga: {trip.date}</InfoLine>
          <InfoLine icon={<MapPin size={18} />}>Ruta: {tripRoute(trip)}</InfoLine>
        </Panel>

        <Panel title="Documentación">
          <Doc text="Licencia chofer vigente" />
          <Doc text="Seguro unidad vigente" />
          <Doc text="VTV vigente" />
          <Doc text="Remitos pendientes de subir" warning />
        </Panel>

        <Panel title="Atención requerida">
          <Incident text={trip.alert} tone={trip.alert === "Sin alertas" ? "green" : "amber"} />
          <Incident text="Confirmar remito físico al entregar" tone="slate" />
          <Incident text="Sin incidencias críticas" tone="green" />
        </Panel>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-semibold text-slate-950">Paradas del viaje</h2>
        <div className="space-y-5">
          {trip.stops.map((stop) => (
            <StopCard key={`${trip.slug}-${stop.number}`} client={findClient(stop.clientSlug)} stop={stop} tripSlug={trip.slug} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Timeline operativo">
          {trip.timeline.map((event) => (
            <Timeline key={`${event.time}-${event.text}`} time={event.time} text={event.text} state={event.state} />
          ))}
        </Panel>

        <Panel title="Devoluciones / incidencias">
          {trip.stops.map((stop) => (
            <Incident
              key={`${stop.number}-${stop.returnInfo ?? stop.status}`}
              text={stop.returnInfo ?? `${findClient(stop.clientSlug)?.name ?? "Cliente"} pendiente de entrega`}
              tone={stop.delivered ? "green" : stop.alert ? "amber" : "slate"}
            />
          ))}
        </Panel>
      </section>
    </div>
  );
}

function InfoLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      {children}
    </div>
  );
}

function InfoLink({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-500">{icon}</span>
      {href ? (
        <Link href={href} className="font-medium text-blue-600 hover:underline">
          {children}
        </Link>
      ) : (
        <span className="text-slate-600">{children}</span>
      )}
    </div>
  );
}

function Doc({ text, warning = false }: { text: string; warning?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${warning ? "text-amber-700" : "text-slate-600"}`}>
      {warning ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-600" />}
      {text}
    </div>
  );
}

function Incident({ text, tone }: { text: string; tone: "slate" | "green" | "amber" | "red" }) {
  return <Badge tone={tone}>{text}</Badge>;
}

function StopCard({ client, stop, tripSlug }: { client?: Client; stop: TripStop; tripSlug: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${stop.delivered ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
            {stop.number}
          </div>

          <div>
            <Link href={`/clientes/${client?.slug ?? stop.clientSlug}`} className="font-semibold text-blue-600 hover:underline">
              {client?.name ?? stop.clientSlug}
            </Link>
            <p className="mt-1 text-sm text-slate-500">{stop.address}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Package size={16} />
                {stop.goods}
              </span>
              <span className="inline-flex items-center gap-2">
                <FileText size={16} />
                {stop.note}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Badge tone={stop.delivered ? "green" : "blue"}>{stop.status}</Badge>
          {stop.alert ? <Badge tone="amber">{stop.alert}</Badge> : null}
          {!stop.delivered ? (
            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
              <form action={updateTripStopAction}>
                <input type="hidden" name="tripSlug" value={tripSlug} />
                <input type="hidden" name="stopNumber" value={stop.number} />
                <input type="hidden" name="status" value="Entregado" />
                <input type="hidden" name="returnInfo" value="Entrega confirmada" />
                <Button type="submit" tone="light" className="min-h-9 px-3 py-1 text-xs">
                  Marcar entregado
                </Button>
              </form>
              <form action={updateTripStopAction}>
                <input type="hidden" name="tripSlug" value={tripSlug} />
                <input type="hidden" name="stopNumber" value={stop.number} />
                <input type="hidden" name="status" value="No disponible" />
                <input type="hidden" name="returnInfo" value="Pendiente de reprogramación" />
                <Button type="submit" tone="light" className="min-h-9 px-3 py-1 text-xs">
                  No disponible
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Timeline({
  time,
  text,
  state,
}: {
  time: string;
  text: string;
  state: "done" | "active" | "pending";
}) {
  const color = state === "done" ? "bg-emerald-500" : state === "active" ? "bg-blue-500" : "bg-slate-300";

  return (
    <div className="flex gap-3">
      <div className={`mt-1.5 h-3 w-3 rounded-full ${color}`} />
      <div>
        <p className="text-sm font-medium text-slate-950">{time}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
