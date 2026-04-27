import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Truck,
  User,
  Wrench,
} from "lucide-react";

export default function UnidadDetallePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500 mb-2">Unidades / AB123CD</p>
        <h1 className="text-3xl font-bold text-slate-900">AB123CD</h1>
        <p className="text-slate-500 mt-1">
          Estado operativo, chofer asignado, documentación y mantenimiento.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Truck size={28} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Volvo 370 · AB123CD
              </h2>

              <p className="text-sm text-slate-500">
                Semirremolque asignado · Base Paraná
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Tag text="Operativa" green />
                <Tag text="En viaje" blue />
                <Tag text="Service próximo" amber />
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
            Próximo service recomendado en 8.000 km.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Datos de la unidad">
          <Info icon={<Truck size={18} />} text="Marca: Volvo" />
          <Info icon={<Truck size={18} />} text="Modelo: 370" />
          <Info icon={<FileText size={18} />} text="Patente: AB123CD" />
          <Info icon={<Clock size={18} />} text="Km actuales: 482.000" />
        </Panel>

        <Panel title="Chofer asignado">
          <Link
            href="/choferes/juan-perez"
            className="flex items-center gap-3 text-sm text-blue-600 hover:underline font-medium"
          >
            <User size={18} />
            Juan Pérez
          </Link>

          <Info icon={<Clock size={18} />} text="Última actividad: hace 18 min" />
          <Info icon={<Truck size={18} />} text="Viaje actual activo" />
        </Panel>

        <Panel title="Documentación">
          <Doc text="Seguro vigente" />
          <Doc text="VTV vigente" />
          <Doc text="Habilitación nacional vigente" />
          <Doc text="Póliza vence en 12 días" danger />
        </Panel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <Panel title="Mantenimiento">
          <Metric label="Último service" value="Hace 22 días" />
          <Metric label="Próximo service" value="8.000 km" />
          <Metric label="Cubiertas críticas" value="1" danger />
          <Metric label="Estado general" value="Bueno" />
        </Panel>

        <Panel title="Viaje actual">
          <Info icon={<Truck size={18} />} text="VJ-000124" />
          <Info icon={<Clock size={18} />} text="Paraná → Buenos Aires" />
          <Info icon={<User size={18} />} text="Juan Pérez" />
          <Info icon={<Shield size={18} />} text="Estado: En viaje" />
        </Panel>

        <Panel title="Alertas recientes">
          <Incident text="Cambio de aceite recomendado pronto" amber />
          <Incident text="Chequeo cubiertas delanteras" amber />
          <Incident text="Sin fallas críticas" green />
        </Panel>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Historial reciente</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">Viaje</th>
                <th className="p-4">Chofer</th>
                <th className="p-4">Ruta</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <Trip
                id="VJ-000124"
                driver="Juan Pérez"
                route="Paraná → Buenos Aires"
                status="En viaje"
              />
              <Trip
                id="VJ-000119"
                driver="Luis Gómez"
                route="Rosario → Córdoba"
                status="Entregado"
              />
              <Trip
                id="VJ-000112"
                driver="Carlos Díaz"
                route="Santa Fe → Mendoza"
                status="Entregado"
              />
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

function Doc({ text, danger = false }: any) {
  return (
    <div
      className={`flex items-center gap-3 text-sm ${
        danger ? "text-red-600" : "text-slate-600"
      }`}
    >
      {danger ? (
        <AlertTriangle size={18} />
      ) : (
        <CheckCircle2 size={18} className="text-emerald-600" />
      )}
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

function Trip({ id, driver, route, status }: any) {
  const color =
    status === "Entregado"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4 font-medium text-slate-900">{id}</td>
      <td className="p-4">{driver}</td>
      <td className="p-4">{route}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function Tag({ text, blue = false, green = false, amber = false }: any) {
  const color = blue
    ? "bg-blue-100 text-blue-700"
    : green
    ? "bg-emerald-100 text-emerald-700"
    : amber
    ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}