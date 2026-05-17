import { Database, FileSpreadsheet, Upload } from "lucide-react";
import { importOperationsAction } from "@/app/actions";
import { Field, SelectField } from "@/components/controls";
import { Badge, PageHeader, Panel, StatCard } from "@/components/ui";

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const imported = {
    clientes: Number(params.clientes ?? 0),
    choferes: Number(params.choferes ?? 0),
    unidades: Number(params.unidades ?? 0),
    ordenes: Number(params.ordenes ?? 0),
  };
  const hasResult = Object.values(imported).some((value) => value > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Base de datos"
        title="Importar Excel"
        description="Carga masiva de clientes, choferes, unidades y órdenes desde una planilla real."
      />

      {hasResult ? (
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard title="Clientes importados" value={String(imported.clientes)} icon={<Database size={18} />} tone="green" />
          <StatCard title="Choferes importados" value={String(imported.choferes)} icon={<Database size={18} />} tone="blue" />
          <StatCard title="Unidades importadas" value={String(imported.unidades)} icon={<Database size={18} />} tone="amber" />
          <StatCard title="Órdenes importadas" value={String(imported.ordenes)} icon={<Database size={18} />} tone="purple" />
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Archivo" className="xl:col-span-2">
          <form id="import-form" action={importOperationsAction} className="space-y-6">
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <FileSpreadsheet size={24} className="text-slate-700" />
              </div>
              <h2 className="font-semibold text-slate-950">Subí una planilla .xlsx o .csv</h2>
              <p className="mt-2 text-sm text-slate-500">
                Si es Excel, puede tener hojas llamadas Clientes, Choferes, Unidades y Ordenes. Si es CSV, elegí el tipo abajo.
              </p>
              <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                <Upload size={18} />
                Seleccionar archivo
                <input name="file" type="file" accept=".xlsx,.csv,.tsv" className="sr-only" required />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField name="csvEntity" label="Tipo si subís CSV" options={["Clientes", "Choferes", "Unidades", "Ordenes"]} />
              <Field label="Referencia interna" placeholder="Ej: Base real mayo 2026" />
            </div>
          </form>
        </Panel>

        <Panel title="Formato esperado">
          <Badge tone="blue">Clientes: código, nombre, contacto, teléfono, recepción, requiere turno, requisitos</Badge>
          <Badge tone="green">Choferes: nombre, DNI, teléfono, categoría, licencia, unidad</Badge>
          <Badge tone="amber">Unidades: patente, marca, modelo, base, km, documentos, service</Badge>
          <Badge tone="purple">Ordenes: código, cliente código, carga, origen, destino, estado</Badge>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Los nombres de columnas pueden variar: el importador normaliza tildes, mayúsculas y espacios.
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              form="import-form"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <Upload size={18} />
              Importar datos
            </button>
          </div>
        </Panel>
      </section>
    </div>
  );
}
