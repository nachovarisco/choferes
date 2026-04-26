import {
  Bell,
  Building2,
  FileText,
  Shield,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración
        </h1>

        <p className="text-slate-500 mt-1">
          Ajustes generales del sistema y estructura operativa.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ConfigCard
          icon={<Building2 size={20} />}
          title="Empresa"
          text="Datos fiscales, razón social, sucursales y branding."
        />

        <ConfigCard
          icon={<Users size={20} />}
          title="Usuarios y Roles"
          text="Administradores, tráfico, choferes y permisos."
        />

        <ConfigCard
          icon={<Shield size={20} />}
          title="Permisos"
          text="Qué puede ver o editar cada perfil."
        />

        <ConfigCard
          icon={<FileText size={20} />}
          title="Tipos de Documentos"
          text="Licencia, VTV, seguros, ART, AFIP y personalizados."
        />

        <ConfigCard
          icon={<Bell size={20} />}
          title="Notificaciones"
          text="Alertas de vencimientos, incidencias y viajes."
        />

        <ConfigCard
          icon={<SlidersHorizontal size={20} />}
          title="Operación"
          text="Estados de viaje, categorías de choferes y etiquetas."
        />
      </section>

      <section className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Categorías internas de choferes
        </h2>

        <div className="flex flex-wrap gap-3">
          <Tag text="Nexo Aberturas" blue />
          <Tag text="Tercero" purple />
          <Tag text="Mixto" green />
          <Tag text="General" />
        </div>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Estados operativos de viaje
        </h2>

        <div className="flex flex-wrap gap-3">
          <Tag text="Pendiente" />
          <Tag text="Asignado" blue />
          <Tag text="En carga" amber />
          <Tag text="En viaje" green />
          <Tag text="Demorado" red />
          <Tag text="Finalizado" />
        </div>
      </section>
    </div>
  );
}

function ConfigCard({ icon, title, text }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
        {icon}
      </div>

      <h2 className="font-semibold text-slate-900">{title}</h2>

      <p className="text-sm text-slate-500 mt-2">{text}</p>

      <button className="mt-5 border border-slate-200 rounded-xl px-4 py-2 text-sm hover:bg-slate-50">
        Configurar
      </button>
    </div>
  );
}

function Tag({
  text,
  blue = false,
  purple = false,
  green = false,
  amber = false,
  red = false,
}: any) {
  const color = blue
    ? "bg-blue-100 text-blue-700"
    : purple
    ? "bg-purple-100 text-purple-700"
    : green
    ? "bg-emerald-100 text-emerald-700"
    : amber
    ? "bg-amber-100 text-amber-700"
    : red
    ? "bg-red-100 text-red-700"
    : "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}