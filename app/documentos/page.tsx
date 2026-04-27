"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Upload,
  X,
} from "lucide-react";

export default function DocumentosPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentación</h1>
          <p className="text-slate-500 mt-1">
            Control centralizado de documentos, vencimientos y archivos operativos.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2"
        >
          <Upload size={18} />
          Subir documento
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Vigentes" value="84" />
        <MiniCard title="Por vencer" value="7" warning />
        <MiniCard title="Vencidos" value="3" danger />
        <MiniCard title="Pendientes" value="5" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por chofer, patente, cliente, tipo de documento..."
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
              <DocRow name="Licencia Profesional" owner="Juan Pérez" type="Chofer" due="27/04/2026" status="Por vencer" />
              <DocRow name="Seguro Unidad" owner="AB123CD" type="Unidad" due="12/09/2026" status="Vigente" />
              <DocRow name="VTV" owner="AE321JK" type="Unidad" due="01/04/2026" status="Vencido" />
              <DocRow name="ART" owner="Martín Silva" type="Chofer" due="-" status="Pendiente" />
              <DocRow name="Constancia AFIP" owner="Transporte Nexo" type="Empresa" due="31/12/2026" status="Vigente" />
            </tbody>
          </table>
        </div>
      </section>

      {open && <UploadDocumentModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function UploadDocumentModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Subir documento</h2>
            <p className="text-sm text-slate-500 mt-1">
              Cargá un archivo y vinculalo a un chofer, unidad, cliente o empresa.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="font-semibold text-slate-900 mb-4">Datos del documento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de documento"
                options={[
                  "Licencia profesional",
                  "DNI",
                  "VTV",
                  "Seguro unidad",
                  "Póliza",
                  "ART",
                  "Constancia AFIP",
                  "Remito",
                  "Orden de carga",
                  "Otro",
                ]}
              />

              <Select
                label="Categoría"
                options={["Chofer", "Unidad", "Empresa", "Cliente", "Viaje"]}
              />

              <Field label="Nombre / descripción" placeholder="Ej: VTV unidad AB123CD" />
              <Field label="Número / referencia" placeholder="Ej: póliza, remito, OC..." />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-4">Vinculación</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Titular relacionado"
                options={[
                  "Juan Pérez",
                  "Luis Gómez",
                  "AB123CD",
                  "AC456EF",
                  "Easy",
                  "Cencosud",
                  "Transporte Nexo",
                ]}
              />

              <Field label="Fecha de emisión" type="date" />
              <Field label="Fecha de vencimiento" type="date" />
            </div>
          </section>

          <section className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
              <Upload size={24} className="text-slate-700" />
            </div>

            <h3 className="font-semibold text-slate-900">Arrastrá o seleccioná el archivo</h3>
            <p className="text-sm text-slate-500 mt-1">
              PDF, imagen o documento escaneado. Después se guardará en la ficha correspondiente.
            </p>

            <button className="mt-5 bg-slate-900 text-white rounded-xl px-5 py-3 text-sm">
              Seleccionar archivo
            </button>
          </section>

          <section className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-amber-700 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Control automático</h3>
                <p className="text-sm text-amber-900 mt-1">
                  Si cargás fecha de vencimiento, el sistema podrá alertar documentos por vencer
                  y bloquear asignaciones críticas en el futuro.
                </p>
              </div>
            </div>
          </section>

          <section>
            <label className="text-sm text-slate-600 mb-2 block">Observaciones internas</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none min-h-24"
              placeholder="Ej: documento solicitado por cliente, renovación pendiente, aclaraciones..."
            />
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            onClick={onClose}
            className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm"
          >
            Guardar documento
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  title,
  value,
  danger = false,
  warning = false,
}: any) {
  const color = danger
    ? "text-red-600"
    : warning
    ? "text-amber-600"
    : "text-slate-900";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
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
      <td className="p-4 text-blue-600 cursor-pointer font-medium">
        Ver archivo
      </td>
    </tr>
  );
}

function Field({
  label,
  placeholder = "",
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-2 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-2 block">{label}</label>
      <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}