import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Truck,
  User,
} from "lucide-react";

export default function ClienteDetallePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500 mb-2">Clientes / Easy</p>
        <h1 className="text-3xl font-bold text-slate-900">Easy</h1>
        <p className="text-slate-500 mt-1">
          Ficha operativa del cliente, requisitos, contactos y viajes recientes.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
              <Building2 size={26} className="text-slate-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Easy</h2>
              <p className="text-sm text-slate-500">Operaciones Buenos Aires</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Tag text="Pedir turno" amber />
                <Tag text="Documentación previa" amber />
                <Tag text="Remito físico" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-700" />
            <h2 className="font-semibold text-amber-900">Atención</h2>
          </div>

          <p className="text-sm text-amber-900">
            Este cliente requiere pedir turno antes de descargar.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Contactos">
          <Info icon={<User size={18} />} text="María González · Operaciones" />
          <Info icon={<Phone size={18} />} text="11 5555-1200" />
          <Info icon={<Clock size={18} />} text="Recepción: 08:00 a 16:00" />
        </Panel>

        <Panel title="Requisitos documentales">
          <Doc text="Licencia chofer" />
          <Doc text="Seguro unidad" />
          <Doc text="VTV" />
          <Doc text="ART" />
          <Doc text="Constancia AFIP" />
        </Panel>

        <Panel title="Indicadores">
          <Metric label="Viajes este mes" value="42" />
          <Metric label="Demora promedio" value="1h 20m" />
          <Metric label="Incidencias abiertas" value="1" danger />
        </Panel>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Viajes recientes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">Viaje</th>
                <th className="p-4">Ruta</th>
                <th className="p-4">Chofer</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <Trip id="VJ-000124" route="Paraná → Buenos Aires" driver="Juan Pérez" unit="AB123CD" status="En viaje" />
              <Trip id="VJ-000119" route="Rosario → Buenos Aires" driver="Luis Gómez" unit="AC456EF" status="Entregado" />
              <Trip id="VJ-000112" route="Santa Fe → Buenos Aires" driver="Carlos Díaz" unit="AD789GH" status="Entregado" />
            </tbody>
          </table>
        </div>
      </section>
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

function Metric({ label, value, danger = false }: any) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-bold ${danger ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

function Trip({ id, route, driver, unit, status }: any) {
  const color =
    status === "Entregado"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4 font-medium text-slate-900">{id}</td>
      <td className="p-4">{route}</td>
      <td className="p-4">{driver}</td>
      <td className="p-4">{unit}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function Tag({ text, amber = false }: any) {
  const color = amber
    ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}