import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Upload,
} from "lucide-react";

export default function DocumentosPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Documentación
          </h1>
          <p className="text-slate-500 mt-1">
            Control centralizado de choferes, unidades y empresa.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <Upload size={18} />
          Subir documento
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Vigentes" value="84" />
        <MiniCard title="Por vencer" value="7" />
        <MiniCard title="Vencidos" value="3" danger />
        <MiniCard title="Pendientes" value="5" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por chofer, patente, tipo de documento..."
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">Documento</th>
                <th className="p-4">Titular</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Vence</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Archivo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <DocRow
                name="Licencia Profesional"
                owner="Juan Pérez"
                type="Chofer"
                due="27/04/2026"
                status="Por vencer"
              />

              <DocRow
                name="Seguro Unidad"
                owner="AB123CD"
                type="Camión"
                due="12/09/2026"
                status="Vigente"
              />

              <DocRow
                name="VTV"
                owner="AE321JK"
                type="Camión"
                due="01/04/2026"
                status="Vencido"
              />

              <DocRow
                name="ART"
                owner="Martín Silva"
                type="Chofer"
                due="-"
                status="Pendiente"
              />

              <DocRow
                name="Constancia AFIP"
                owner="Transporte Nexo"
                type="Empresa"
                due="31/12/2026"
                status="Vigente"
              />
            </tbody>
          </table>
        </div>
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

function DocRow({ name, owner, type, due, status }: any) {
  const color =
    status === "Vigente"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Por vencer"
      ? "bg-amber-100 text-amber-700"
      : status === "Pendiente"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700";

  const icon =
    status === "Vigente" ? (
      <CheckCircle2 size={16} />
    ) : status === "Vencido" ? (
      <AlertTriangle size={16} />
    ) : (
      <FileText size={16} />
    );

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4 font-medium text-slate-900">{name}</td>
      <td className="p-4">{owner}</td>
      <td className="p-4">{type}</td>
      <td className="p-4">{due}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-2 ${color}`}>
          {icon}
          {status}
        </span>
      </td>
      <td className="p-4 text-blue-600 cursor-pointer">
        Ver archivo
      </td>
    </tr>
  );
}