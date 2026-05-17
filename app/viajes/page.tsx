"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, Plus, Truck } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, DataTable, PageHeader, StatCard } from "@/components/ui";
import { createTripAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { statusTone, tripRoute, type Client, type Driver, type Order, type Unit } from "@/lib/data";

export default function ViajesPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { clients, drivers, orders, trips, units } = useLiveData();
  const searchParams = useSearchParams();
  const selectedOrder = orders.find((order) => {
    const normalized = (searchParams.get("orden") ?? "").toLowerCase();
    return order.slug === normalized || order.code.toLowerCase() === normalized;
  });
  const findDriver = (slug: string) => drivers.find((driver) => driver.slug === slug);
  const findUnit = (id: string) => units.find((unit) => unit.id === id.toLowerCase());
  const clientNames = (slugs: string[]) =>
    slugs.map((slug) => clients.find((client) => client.slug === slug)?.name ?? slug).join(" + ");

  const normalized = query.trim().toLowerCase();
  const filteredTrips = normalized
    ? trips.filter((trip) => {
        const driver = findDriver(trip.driverSlug);
        const unit = findUnit(trip.unitId);
        const haystack = [
          trip.id,
          trip.status,
          trip.alert,
          trip.origin,
          trip.destination,
          clientNames(trip.clientSlugs),
          driver?.name,
          unit?.plate,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
    : trips;

  return (
    <div>
      <PageHeader
        title="Viajes"
        description="Gestión de viajes, clientes, paradas, estados y documentación."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={18} />
            Nuevo viaje
          </Button>
        }
      />

      {selectedOrder ? (
        <section className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-950">Orden seleccionada: {selectedOrder.code}</p>
              <p className="text-sm text-blue-800">
                {clientNames([selectedOrder.clientSlug])} · {selectedOrder.load} · {selectedOrder.origin} → {selectedOrder.destination}
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>Crear viaje desde orden</Button>
          </div>
        </section>
      ) : null}

      <section className="mb-6">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Buscar por cliente, destino, chofer, patente o estado..."
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Pendientes" value={String(trips.filter((trip) => trip.status === "Pendiente" || trip.status === "Asignado").length)} icon={<ClipboardList size={18} />} />
        <StatCard title="En carga" value={String(trips.filter((trip) => trip.status === "En carga").length)} icon={<Truck size={18} />} tone="amber" />
        <StatCard title="En viaje" value={String(trips.filter((trip) => trip.status === "En viaje").length)} icon={<Truck size={18} />} tone="green" />
        <StatCard title="Con incidencia" value={String(trips.filter((trip) => trip.alert !== "Sin alertas").length)} icon={<AlertTriangle size={18} />} tone="red" />
      </section>

      <DataTable
        data={filteredTrips}
        getKey={(trip) => trip.slug}
        columns={[
          {
            header: "ID",
            cell: (trip) => (
              <Link href={`/viajes/${trip.slug}`} className="font-medium text-blue-600 hover:underline">
                {trip.id}
              </Link>
            ),
          },
          {
            header: "Clientes / paradas",
            cell: (trip) => (
              <Link href={`/viajes/${trip.slug}/clientes`} className="font-medium text-blue-600 hover:underline">
                {clientNames(trip.clientSlugs)} · {trip.stops.length} paradas
              </Link>
            ),
          },
          { header: "Ruta", cell: (trip) => tripRoute(trip) },
          {
            header: "Chofer",
            cell: (trip) => {
              const driver = findDriver(trip.driverSlug);
              return driver ? (
                <Link href={`/choferes/${driver.slug}`} className="font-medium text-blue-600 hover:underline">
                  {driver.name}
                </Link>
              ) : (
                "Sin asignar"
              );
            },
          },
          {
            header: "Unidad",
            cell: (trip) => {
              const unit = findUnit(trip.unitId);
              return unit ? (
                <Link href={`/unidades/${unit.id}`} className="font-medium text-blue-600 hover:underline">
                  {unit.plate}
                </Link>
              ) : (
                "Sin unidad"
              );
            },
          },
          { header: "Estado", cell: (trip) => <Badge tone={statusTone(trip.status)}>{trip.status}</Badge> },
          { header: "Alertas", cell: (trip) => <Badge tone={trip.alert === "Sin alertas" ? "green" : "amber"}>{trip.alert}</Badge> },
        ]}
      />

      {open ? (
        <NewTripModal
          clients={clients}
          drivers={drivers}
          selectedOrder={selectedOrder}
          units={units}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function NewTripModal({
  clients,
  drivers,
  selectedOrder,
  units,
  onClose,
}: {
  clients: Client[];
  drivers: Driver[];
  selectedOrder?: Order;
  units: Unit[];
  onClose: () => void;
}) {
  const [stops, setStops] = useState([1]);

  const addStop = () => {
    setStops((prev) => [...prev, prev.length + 1]);
  };

  return (
    <ModalFrame
      title="Nuevo viaje"
      description="Armá la operación en pasos cortos: primero la ruta, después las paradas y al final la asignación."
      onClose={onClose}
      size="xl"
      footer={<ModalActions onCancel={onClose} confirmLabel="Crear viaje" submit formId="new-trip-form" />}
    >
      <form id="new-trip-form" action={createTripAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <input type="hidden" name="orderSlug" value={selectedOrder?.slug ?? ""} />

        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Guía rápida</p>
          <div className="mt-4 space-y-3">
            <Step number="1" title="Ruta" text="Fecha, origen y tipo de viaje." />
            <Step number="2" title="Paradas" text="Clientes, dirección y mercadería." />
            <Step number="3" title="Asignación" text="Chofer, unidad y estado inicial." />
            <Step number="4" title="Control" text="Alertas y estados para el chofer." />
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Badge tone="blue">1</Badge>
              <div>
                <h3 className="font-semibold text-slate-950">Ruta y operación</h3>
                <p className="text-sm text-slate-500">Los datos mínimos para identificar el viaje.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field name="date" label="Fecha de carga" type="date" required />
              <Field name="origin" label="Origen general" placeholder="Ej: Paraná" defaultValue={selectedOrder?.origin} required />
              <Field name="destination" label="Destino final" placeholder="Ej: Buenos Aires" defaultValue={selectedOrder?.destination} required />
              <Field name="assignedCash" label="Caja asignada" placeholder="Ej: 120000" defaultValue={selectedOrder ? 90000 : 0} />
              <Field name="alert" label="Alerta inicial" placeholder="Ej: Requiere turno / Sin alertas" defaultValue={selectedOrder?.risk ? selectedOrder.docs : "Sin alertas"} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-5">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge tone="blue">2</Badge>
                <div>
                  <h3 className="font-semibold text-slate-950">Paradas y clientes</h3>
                  <p className="text-sm text-slate-500">Cada parada puede tener su propio cliente, turno y mercadería.</p>
                </div>
              </div>

              <Button onClick={addStop}>
                <Plus size={18} />
                Agregar parada
              </Button>
            </div>

            <div className="space-y-5">
              {stops.map((stop, index) => (
                <StopCard
                  key={stop}
                  clients={clients}
                  defaultClientCode={index === 0 ? clients.find((client) => client.slug === selectedOrder?.clientSlug)?.code : undefined}
                  defaultGoods={index === 0 ? selectedOrder?.load : undefined}
                  number={index + 1}
                />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Badge tone="blue">3</Badge>
              <div>
                <h3 className="font-semibold text-slate-950">Asignación operativa</h3>
                <p className="text-sm text-slate-500">Podés dejarlo pendiente si todavía no está confirmado.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SelectField
                name="driverSlug"
                label="Chofer"
                options={[{ label: "Sin asignar", value: "sin-asignar" }, ...drivers.map((driver) => ({ label: driver.name, value: driver.slug }))]}
              />
              <SelectField
                name="unitId"
                label="Unidad"
                options={[{ label: "Sin unidad", value: "sin-asignar" }, ...units.map((unit) => ({ label: `${unit.brand} ${unit.model} · ${unit.plate}`, value: unit.id }))]}
              />
              <SelectField name="status" label="Estado inicial" options={["Pendiente", "Asignado", "En carga", "En viaje"]} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="blue">4</Badge>
              <h3 className="font-semibold text-slate-950">Estados que podrá informar el chofer</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">En camino</Badge>
              <Badge tone="green">Entregado</Badge>
              <Badge tone="amber">No disponible</Badge>
              <Badge tone="amber">Reprogramar</Badge>
              <Badge tone="red">Devolución parcial</Badge>
              <Badge tone="red">Devolución total</Badge>
            </div>
          </section>
        </div>
      </form>
    </ModalFrame>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-950">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function StopCard({
  clients,
  defaultClientCode,
  defaultGoods,
  number,
}: {
  clients: Client[];
  defaultClientCode?: string;
  defaultGoods?: string;
  number: number;
}) {
  const [clientCode, setClientCode] = useState(defaultClientCode ?? "");
  const normalizedCode = normalizeClientCode(clientCode);
  const selectedClient = clients.find((client) => {
    const normalizedClientCode = normalizeClientCode(client.code);
    return normalizedClientCode === normalizedCode || client.slug === clientCode.trim().toLowerCase();
  });
  const listId = `client-code-list-${number}`;
  const createClientHref = `/clientes?nuevo=1&codigo=${encodeURIComponent(normalizedCode || clientCode.trim())}`;
  const turnDefault = selectedClient?.requiresTurn ? "Requiere pedir turno" : "No requiere turno";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="font-semibold text-slate-950">Parada {number}</h4>
          <p className="text-sm text-slate-500">Cliente, dirección, mercadería y control de entrega.</p>
        </div>

        <Badge tone="amber">
          <AlertTriangle size={14} />
          Verificar si requiere turno
        </Badge>
      </div>

      <input type="hidden" name="stopClientSlug" value={selectedClient?.slug ?? ""} />
      <input type="hidden" name="stopRequiresTurn" value={selectedClient?.requiresTurn ? "Si" : "No"} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">Código de cliente</span>
          <input
            name="stopClientCode"
            value={clientCode}
            onChange={(event) => setClientCode(event.target.value)}
            list={listId}
            placeholder="Ej: CLI-0001 o 1"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            required
          />
          <datalist id={listId}>
            {clients.map((client) => (
              <option key={client.slug} value={client.code}>
                {client.name}
              </option>
            ))}
          </datalist>
        </label>
        <Field name="stopAddress" label="Dirección / destino" placeholder="Ej: Av. Siempre Viva 123" required />
        <Field key={`contact-${selectedClient?.code ?? "new"}`} name="stopContact" label="Contacto en destino" placeholder="Nombre / teléfono" defaultValue={selectedClient ? `${selectedClient.contact} · ${selectedClient.phone}` : ""} />
        <SelectField name="stopInitialStatus" label="Estado inicial de parada" options={["Pendiente", "En camino", "Entregado", "No disponible"]} />
        <Field name="stopGoods" label="Mercadería" placeholder="Ej: 12 aberturas / 4 pallets / remitos" defaultValue={defaultGoods} required />
        <Field key={`reception-${selectedClient?.code ?? "new"}`} name="stopReception" label="Horario / turno" placeholder="Ej: Turno 14:30" defaultValue={selectedClient?.reception ?? ""} />
        <SelectField
          key={`turn-${selectedClient?.code ?? "new"}`}
          name="stopTurnStatus"
          label="Control de turno"
          defaultValue={turnDefault}
          options={["No requiere turno", "Requiere pedir turno", "Turno ya solicitado"]}
        />
      </div>

      {selectedClient ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">
                  <CheckCircle2 size={14} />
                  Cliente cargado
                </Badge>
                <Badge tone="slate">{selectedClient.code}</Badge>
              </div>
              <h5 className="mt-2 font-semibold text-slate-950">{selectedClient.name}</h5>
              <p className="mt-1 text-sm text-slate-600">
                {selectedClient.contact} · {selectedClient.phone} · Recepción {selectedClient.reception}
              </p>
            </div>
            <Badge tone={selectedClient.requiresTurn ? "amber" : "green"}>
              {selectedClient.requiresTurn ? "Requiere turno" : "Operativo"}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedClient.requirements.map((requirement) => (
              <Badge key={requirement} tone="slate">
                <FileText size={14} />
                {requirement}
              </Badge>
            ))}
          </div>
        </div>
      ) : clientCode.trim() ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="amber">Cliente no encontrado</Badge>
              <p className="mt-2 text-sm text-amber-900">
                No existe el código {normalizeClientCode(clientCode)}. Crealo primero en Clientes para guardar su ficha e historial.
              </p>
            </div>
            <Link href={createClientHref} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Crear en Clientes
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Ingresá el código del cliente para traer contacto, horarios, requisitos y alertas. Si no existe, primero cargalo desde Clientes.
        </div>
      )}

      <div className="mt-4">
        <TextArea
          name="stopNote"
          label="Observaciones para el chofer"
          placeholder="Instrucciones de descarga, contacto, ingreso, documentación requerida..."
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-medium text-slate-950">Devolución / incidencia</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField label="Tipo de devolución" options={["Sin devolución", "Parcial", "Total", "No disponible / vuelve otro día"]} />
          <Field label="Detalle de lo que vuelve" placeholder="Ej: 2 bultos, remito 0001..." />
        </div>
      </div>
    </div>
  );
}

function normalizeClientCode(value: string) {
  const trimmed = value.trim().toUpperCase();

  if (/^\d+$/.test(trimmed)) {
    return `CLI-${trimmed.padStart(4, "0")}`;
  }

  return trimmed.replace(/\s+/g, "-");
}
