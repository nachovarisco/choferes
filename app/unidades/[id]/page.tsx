import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, FileText, Shield, Truck, User } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/ui";
import { statusTone, tripRoute } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function UnidadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const unit = data.units.find((item) => item.id === id.toLowerCase());

  if (!unit) {
    notFound();
  }

  const findDriver = (slug: string) => data.drivers.find((driver) => driver.slug === slug);
  const driver = unit.driverSlug ? findDriver(unit.driverSlug) : undefined;
  const unitTrips = data.trips.filter((trip) => trip.unitId === unit.id);

  return (
    <div>
      <PageHeader
        eyebrow="Unidades"
        title={unit.plate}
        description="Estado operativo, chofer asignado, documentación y mantenimiento."
      />

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Truck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {unit.brand} {unit.model} · {unit.plate}
              </h2>
              <p className="text-sm text-slate-500">Semirremolque asignado · Base {unit.base}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={statusTone(unit.status)}>{unit.status}</Badge>
                {unit.technicalNotes.map((note) => (
                  <Badge key={note} tone={unit.hasRisk ? "amber" : "slate"}>
                    {note}
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
          <p className="text-sm text-amber-900">Próximo service recomendado: {unit.serviceDue}.</p>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Km actuales" value={unit.km.toLocaleString("es-AR")} icon={<Clock size={18} />} />
        <StatCard title="Viajes registrados" value={String(unitTrips.length)} icon={<Truck size={18} />} />
        <StatCard title="Documentos" value={unit.docs.length.toString()} icon={<FileText size={18} />} tone={unit.hasRisk ? "amber" : "green"} />
        <StatCard title="Estado general" value={unit.hasRisk ? "Revisar" : "Bueno"} icon={<Shield size={18} />} tone={unit.hasRisk ? "red" : "green"} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Datos de la unidad">
          <Info icon={<Truck size={18} />} text={`Marca: ${unit.brand}`} />
          <Info icon={<Truck size={18} />} text={`Modelo: ${unit.model}`} />
          <Info icon={<FileText size={18} />} text={`Patente: ${unit.plate}`} />
          <Info icon={<Clock size={18} />} text={`Km actuales: ${unit.km.toLocaleString("es-AR")}`} />
        </Panel>

        <Panel title="Chofer asignado">
          {driver ? (
            <Link href={`/choferes/${driver.slug}`} className="flex items-center gap-3 text-sm font-medium text-blue-600 hover:underline">
              <User size={18} />
              {driver.name}
            </Link>
          ) : (
            <Info icon={<User size={18} />} text="Sin chofer asignado" />
          )}
          <Info icon={<Clock size={18} />} text={driver ? `Última actividad: ${driver.lastActivity}` : "Sin actividad reciente"} />
          <Info icon={<Truck size={18} />} text={unitTrips[0] ? "Viaje actual activo" : "Sin viaje activo"} />
        </Panel>

        <Panel title="Documentación">
          {unit.docs.map((doc) => (
            <Doc key={doc} text={doc} danger={doc.toLowerCase().includes("venc")} />
          ))}
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Mantenimiento">
          <Metric label="Último service" value="Hace 22 días" />
          <Metric label="Próximo service" value={unit.serviceDue} />
          <Metric label="Alertas técnicas" value={unit.technicalNotes.length.toString()} danger={unit.hasRisk} />
          <Metric label="Estado general" value={unit.hasRisk ? "Revisar" : "Bueno"} />
        </Panel>

        <Panel title="Viaje actual">
          {unitTrips[0] ? (
            <>
              <Info icon={<Truck size={18} />} text={unitTrips[0].id} />
              <Info icon={<Clock size={18} />} text={tripRoute(unitTrips[0])} />
              <Info icon={<User size={18} />} text={findDriver(unitTrips[0].driverSlug)?.name ?? "Sin chofer"} />
              <Info icon={<Shield size={18} />} text={`Estado: ${unitTrips[0].status}`} />
            </>
          ) : (
            <Info icon={<Truck size={18} />} text="Sin viaje activo" />
          )}
        </Panel>

        <Panel title="Alertas recientes">
          {unit.technicalNotes.map((note) => (
            <Badge key={note} tone={unit.hasRisk ? "amber" : "green"}>
              {note}
            </Badge>
          ))}
        </Panel>
      </section>

      <section className="mt-6">
        <DataTable
          data={unitTrips}
          getKey={(trip) => trip.slug}
          emptyText="Esta unidad todavía no tiene viajes cargados."
          columns={[
            {
              header: "Viaje",
              cell: (trip) => (
                <Link href={`/viajes/${trip.slug}`} className="font-medium text-blue-600 hover:underline">
                  {trip.id}
                </Link>
              ),
            },
            { header: "Chofer", cell: (trip) => findDriver(trip.driverSlug)?.name ?? "Sin chofer" },
            { header: "Ruta", cell: (trip) => tripRoute(trip) },
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

function Doc({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {danger ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-600" />}
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
