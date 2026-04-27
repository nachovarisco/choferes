import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";

export default function ViajeDetallePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500 mb-2">Viajes / VJ-000124</p>
        <h1 className="text-3xl font-bold text-slate-900">VJ-000124</h1>
        <p className="text-slate-500 mt-1">
          Seguimiento operativo del viaje, paradas, documentación e incidencias.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Kpi title="Estado general" value="En viaje" blue />
        <Kpi title="Paradas" value="2" />
        <Kpi title="Entregadas" value="1 / 2" green />
        <Kpi title="Alertas" value="1" amber />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Panel title="Asignación">
          <Info icon={<User size={18} />} text={
            <Link href="/choferes/juan-perez" className="text-blue-600 hover:underline">
              Juan Pérez
            </Link>
          } />

          <Info icon={<Truck size={18} />} text={
            <Link href="/unidades/ab123cd" className="text-blue-600 hover:underline">
              Volvo 370 · AB123CD
            </Link>
          } />

          <Info icon={<Clock size={18} />} text="Fecha carga: 24/04/2026" />
          <Info icon={<MapPin size={18} />} text="Origen general: Paraná" />
        </Panel>

        <Panel title="Documentación">
          <Doc text="Licencia chofer vigente" />
          <Doc text="Seguro unidad vigente" />
          <Doc text="VTV vigente" />
          <Doc text="Remitos pendientes de subir" warning />
        </Panel>

        <Panel title="Atención requerida">
          <Incident text="Easy requiere turno para descargar" amber />
          <Incident text="Confirmar remito físico al entregar" />
          <Incident text="Sin incidencias críticas" green />
        </Panel>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-5">Paradas del viaje</h2>

        <div className="space-y-5">
          <Stop
            number="1"
            client="Easy"
            slug="easy"
            address="Centro de distribución Buenos Aires"
            goods="Aberturas · 12 bultos"
            status="Entregado"
            note="Requiere turno. Remito físico confirmado."
            delivered
            alert
          />

          <Stop
            number="2"
            client="Dhinox"
            slug="dhinox"
            address="Depósito Zona Sur"
            goods="Mercadería general · 6 bultos"
            status="En camino"
            note="Avisar 30 minutos antes de llegar."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Timeline operativo">
          <Timeline time="08:00" text="Viaje asignado a Juan Pérez" done />
          <Timeline time="09:15" text="Unidad cargada en Paraná" done />
          <Timeline time="10:05" text="Salida a ruta" done />
          <Timeline time="15:40" text="Entrega Easy completada" done />
          <Timeline time="Ahora" text="En camino a Dhinox" active />
        </Panel>

        <Panel title="Devoluciones / incidencias">
          <Incident text="Sin devolución registrada en Easy" green />
          <Incident text="Dhinox pendiente de entrega" amber />
          <Incident text="Remito Dhinox pendiente de subir" />
        </Panel>
      </section>
    </div>
  );
}

function Kpi({ title, value, blue = false, green = false, amber = false }: any) {
  const color = blue
    ? "text-blue-700"
    : green
    ? "text-emerald-700"
    : amber
    ? "text-amber-700"
    : "text-slate-900";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-semibold text-slate-900 mb-5">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Info({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Doc({ text, warning = false }: any) {
  return (
    <div className={`flex items-center gap-3 text-sm ${warning ? "text-amber-700" : "text-slate-600"}`}>
      {warning ? (
        <AlertTriangle size={18} />
      ) : (
        <CheckCircle2 size={18} className="text-emerald-600" />
      )}
      {text}
    </div>
  );
}

function Incident({ text, amber = false, green = false }: any) {
  const color = green
    ? "bg-emerald-100 text-emerald-700"
    : amber
    ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${color}`}>
      {text}
    </div>
  );
}

function Stop({
  number,
  client,
  slug,
  address,
  goods,
  status,
  note,
  delivered = false,
  alert = false,
}: any) {
  const statusColor = delivered
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            delivered ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}>
            {number}
          </div>

          <div>
            <Link
              href={`/clientes/${slug}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {client}
            </Link>

            <p className="text-sm text-slate-500 mt-1">{address}</p>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Package size={16} />
                {goods}
              </span>

              <span className="inline-flex items-center gap-2">
                <FileText size={16} />
                {note}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {status}
          </span>

          {alert && (
            <span className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
              Requiere turno
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Timeline({ time, text, done = false, active = false }: any) {
  const color = done
    ? "bg-emerald-500"
    : active
    ? "bg-blue-500"
    : "bg-slate-300";

  return (
    <div className="flex gap-3">
      <div className={`w-3 h-3 rounded-full mt-1.5 ${color}`} />
      <div>
        <p className="text-sm font-medium text-slate-900">{time}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}