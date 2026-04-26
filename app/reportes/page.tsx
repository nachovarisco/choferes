import { BarChart3, DollarSign, TrendingUp, Truck, Users } from "lucide-react";

export default function ReportesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500 mt-1">
          Estadísticas generales de operación, clientes, choferes y rentabilidad.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Viajes del mes" value="124" icon={<Truck size={18} />} />
        <MiniCard title="Facturación estimada" value="$18.4M" icon={<DollarSign size={18} />} />
        <MiniCard title="Margen promedio" value="18.4%" icon={<TrendingUp size={18} />} />
        <MiniCard title="Choferes activos" value="28" icon={<Users size={18} />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Viajes por estado">
          <Progress label="En viaje" value="42%" />
          <Progress label="Entregados" value="34%" />
          <Progress label="En carga" value="15%" />
          <Progress label="Con incidencia" value="9%" danger />
        </Panel>

        <Panel title="Top clientes">
          <Ranking name="Easy" value="42 viajes" />
          <Ranking name="Cencosud" value="31 viajes" />
          <Ranking name="Dhinox" value="18 viajes" />
          <Ranking name="Julicroc" value="15 viajes" />
        </Panel>

        <Panel title="Indicadores críticos">
          <Kpi title="Demora promedio" value="2h 15m" />
          <Kpi title="Documentos vencidos" value="3" danger />
          <Kpi title="Unidades en taller" value="3" danger />
          <Kpi title="Viajes sin asignar" value="4" />
        </Panel>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={20} className="text-slate-700" />
          <h2 className="font-semibold text-slate-900">Evolución mensual</h2>
        </div>

        <div className="grid grid-cols-7 gap-3 items-end h-64">
          <Bar label="Lun" height="45%" />
          <Bar label="Mar" height="62%" />
          <Bar label="Mié" height="51%" />
          <Bar label="Jue" height="78%" />
          <Bar label="Vie" height="88%" />
          <Bar label="Sáb" height="38%" />
          <Bar label="Dom" height="22%" />
        </div>
      </section>
    </div>
  );
}

function MiniCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-slate-900">{value}</h2>
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

function Progress({ label, value, danger = false }: any) {
  const number = parseInt(value);

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${danger ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${number}%` }}
        />
      </div>
    </div>
  );
}

function Ranking({ name, value }: any) {
  return (
    <div className="flex justify-between items-center">
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  );
}

function Kpi({ title, value, danger = false }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
      <p className="text-sm text-slate-600">{title}</p>
      <p className={`font-bold ${danger ? "text-red-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function Bar({ label, height }: any) {
  return (
    <div className="flex flex-col items-center justify-end h-full gap-3">
      <div className="w-full rounded-t-xl bg-blue-500" style={{ height }} />
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}