import {
  CheckCircle2,
  Clock,
  FileWarning,
  Search,
  Truck,
  UserPlus,
} from "lucide-react";

export default function ChoferesPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Choferes</h1>
          <p className="text-slate-500 mt-1">
            Estado operativo, clasificación interna, unidad asignada y documentación vinculada.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <UserPlus size={18} />
          Nuevo chofer
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Disponibles" value="6" />
        <MiniCard title="En viaje" value="14" />
        <MiniCard title="Descansando" value="5" />
        <MiniCard title="Con observaciones" value="3" danger />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por nombre, categoría, estado, unidad o patente..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DriverCard
          name="Juan Pérez"
          status="En viaje"
          tag="Nexo Aberturas"
          phone="343 555-1200"
          license="Licencia vence en 3 días"
          trips="18 viajes este mes"
          unitBrand="Volvo"
          unitModel="370"
          unitPlate="AB123CD"
          unitDocs="VTV vigente · Seguro vigente"
          risk
        />

        <DriverCard
          name="Luis Gómez"
          status="Disponible"
          tag="Tercero"
          phone="343 555-8831"
          license="Documentación vigente"
          trips="22 viajes este mes"
          unitBrand="Scania"
          unitModel="360"
          unitPlate="AC456EF"
          unitDocs="VTV vence en 12 días · Seguro vigente"
        />

        <DriverCard
          name="Carlos Díaz"
          status="Descansando"
          tag="Mixto"
          phone="343 555-4490"
          license="Documentación vigente"
          trips="15 viajes este mes"
          unitBrand="Mercedes-Benz"
          unitModel="1938"
          unitPlate="AD789GH"
          unitDocs="VTV vigente · Seguro vigente"
        />

        <DriverCard
          name="Martín Silva"
          status="En carga"
          tag="Nexo Aberturas"
          phone="343 555-9912"
          license="Seguro ART pendiente"
          trips="12 viajes este mes"
          unitBrand="Iveco"
          unitModel="Cursor 330"
          unitPlate="AE321JK"
          unitDocs="VTV vencida · Seguro vigente"
          risk
        />

        <DriverCard
          name="Roberto Núñez"
          status="Disponible"
          tag="Mixto"
          phone="343 555-3321"
          license="Documentación vigente"
          trips="9 viajes este mes"
          unitBrand="Volvo"
          unitModel="VM 330"
          unitPlate="AF654LM"
          unitDocs="VTV vigente · Seguro vence en 20 días"
        />

        <DriverCard
          name="Diego Fernández"
          status="No disponible"
          tag="Tercero"
          phone="343 555-7844"
          license="Licencia vencida"
          trips="4 viajes este mes"
          unitBrand="Sin unidad"
          unitModel="-"
          unitPlate="-"
          unitDocs="Sin unidad asignada"
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

function DriverCard({
  name,
  status,
  tag,
  phone,
  license,
  trips,
  unitBrand,
  unitModel,
  unitPlate,
  unitDocs,
  risk = false,
}: any) {
  const statusColor =
    status === "Disponible"
      ? "bg-emerald-100 text-emerald-700"
      : status === "En viaje"
      ? "bg-blue-100 text-blue-700"
      : status === "En carga"
      ? "bg-amber-100 text-amber-700"
      : status === "Descansando"
      ? "bg-slate-100 text-slate-700"
      : "bg-red-100 text-red-700";

  const tagColor =
    tag === "Nexo Aberturas"
      ? "bg-blue-100 text-blue-700"
      : tag === "Tercero"
      ? "bg-purple-100 text-purple-700"
      : "bg-emerald-100 text-emerald-700";

  const unitRisk =
    unitDocs.includes("vencida") ||
    unitDocs.includes("Sin unidad");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-slate-700">
            {name.charAt(0)}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500">{phone}</p>

            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${tagColor}`}>
              {tag}
            </span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck size={18} className="text-slate-600" />
          <p className="text-sm font-semibold text-slate-900">Unidad asignada</p>
        </div>

        <p className="text-sm text-slate-700">
          {unitBrand} {unitModel} · <span className="font-medium">{unitPlate}</span>
        </p>

        <p className={`text-xs mt-2 ${unitRisk ? "text-red-600" : "text-slate-500"}`}>
          {unitDocs}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <InfoRow
          icon={risk ? <FileWarning size={18} /> : <CheckCircle2 size={18} />}
          text={license}
          danger={risk}
        />

        <InfoRow icon={<Clock size={18} />} text={trips} />
      </div>

      <button className="w-full mt-6 border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50">
        Ver legajo completo
      </button>
    </div>
  );
}

function InfoRow({ icon, text, danger = false }: any) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}