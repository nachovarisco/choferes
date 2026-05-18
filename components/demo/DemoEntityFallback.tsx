"use client";

import Link from "next/link";
import { AlertTriangle, Building2, FileText, MapPin, Truck, User } from "lucide-react";
import { useLiveData } from "@/components/use-live-data";
import { Badge, Card, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { money, statusTone, tripRoute } from "@/lib/data";

type EntityKind = "trip" | "client" | "driver" | "unit" | "incident";

export function DemoEntityFallback({ kind, id }: { kind: EntityKind; id: string }) {
  const data = useLiveData();
  const normalized = id.toLowerCase();
  const trip = kind === "trip" ? data.trips.find((item) => item.slug === normalized) : undefined;
  const client = kind === "client" ? data.clients.find((item) => item.slug === normalized) : undefined;
  const driver = kind === "driver" ? data.drivers.find((item) => item.slug === normalized) : undefined;
  const unit = kind === "unit" ? data.units.find((item) => item.id === normalized) : undefined;
  const incident = kind === "incident" ? data.incidents.find((item) => item.id.toLowerCase() === normalized) : undefined;

  if (trip) {
    const driver = data.drivers.find((item) => item.slug === trip.driverSlug);
    const unit = data.units.find((item) => item.id === trip.unitId);

    return (
      <div>
        <PageHeader
          eyebrow="Viaje demo"
          title={trip.id}
          description="Detalle cargado desde el snapshot local de Fase 1."
          actions={<LinkButton href="/viajes" tone="dark">Volver a viajes</LinkButton>}
        />
        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <StatCard title="Estado" value={trip.status} icon={<Truck size={18} />} tone={statusTone(trip.status)} />
          <StatCard title="Paradas" value={String(trip.stops.length)} icon={<MapPin size={18} />} />
          <StatCard title="Caja asignada" value={money(trip.assignedCash)} icon={<FileText size={18} />} />
          <StatCard title="Alerta" value={trip.alert} icon={<AlertTriangle size={18} />} tone={trip.alert === "Sin alertas" ? "green" : "amber"} />
        </section>
        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">{tripRoute(trip)}</h2>
          <p className="mt-2 text-sm text-slate-500">Chofer: {driver?.name ?? "Sin asignar"} - Unidad: {unit?.plate ?? "Sin unidad"}</p>
          <div className="mt-5 space-y-3">
            {trip.stops.map((stop) => (
              <div key={`${trip.slug}-${stop.number}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">Parada {stop.number}: {stop.clientName ?? stop.clientSlug}</p>
                  <Badge tone={statusTone(stop.status)}>{stop.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{stop.address} - {stop.goods}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (client) {
    return (
      <DemoCard
        title={client.name}
        eyebrow="Cliente demo"
        description={`${client.code} - ${client.contact}`}
        backHref="/clientes"
        rows={[
          ["Telefono", client.phone],
          ["Recepcion", client.reception],
          ["Estado", client.status],
          ["Requiere turno", client.requiresTurn ? "Si" : "No"],
        ]}
      />
    );
  }

  if (driver) {
    return (
      <DemoCard
        title={driver.name}
        eyebrow="Chofer demo"
        description={`${driver.phone} - ${driver.category}`}
        backHref="/choferes"
        rows={[
          ["Estado", driver.status],
          ["DNI", driver.dni],
          ["Licencia", driver.license],
          ["Unidad", driver.unitId ?? "Sin asignar"],
        ]}
      />
    );
  }

  if (unit) {
    return (
      <DemoCard
        title={unit.plate}
        eyebrow="Unidad demo"
        description={`${unit.brand} ${unit.model} - Base ${unit.base}`}
        backHref="/unidades"
        rows={[
          ["Estado", unit.status],
          ["Kilometros", unit.km.toLocaleString("es-AR")],
          ["Service", unit.serviceDue],
          ["Documentos", unit.docs.join(" - ")],
        ]}
      />
    );
  }

  if (incident) {
    return (
      <DemoCard
        title={incident.title}
        eyebrow="Incidencia demo"
        description={incident.detail}
        backHref="/alertas"
        rows={[
          ["Prioridad", incident.type],
          ["Estado", incident.type === "Resuelta" ? "Cerrada" : "Abierta"],
          ["Tono", incident.tone],
        ]}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Demo local"
        title="Registro no encontrado"
        description="No existe en la base local ni en el snapshot demo del navegador."
        actions={<LinkButton href="/demo-operativa" tone="dark">Volver a demo</LinkButton>}
      />
      <Card className="p-6">
        <p className="text-sm text-slate-500">
          Si acabas de reiniciar la demo, este registro pudo haberse borrado del navegador.
        </p>
      </Card>
    </div>
  );
}

function DemoCard({
  backHref,
  description,
  eyebrow,
  rows,
  title,
}: {
  backHref: string;
  description: string;
  eyebrow: string;
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={<LinkButton href={backHref} tone="dark">Volver</LinkButton>}
      />
      <Card className="p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
          {eyebrow.includes("Cliente") ? <Building2 size={22} /> : eyebrow.includes("Chofer") ? <User size={22} /> : eyebrow.includes("Unidad") ? <Truck size={22} /> : <AlertTriangle size={22} />}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <Link href="/estado-v1" className="mt-5 inline-flex text-sm font-medium text-blue-600 hover:underline">
          Ver checklist V1
        </Link>
      </Card>
    </div>
  );
}
