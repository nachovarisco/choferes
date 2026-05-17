import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, FileText, Phone, Shield, Truck, User } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/ui";
import { statusTone, tripRoute } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function ChoferDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const driver = data.drivers.find((item) => item.slug === id.toLowerCase());

  if (!driver) {
    notFound();
  }

  const unit = driver.unitId ? data.units.find((item) => item.id === driver.unitId) : undefined;
  const driverTrips = data.trips.filter((trip) => trip.driverSlug === driver.slug);
  const findUnit = (unitId: string) => data.units.find((item) => item.id === unitId);

  return (
    <div>
      <PageHeader
        eyebrow="Choferes"
        title={driver.name}
        description="Legajo operativo, unidad asignada, documentación, viajes e incidencias."
      />

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-950 text-xl font-bold text-white">
              {driver.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{driver.name}</h2>
              <p className="text-sm text-slate-500">
                {driver.phone} · DNI {driver.dni}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={driver.category === "Tercero" ? "purple" : driver.category === "Mixto" ? "green" : "blue"}>{driver.category}</Badge>
                <Badge tone={statusTone(driver.status)}>{driver.status}</Badge>
                {driver.licenseRisk ? <Badge tone="amber">Licencia por vencer</Badge> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-700" />
            <h2 className="font-semibold text-amber-900">Atención</h2>
          </div>
          <p className="text-sm text-amber-900">{driver.license}</p>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Viajes realizados" value={String(driver.tripsThisMonth)} icon={<Truck size={18} />} />
        <StatCard title="Puntualidad" value={`${driver.punctuality}%`} icon={<Clock size={18} />} tone="green" />
        <StatCard title="Incidencias" value={String(driver.incidents)} icon={<AlertTriangle size={18} />} tone={driver.incidents > 0 ? "red" : "green"} />
        <StatCard title="Última actividad" value={driver.lastActivity} icon={<Clock size={18} />} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Datos del chofer">
          <Info icon={<User size={18} />} text={`Categoría: ${driver.category}`} />
          <Info icon={<Phone size={18} />} text={`Teléfono: ${driver.phone}`} />
          <Info icon={<Shield size={18} />} text={`Estado: ${driver.status}`} />
          <Info icon={<Clock size={18} />} text={`Última actividad: ${driver.lastActivity}`} />
        </Panel>

        <Panel title="Unidad asignada">
          {unit ? (
            <Link href={`/unidades/${unit.id}`} className="flex items-center gap-3 text-sm font-medium text-blue-600 hover:underline">
              <Truck size={18} />
              {unit.brand} {unit.model} · {unit.plate}
            </Link>
          ) : (
            <Info icon={<Truck size={18} />} text="Sin unidad asignada" />
          )}
          {unit?.docs.map((doc) => (
            <Info key={doc} icon={<CheckCircle2 size={18} />} text={doc} />
          ))}
          <Info icon={<Clock size={18} />} text={unit ? `Service: ${unit.serviceDue}` : "Sin service programado"} />
        </Panel>

        <Panel title="Documentación personal">
          <Doc text="DNI cargado" />
          <Doc text={driver.license} danger={driver.licenseRisk} />
          <Doc text="ART vigente" />
          <Doc text="Apto médico vigente" />
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Viaje actual">
          {driverTrips[0] ? (
            <>
              <Info icon={<Truck size={18} />} text={`${driverTrips[0].id} · ${tripRoute(driverTrips[0])}`} />
              <Info icon={<Clock size={18} />} text={`Estado: ${driverTrips[0].status}`} />
              <Info icon={<FileText size={18} />} text="Documentación completa" />
              <Info icon={<AlertTriangle size={18} />} text={driverTrips[0].alert} />
            </>
          ) : (
            <Info icon={<Truck size={18} />} text="Sin viaje activo" />
          )}
        </Panel>

        <Panel title="Incidencias recientes" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Badge tone="amber">Demora 4 hs en descarga Easy</Badge>
            <Badge tone="slate">Remito cargado fuera de horario</Badge>
            <Badge tone="green">Sin incidencias graves</Badge>
          </div>
        </Panel>
      </section>

      <section className="mt-6">
        <DataTable
          data={driverTrips}
          getKey={(trip) => trip.slug}
          emptyText="Este chofer todavía no tiene viajes cargados."
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

function Doc({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {danger ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-600" />}
      {text}
    </div>
  );
}
