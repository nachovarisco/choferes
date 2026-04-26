import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Search,
} from "lucide-react";

export default function ClientesPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">
            Gestión de clientes, requisitos documentales, turnos y condiciones operativas.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <Building2 size={18} />
          Nuevo cliente
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Clientes activos" value="28" />
        <MiniCard title="Requieren turno" value="9" danger />
        <MiniCard title="Documentación previa" value="12" />
        <MiniCard title="Viajes este mes" value="124" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar cliente, requisito, turno o condición operativa..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ClientCard
          name="Easy"
          slug="easy"
          contact="Operaciones Buenos Aires"
          trips="42 viajes este mes"
          status="Requiere turno"
          risk
          tags={["Pedir turno", "Documentación previa", "Remito físico"]}
          requirements={["Licencia chofer", "Seguro unidad", "VTV", "ART", "Constancia AFIP"]}
        />

        <ClientCard
          name="Cencosud"
          slug="cencosud"
          contact="Logística Regional"
          trips="31 viajes este mes"
          status="Horario estricto"
          risk
          tags={["Pedir turno", "Horario estricto", "Avisar antes de llegar"]}
          requirements={["Licencia chofer", "Seguro unidad", "VTV", "Póliza", "DNI chofer"]}
        />

        <ClientCard
          name="Dhinox"
          slug="dhinox"
          contact="Depósito Santa Fe"
          trips="18 viajes este mes"
          status="Documentación completa"
          tags={["Remito físico", "Avisar antes de llegar"]}
          requirements={["Remito", "Seguro unidad", "Habilitación unidad"]}
        />

        <ClientCard
          name="Julicroc"
          slug="julicroc"
          contact="Administración"
          trips="15 viajes este mes"
          status="Revisión pendiente"
          tags={["No recibe sin OC", "Remito firmado"]}
          requirements={["Orden de carga", "Remito firmado", "Constancia fiscal"]}
        />
      </section>
    </div>
  );
}

function MiniCard({ title, value, danger = false }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${danger ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </h2>
    </div>
  );
}

function ClientCard({
  name,
  slug,
  contact,
  trips,
  status,
  tags,
  requirements,
  risk = false,
}: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center">
            <Building2 size={22} className="text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500">{contact}</p>
            <p className="text-sm text-slate-500 mt-1">{trips}</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            risk ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-amber-700" />
          <p className="text-sm font-semibold text-amber-900">
            Condiciones operativas del cliente
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string) => (
            <OperationalTag key={tag} text={tag} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-slate-600" />
          <p className="text-sm font-semibold text-slate-900">
            Requisitos documentales
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {requirements.map((item: string) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-700 inline-flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={`/clientes/${slug}`}
        className="block text-center w-full mt-6 border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50"
      >
        Ver cliente
      </Link>
    </div>
  );
}

function OperationalTag({ text }: { text: string }) {
  const icon =
    text.toLowerCase().includes("turno") ||
    text.toLowerCase().includes("horario") ? (
      <Clock size={14} />
    ) : (
      <AlertTriangle size={14} />
    );

  return (
    <span className="px-3 py-1 rounded-full text-xs bg-white border border-amber-200 text-amber-800 inline-flex items-center gap-2">
      {icon}
      {text}
    </span>
  );
}