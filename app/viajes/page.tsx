"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Search, X } from "lucide-react";

export default function ViajesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Viajes</h1>
          <p className="text-slate-500 mt-1">
            Gestión de viajes, clientes, paradas, estados y documentación.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm"
        >
          Nuevo viaje
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por cliente, destino, chofer, patente o estado..."
          />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Pendientes" value="4" />
        <MiniCard title="En carga" value="3" />
        <MiniCard title="En viaje" value="8" />
        <MiniCard title="Con incidencia" value="2" danger />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="p-4">ID</th>
                <th className="p-4">Clientes / paradas</th>
                <th className="p-4">Ruta</th>
                <th className="p-4">Chofer</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Alertas</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <TravelRow
                id="VJ-000124"
                stops="Easy + Dhinox · 2 paradas"
                route="Paraná → Buenos Aires"
                driver="Juan Pérez"
                unit="AB123CD"
                status="En viaje"
                alert="Easy requiere turno"
              />

              <TravelRow
                id="VJ-000125"
                stops="Cencosud · 1 parada"
                route="Rosario → Córdoba"
                driver="Luis Gómez"
                unit="AC456EF"
                status="En carga"
                alert="Documentación pendiente"
              />

              <TravelRow
                id="VJ-000126"
                stops="Dhinox + Julicroc + Lafedar · 3 paradas"
                route="Santa Fe → Mendoza"
                driver="Carlos Díaz"
                unit="AD789GH"
                status="Asignado"
                alert="Sin alertas"
              />
            </tbody>
          </table>
        </div>
      </div>

      {open && <NewTripModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function NewTripModal({ onClose }: { onClose: () => void }) {
  const [stops, setStops] = useState([1]);

  const addStop = () => {
    setStops((prev) => [...prev, prev.length + 1]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full md:max-w-5xl rounded-t-3xl md:rounded-3xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nuevo viaje</h2>
            <p className="text-sm text-slate-500 mt-1">
              Cargá un viaje con múltiples clientes, paradas y estados operativos.
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
            <h3 className="font-semibold text-slate-900 mb-4">Datos generales</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Fecha de carga" type="date" />
              <Field label="Origen general" placeholder="Ej: Paraná" />
              <Field label="Tipo de operación" placeholder="Distribución / equipo completo" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Paradas / clientes</h3>
                <p className="text-sm text-slate-500">
                  Agregá todos los clientes y lugares que el chofer debe visitar.
                </p>
              </div>

              <button
                onClick={addStop}
                className="bg-slate-900 text-white rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar parada
              </button>
            </div>

            <div className="space-y-5">
              {stops.map((stop, index) => (
                <StopCard key={stop} number={index + 1} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-4">Asignación</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Chofer"
                options={["Juan Pérez", "Luis Gómez", "Carlos Díaz", "Sin asignar"]}
              />
              <Select
                label="Unidad"
                options={["Volvo 370 · AB123CD", "Scania 360 · AC456EF", "Iveco Cursor · AE321JK"]}
              />
              <Select
                label="Estado inicial"
                options={["Pendiente", "Asignado", "En carga", "En viaje"]}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">
              Estados que podrá informar el chofer por parada
            </h3>

            <div className="flex flex-wrap gap-2">
              <Tag text="En camino" blue />
              <Tag text="Entregado" green />
              <Tag text="No disponible" amber />
              <Tag text="Reprogramar" amber />
              <Tag text="Devolución parcial" red />
              <Tag text="Devolución total" red />
            </div>
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
            Crear viaje
          </button>
        </div>
      </div>
    </div>
  );
}

function StopCard({ number }: { number: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div>
          <h4 className="font-semibold text-slate-900">Parada {number}</h4>
          <p className="text-sm text-slate-500">
            Cliente, dirección, mercadería y control de entrega.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium inline-flex items-center gap-2 w-fit">
          <AlertTriangle size={14} />
          Verificar si requiere turno
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Cliente"
          options={["Easy", "Cencosud", "Dhinox", "Julicroc", "Lafedar", "Otro"]}
        />
        <Field label="Dirección / destino" placeholder="Ej: Av. Siempre Viva 123" />

        <Field label="Contacto en destino" placeholder="Nombre / teléfono" />
        <Select
          label="Estado inicial de parada"
          options={["Pendiente", "En camino", "Entregado", "No disponible", "Devolución"]}
        />

        <Field label="Mercadería" placeholder="Ej: 12 aberturas / 4 pallets / remitos" />
        <Field label="Horario / turno" placeholder="Ej: Turno 14:30" />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <CheckOption text="Requiere pedir turno" />
        <CheckOption text="Turno ya solicitado" />
        <CheckOption text="Requiere documentación previa" />
      </div>

      <div className="mt-4">
        <label className="text-sm text-slate-600 mb-2 block">
          Observaciones para el chofer
        </label>
        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none min-h-24"
          placeholder="Instrucciones de descarga, contacto, ingreso, documentación requerida..."
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900 mb-2">
          Devolución / incidencia
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de devolución"
            options={["Sin devolución", "Parcial", "Total", "No disponible / vuelve otro día"]}
          />
          <Field label="Detalle de lo que vuelve" placeholder="Ej: 2 bultos, remito 0001..." />
        </div>
      </div>
    </div>
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

function CheckOption({ text }: { text: string }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
      <input type="checkbox" className="w-4 h-4" />
      {text}
    </label>
  );
}

function Tag({
  text,
  blue = false,
  green = false,
  amber = false,
  red = false,
}: any) {
  const color = blue
    ? "bg-blue-100 text-blue-700"
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

function TravelRow({ id, stops, route, driver, unit, status, alert }: any) {
  const statusColor =
    status === "Demorado"
      ? "bg-red-100 text-red-700"
      : status === "En carga"
      ? "bg-amber-100 text-amber-700"
      : status === "Asignado"
      ? "bg-blue-100 text-blue-700"
      : status === "Pendiente"
      ? "bg-slate-100 text-slate-700"
      : "bg-emerald-100 text-emerald-700";

  const alertColor =
    alert === "Sin alertas"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4 font-medium text-slate-900">{id}</td>
      <td className="p-4">{stops}</td>
      <td className="p-4">{route}</td>
      <td className="p-4">{driver}</td>
      <td className="p-4">{unit}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${alertColor}`}>
          {alert}
        </span>
      </td>
    </tr>
  );
}