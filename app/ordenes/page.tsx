import { ClipboardList, FileText, Search, Truck, User } from "lucide-react";

export default function OrdenesPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de carga</h1>
          <p className="text-slate-500 mt-1">
            Gestión de cargas pendientes, asignaciones y documentación previa al viaje.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <ClipboardList size={18} />
          Nueva orden
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Pendientes" value="9" />
        <MiniCard title="Asignadas" value="14" />
        <MiniCard title="En carga" value="3" />
        <MiniCard title="Con faltantes" value="4" danger />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por cliente, carga, destino, chofer o unidad..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <OrderCard
          code="OC-000341"
          client="Easy"
          load="Aberturas · 18 bultos"
          route="Paraná → Buenos Aires"
          driver="Juan Pérez"
          unit="Volvo 370 · AB123CD"
          status="Asignada"
          docs="Documentación completa"
        />

        <OrderCard
          code="OC-000342"
          client="Cencosud"
          load="Palletizado · 10 pallets"
          route="Rosario → Córdoba"
          driver="Luis Gómez"
          unit="Scania 360 · AC456EF"
          status="En carga"
          docs="Falta VTV actualizada"
          risk
        />

        <OrderCard
          code="OC-000343"
          client="Dhinox"
          load="Acero inoxidable · 6 bultos"
          route="Santa Fe → Mendoza"
          driver="Sin asignar"
          unit="Sin asignar"
          status="Pendiente"
          docs="Pendiente asignación"
        />

        <OrderCard
          code="OC-000344"
          client="Julicroc"
          load="Mercadería general"
          route="Buenos Aires → Neuquén"
          driver="Martín Silva"
          unit="Iveco Cursor · AE321JK"
          status="Observada"
          docs="VTV vencida"
          risk
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

function OrderCard({ code, client, load, route, driver, unit, status, docs, risk = false }: any) {
  const statusColor =
    status === "Asignada"
      ? "bg-blue-100 text-blue-700"
      : status === "En carga"
      ? "bg-amber-100 text-amber-700"
      : status === "Observada"
      ? "bg-red-100 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-slate-500">{code}</p>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{client}</h2>
          <p className="text-sm text-slate-500 mt-1">{route}</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <Info icon={<ClipboardList size={18} />} text={load} />
        <Info icon={<User size={18} />} text={driver} />
        <Info icon={<Truck size={18} />} text={unit} />
        <Info icon={<FileText size={18} />} text={docs} danger={risk} />
      </div>

      <button className="w-full mt-6 border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50">
        Ver orden
      </button>
    </div>
  );
}

function Info({ icon, text, danger = false }: any) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}