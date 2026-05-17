"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, Upload } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, DataTable, PageHeader, StatCard } from "@/components/ui";
import { createDocumentAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { documentTypes, statusTone } from "@/lib/data";

export default function DocumentosPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { documents } = useLiveData();

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return documents;
    }

    return documents.filter((document) =>
      [document.name, document.owner, document.type, document.status, document.due]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [documents, query]);

  return (
    <div>
      <PageHeader
        title="Documentación"
        description="Control centralizado de documentos, vencimientos y archivos operativos."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Upload size={18} />
            Subir documento
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Vigentes" value={String(documents.filter((document) => document.status === "Vigente").length)} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard title="Por vencer" value={String(documents.filter((document) => document.status === "Por vencer").length)} icon={<FileText size={18} />} tone="amber" />
        <StatCard title="Vencidos" value={String(documents.filter((document) => document.status === "Vencido").length)} icon={<AlertTriangle size={18} />} tone="red" />
        <StatCard title="Pendientes" value={String(documents.filter((document) => document.status === "Pendiente").length)} icon={<FileText size={18} />} />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar por chofer, patente, cliente o tipo de documento..." />
      </section>

      <section className="space-y-6">
        {documentTypes.map((type) => {
          const group = filteredDocuments.filter((document) => document.type === type);

          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-950">Archivos por {type.toLowerCase()}</h2>
                <Badge tone={group.length > 0 ? "blue" : "slate"}>{group.length} archivos</Badge>
              </div>
              <DataTable
                data={group}
                getKey={(document) => document.id}
                emptyText={`No hay documentos de tipo ${type.toLowerCase()} para mostrar.`}
                columns={[
                  { header: "ID", cell: (document) => <span className="font-mono text-xs text-slate-600">{document.id}</span> },
                  { header: "Documento", cell: (document) => <span className="font-medium text-slate-950">{document.name}</span> },
                  { header: "Asociado a", cell: (document) => document.owner },
                  { header: "Relación", cell: (document) => document.association },
                  { header: "Vencimiento", cell: (document) => document.due },
                  {
                    header: "Estado",
                    cell: (document) => (
                      <Badge tone={statusTone(document.status)}>
                        {document.status === "Vigente" ? <CheckCircle2 size={16} /> : document.status === "Vencido" ? <AlertTriangle size={16} /> : <FileText size={16} />}
                        {document.status}
                      </Badge>
                    ),
                  },
                  {
                    header: "Archivo",
                    cell: (document) =>
                      document.fileUrl ? (
                        <Link href={document.fileUrl} target="_blank" className="font-medium text-blue-600 hover:underline">
                          Ver archivo
                        </Link>
                      ) : (
                        <span className="text-slate-400">Sin archivo</span>
                      ),
                  },
                ]}
              />
            </div>
          );
        })}
      </section>

      {open ? <UploadDocumentModal onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function UploadDocumentModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalFrame
      title="Subir documento"
      description="Cargá un archivo y vinculalo a un chofer, unidad, cliente o empresa."
      onClose={onClose}
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar documento" submit formId="new-document-form" />}
    >
      <form id="new-document-form" action={createDocumentAction} className="space-y-8">
        <section>
          <h3 className="mb-4 font-semibold text-slate-950">Datos del documento</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="name"
              label="Tipo de documento"
              options={["Licencia profesional", "DNI", "VTV", "Seguro unidad", "Póliza", "ART", "Constancia AFIP", "Remito", "Orden de carga", "Otro"]}
              required
            />
            <SelectField name="category" label="Categoría" options={["Chofer", "Unidad", "Empresa", "Cliente", "Viaje"]} required />
            <Field name="association" label="Relación" placeholder="Ej: Unidad / Chofer + Unidad / Viaje" required />
            <Field name="reference" label="Número / referencia" placeholder="Ej: póliza, remito, OC..." />
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-semibold text-slate-950">Vinculación</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field name="owner" label="Titular relacionado" placeholder="Ej: Juan Pérez / AB123CD / Easy" required />
            <Field label="Fecha de emisión" type="date" />
            <Field name="due" label="Fecha de vencimiento" type="date" />
          </div>
        </section>

        <section className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <Upload size={24} className="text-slate-700" />
          </div>
          <h3 className="font-semibold text-slate-950">Arrastrá o seleccioná el archivo</h3>
          <p className="mt-1 text-sm text-slate-500">PDF, imagen o documento escaneado. Después se guardará en la ficha correspondiente.</p>
          <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Seleccionar archivo
            <input name="file" type="file" className="sr-only" />
          </label>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="mt-0.5 text-amber-700" />
            <div>
              <h3 className="font-semibold text-amber-900">Control automático</h3>
              <p className="mt-1 text-sm text-amber-900">
                Si cargás fecha de vencimiento, el sistema podrá alertar documentos por vencer y bloquear asignaciones críticas en el futuro.
              </p>
            </div>
          </div>
        </section>

        <TextArea name="notes" label="Observaciones internas" placeholder="Ej: documento solicitado por cliente, renovación pendiente, aclaraciones..." />
      </form>
    </ModalFrame>
  );
}
