import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Plus,
  Receipt,
  Truck,
  User,
  Wallet,
} from "lucide-react";

export default function CajaPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-500 mt-1">
            Control de dinero asignado, gastos, rendiciones y saldos por viaje.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
            <Download size={18} />
            Exportar Excel
          </button>

          <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
            <Plus size={18} />
            Nuevo movimiento
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Caja disponible" value="$2.450.000" />
        <MiniCard title="Asignado a choferes" value="$840.000" warning />
        <MiniCard title="Gastos rendidos" value="$612.500" />
        <MiniCard title="Diferencias abiertas" value="$73.200" danger />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Panel title="Resumen por viaje">
          <TripBalance
            trip="VJ-000124"
            driver="Juan Pérez"
            unit="AB123CD"
            assigned="$120.000"
            spent="$96.500"
            balance="$23.500"
          />

          <TripBalance
            trip="VJ-000125"
            driver="Luis Gómez"
            unit="AC456EF"
            assigned="$90.000"
            spent="$104.800"
            balance="-$14.800"
            danger
          />

          <TripBalance
            trip="VJ-000126"
            driver="Carlos Díaz"
            unit="AD789GH"
            assigned="$150.000"
            spent="$132.000"
            balance="$18.000"
          />
        </Panel>

        <Panel title="Gastos por categoría">
          <Category name="Peajes" value="$185.000" />
          <Category name="Combustible" value="$240.500" />
          <Category name="Gomería" value="$82.000" />
          <Category name="Repuestos" value="$65.000" />
          <Category name="Estacionamiento" value="$18.000" />
          <Category name="Viáticos" value="$22.000" />
        </Panel>

        <Panel title="Alertas administrativas">
          <Alert text="Luis Gómez gastó $14.800 más de lo asignado." danger />
          <Alert text="Falta comprobante de gomería en VJ-000125." warning />
          <Alert text="Peaje sin rendir en viaje VJ-000124." warning />
          <Alert text="Caja general conciliada hasta ayer." />
        </Panel>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Movimientos recientes</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingresos, egresos y rendiciones vinculadas a viajes, choferes y unidades.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Viaje</th>
                <th className="p-4">Chofer</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <Movement
                date="24/04/2026"
                type="Egreso"
                category="Peaje"
                trip="VJ-000124"
                driver="Juan Pérez"
                unit="AB123CD"
                amount="-$18.500"
                status="Rendido"
              />

              <Movement
                date="24/04/2026"
                type="Egreso"
                category="Combustible"
                trip="VJ-000124"
                driver="Juan Pérez"
                unit="AB123CD"
                amount="-$62.000"
                status="Rendido"
              />

              <Movement
                date="24/04/2026"
                type="Egreso"
                category="Gomería"
                trip="VJ-000125"
                driver="Luis Gómez"
                unit="AC456EF"
                amount="-$82.000"
                status="Falta comprobante"
                danger
              />

              <Movement
                date="23/04/2026"
                type="Ingreso"
                category="Asignación a chofer"
                trip="VJ-000126"
                driver="Carlos Díaz"
                unit="AD789GH"
                amount="$150.000"
                status="Asignado"
                income
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MiniCard({ title, value, danger = false, warning = false }: any) {
  const color = danger
    ? "text-red-600"
    : warning
    ? "text-amber-600"
    : "text-slate-900";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-semibold text-slate-900 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TripBalance({
  trip,
  driver,
  unit,
  assigned,
  spent,
  balance,
  danger = false,
}: any) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">{trip}</p>
        <span
          className={`text-sm font-bold ${
            danger ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {balance}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <User size={16} />
          {driver}
        </span>

        <span className="inline-flex items-center gap-2">
          <Truck size={16} />
          {unit}
        </span>

        <span className="inline-flex items-center gap-2">
          <Wallet size={16} />
          Asignado: {assigned} · Gastado: {spent}
        </span>
      </div>
    </div>
  );
}

function Category({ name, value }: any) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-600">{name}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full">
        <div className="h-2 bg-blue-500 rounded-full w-2/3" />
      </div>
    </div>
  );
}

function Alert({ text, danger = false, warning = false }: any) {
  const color = danger
    ? "bg-red-100 text-red-700"
    : warning
    ? "bg-amber-100 text-amber-700"
    : "bg-emerald-100 text-emerald-700";

  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${color}`}>
      {text}
    </div>
  );
}

function Movement({
  date,
  type,
  category,
  trip,
  driver,
  unit,
  amount,
  status,
  danger = false,
  income = false,
}: any) {
  const typeIcon = income ? (
    <ArrowUpCircle size={16} className="text-emerald-600" />
  ) : (
    <ArrowDownCircle size={16} className="text-red-600" />
  );

  const statusColor = danger
    ? "bg-red-100 text-red-700"
    : income
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4">{date}</td>
      <td className="p-4">
        <span className="inline-flex items-center gap-2">
          {typeIcon}
          {type}
        </span>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center gap-2">
          <Receipt size={16} />
          {category}
        </span>
      </td>
      <td className="p-4 font-medium text-slate-900">{trip}</td>
      <td className="p-4">{driver}</td>
      <td className="p-4">{unit}</td>
      <td
        className={`p-4 font-semibold ${
          income ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {amount}
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}