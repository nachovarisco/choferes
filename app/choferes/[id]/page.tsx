import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Shield,
  Truck,
  User,
} from "lucide-react";

export default function ChoferDetallePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500 mb-2">Choferes / Juan Pérez</p>
        <h1 className="text-3xl font-bold text-slate-900">Juan Pérez</h1>
        <p className="text-slate-500 mt-1">
          Legajo operativo, unidad asignada, documentación, viajes e incidencias.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
              J
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Juan Pérez</h2>
              <p className="text-sm text-slate-500">343 555-1200 · DNI 32.456.789</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Tag text="Nexo Aberturas" blue />
                <Tag text="En viaje" green />
                <Tag text="Licencia por vencer" amber />
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
            La licencia profesional vence en 3 días.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Datos del chofer">
          <Info icon={<User size={18} />} text="Categoría: Nexo Aberturas" />
          <Info icon={<Phone size={18} />} text="Teléfono: 343 555-1200" />
          <Info icon={<Shield size={18} />} text="Estado: En viaje" />
          <Info icon={<Clock size={18} />} text="Última actividad: hace 18 min" />
        </Panel>

        <Panel title="Unidad asignada">
          <Info icon={<Truck size={18} />} text="Volvo 370 · AB123CD" />
          <Info icon={<CheckCircle2 size={18} />} text="Seguro vigente" />
          <Info icon={<CheckCircle2 size={18} />} text="VTV vigente" />
          <Info icon={<Clock size={18} />} text="Service en 8.000 km" />
        </Panel>

        <Panel title="Documentación personal">
          <Doc text="DNI cargado" />
          <Doc text="Licencia profesional vence en 3 días" danger />
          <Doc text="ART vigente" />
          <Doc text="Apto médico vigente" />
        </Panel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <Panel title="Rendimiento mensual">
          <Metric label="Viajes realizados" value="18" />
          <Metric label="Puntualidad" value="91%" />
          <Metric label="Incidencias" value="2" danger />
          <Metric label="Km estimados" value="8.420" />
        </Panel>

        <Panel title="Viaje actual">
          <Info icon={<Truck size={18} />} text="VJ-000124 · Easy + Dhinox" />
          <Info icon={<Clock size={18} />} text="Estado: En viaje" />
          <Info icon={<FileText size={18} />} text="Documentación completa" />
          <Info icon={<AlertTriangle size={18} />} text="Easy requiere turno" />
        </Panel>

        <Panel title="Incidencias recientes">
          <Incident text="Demora 4 hs en descarga Easy" amber />
          <Incident text="Remito cargado fuera de horario" />
          <Incident text="Sin incidencias graves" green />
        </Panel>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Historial de viajes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">Viaje</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Ruta</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <Trip id="VJ-000124" client="Easy + Dhinox" route="Paraná → Buenos Aires" unit="AB123CD" status="En viaje" />
              <Trip id="VJ-000119" client="Cencosud" route="Rosario → Córdoba" unit="AB123CD" status="Entregado" />
              <Trip id="VJ-000112" client="Julicroc" route="Santa Fe → Mendoza" unit="AB123CD" status="Entregado" />
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
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {danger ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-600" />}
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

function Trip({ id, client, route, unit, status }: any) {
  const color =
    status === "Entregado"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4 font-medium text-slate-900">{id}</td>
      <td className="p-4">{client}</td>
      <td className="p-4">{route}</td>
      <td className="p-4">{unit}</td>
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