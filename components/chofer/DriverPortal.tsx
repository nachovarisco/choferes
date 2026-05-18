"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  Upload,
  UserRound,
} from "lucide-react";
import { Badge, cn } from "@/components/ui";
import { useLiveData } from "@/components/use-live-data";
import type { Tone } from "@/lib/data";
import { addDemoDocument, addDemoIncident, saveDemoLiveData } from "@/lib/demo-store";

type DriverStage =
  | "esperando"
  | "asignado"
  | "atracar"
  | "cargando"
  | "carga-finalizada"
  | "en-viaje"
  | "entregando"
  | "disponible";

type TabKey = "viaje" | "paradas" | "documentos" | "incidencias" | "notificaciones";

type StopStatus = "Pendiente" | "En camino" | "En descarga" | "Entregado" | "No disponible";

const stageCopy: Record<DriverStage, { label: string; detail: string; tone: Tone }> = {
  esperando: {
    label: "Esperando viaje",
    detail: "Estas disponible. Trafico todavia no asigno una carga.",
    tone: "slate",
  },
  asignado: {
    label: "Viaje asignado",
    detail: "Confirma recepcion y revisa documentacion antes de salir.",
    tone: "blue",
  },
  atracar: {
    label: "Llevar a atracar",
    detail: "Dirigite al punto de carga y espera validacion de carga/logistica.",
    tone: "amber",
  },
  cargando: {
    label: "Cargando",
    detail: "Carga en proceso. Avisar cualquier diferencia de bultos o remitos.",
    tone: "amber",
  },
  "carga-finalizada": {
    label: "Carga finalizada",
    detail: "Carga completa. Esperando salida a ruta.",
    tone: "green",
  },
  "en-viaje": {
    label: "En viaje",
    detail: "Viaje activo. Mantene actualizadas las paradas.",
    tone: "blue",
  },
  entregando: {
    label: "Entregando",
    detail: "Estas descargando o esperando recepcion del cliente.",
    tone: "amber",
  },
  disponible: {
    label: "Disponible",
    detail: "Sin tareas activas. Listo para una nueva asignacion.",
    tone: "green",
  },
};

const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "viaje", label: "Mi viaje", icon: <Truck size={17} /> },
  { key: "paradas", label: "Paradas", icon: <MapPin size={17} /> },
  { key: "documentos", label: "Docs", icon: <FileText size={17} /> },
  { key: "incidencias", label: "Reclamos", icon: <AlertTriangle size={17} /> },
  { key: "notificaciones", label: "Avisos", icon: <Bell size={17} /> },
];

const mockDriver = {
  name: "Juan Perez",
  phone: "343 555-1200",
  status: "Activo",
  category: "Nexo Aberturas",
  validation: "Celular validado",
  company: "Transporte Nexo",
};

const mockTrip = {
  id: "VJ-000128",
  origin: "Parana",
  destination: "Buenos Aires",
  unit: "AB123CD",
  unitState: "Operativa",
  load: "Aberturas - 18 bultos",
  eta: "18:40",
  assignedAt: "08:15",
  docs: "Remito pendiente de foto",
  alerts: ["Easy requiere turno", "Seguro unidad vigente", "Confirmar remito fisico"],
};

const initialStops = [
  {
    id: "easy",
    number: 1,
    client: "Easy",
    address: "Centro de distribucion Buenos Aires",
    goods: "Aberturas - 12 bultos",
    contact: "Operaciones BA - 11 5555-1200",
    reception: "Turno 14:30",
    status: "Pendiente" as StopStatus,
    alert: "Requiere turno",
    requiresTurn: true,
  },
  {
    id: "dhinox",
    number: 2,
    client: "Dhinox",
    address: "Deposito Zona Sur",
    goods: "Mercaderia general - 6 bultos",
    contact: "Deposito Santa Fe - 342 555-3340",
    reception: "09:00 a 17:00",
    status: "Pendiente" as StopStatus,
    alert: "Avisar 30 min antes",
    requiresTurn: false,
  },
];

const initialEvents = [
  "Viaje asignado por trafico.",
  "Unidad AB123CD asociada al viaje.",
  "Documentacion basica verificada.",
];

export default function DriverPortal() {
  const [activeTab, setActiveTab] = useState<TabKey>("viaje");
  const [stage, setStage] = useState<DriverStage>("asignado");
  const [stops, setStops] = useState(initialStops);
  const [events, setEvents] = useState(initialEvents);
  const [incidentText, setIncidentText] = useState("");
  const [lastUpload, setLastUpload] = useState("");
  const data = useLiveData();
  const currentStage = stageCopy[stage];
  const deliveredStops = stops.filter((stop) => stop.status === "Entregado").length;
  const nextStop = stops.find((stop) => stop.status !== "Entregado") ?? stops[0];

  const driverAvailability = useMemo(() => {
    if (stage === "esperando" || stage === "disponible") return "Disponible";
    if (stage === "asignado") return "Viaje asignado";
    if (stage === "en-viaje") return "En ruta";
    if (stage === "entregando") return "Entregando";
    return "Operando";
  }, [stage]);

  const pushEvent = (message: string) => {
    setEvents((prev) => [`${new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} - ${message}`, ...prev]);
  };

  const setTripStage = (nextStage: DriverStage, message: string) => {
    setStage(nextStage);
    pushEvent(message);
  };

  const updateStop = (id: string, status: StopStatus) => {
    setStops((prev) => prev.map((stop) => stop.id === id ? { ...stop, status } : stop));
    if (status === "Entregado") setStage("entregando");
    pushEvent(`Parada ${id.toUpperCase()}: ${status}.`);
  };

  const reportIncident = () => {
    if (!incidentText.trim()) return;
    pushEvent(`Incidencia reportada: ${incidentText.trim()}`);
    const formData = new FormData();
    formData.set("priority", "Alta");
    formData.set("type", "Chofer");
    formData.set("title", "Incidencia reportada por chofer");
    formData.set("owner", mockTrip.id);
    formData.set("detail", incidentText.trim());
    const result = addDemoIncident(data, formData);
    saveDemoLiveData(result.data, result.label);
    setIncidentText("");
    setActiveTab("notificaciones");
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[420px_1fr]">
        <main className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-slate-950 shadow-2xl lg:min-h-[calc(100vh-32px)] lg:self-center lg:rounded-[28px] lg:border lg:border-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.34),_transparent_58%)]" />
          <div className="relative px-4 pb-28 pt-5">
            <Header availability={driverAvailability} />

            <section className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.08] p-4 shadow-xl backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/80">Estado actual</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight">{currentStage.label}</h1>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{currentStage.detail}</p>
                </div>
                <Badge tone={currentStage.tone}>{driverAvailability}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric label="Viaje" value={mockTrip.id} />
                <Metric label="Unidad" value={mockTrip.unit} />
                <Metric label="ETA" value={mockTrip.eta} />
              </div>
            </section>

            <nav className="mt-4 grid grid-cols-5 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-semibold transition",
                    activeTab === tab.key
                      ? "border-blue-300 bg-blue-500 text-white shadow-lg shadow-blue-950/40"
                      : "border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <section className="mt-4">
              {activeTab === "viaje" ? (
                <TripView
                  deliveredStops={deliveredStops}
                  nextStop={nextStop}
                  onStage={setTripStage}
                  stage={stage}
                  totalStops={stops.length}
                />
              ) : null}
              {activeTab === "paradas" ? <StopsView onUpdateStop={updateStop} stops={stops} /> : null}
              {activeTab === "documentos" ? (
                <DocumentsView
                  lastUpload={lastUpload}
                  onUpload={(fileName) => {
                    setLastUpload(fileName);
                    const formData = new FormData();
                    formData.set("name", "Remito/foto chofer");
                    formData.set("category", "Viaje");
                    formData.set("association", "Viaje / Chofer");
                    formData.set("owner", `${mockTrip.id} - ${mockDriver.name}`);
                    formData.set("due", "");
                    const result = addDemoDocument(data, formData);
                    saveDemoLiveData(result.data, result.label);
                    pushEvent(`Archivo preparado para subir: ${fileName}`);
                  }}
                />
              ) : null}
              {activeTab === "incidencias" ? (
                <IncidentsView
                  incidentText={incidentText}
                  onChangeIncident={setIncidentText}
                  onReportIncident={reportIncident}
                />
              ) : null}
              {activeTab === "notificaciones" ? <NotificationsView events={events} /> : null}
            </section>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-white/10 bg-slate-950/94 px-4 py-3 backdrop-blur lg:absolute">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTripStage("en-viaje", "Chofer marco en viaje.")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-slate-950 shadow-xl"
              >
                <Navigation size={19} />
                En viaje
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("incidencias")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] text-sm font-bold text-white"
              >
                <AlertTriangle size={19} />
                Incidencia
              </button>
            </div>
          </div>
        </main>

        <aside className="hidden min-h-screen p-8 text-slate-100 lg:block">
          <div className="sticky top-8 space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Portal Chofer</p>
              <h2 className="mt-3 max-w-xl text-4xl font-black tracking-tight">Experiencia mobile-first para ruta, carga y entrega.</h2>
              <p className="mt-4 max-w-xl text-slate-300">
                Esta vista usa datos mockeados y estado local. Queda preparada para login por rol, validacion por celular, PIN, empresa asociada y almacenamiento cloud.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DesktopCard icon={<ShieldCheck size={20} />} title="Roles futuros" text="Admin, administrativo y chofer con permisos separados." />
              <DesktopCard icon={<Phone size={20} />} title="Validacion" text="Alta por empresa, celular validado y PIN por mensaje." />
              <DesktopCard icon={<Gauge size={20} />} title="Operativo" text="Estados reales de carga, atracar, ruta y entrega." />
              <DesktopCard icon={<Upload size={20} />} title="Cloud ready" text="Storage para fotos, remitos y comprobantes." />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <h3 className="font-bold">Arquitectura sugerida despues</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Vercel:</span> frontend Next.js y despliegues rapidos.</p>
                <p><span className="font-semibold text-white">Supabase o Cloud SQL:</span> base relacional para viajes, roles y auditoria.</p>
                <p><span className="font-semibold text-white">Firebase Auth/FCM:</span> login celular, PIN y notificaciones push.</p>
                <p><span className="font-semibold text-white">Cloud Storage:</span> remitos, fotos, comprobantes y documentacion.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Header({ availability }: { availability: string }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
          <UserRound size={21} />
        </div>
        <div>
          <p className="text-sm font-bold">{mockDriver.name}</p>
          <p className="text-xs text-slate-400">{mockDriver.company}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-right">
        <p className="text-[11px] text-slate-400">Chofer</p>
        <p className="text-xs font-bold">{availability}</p>
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function TripView({
  deliveredStops,
  nextStop,
  onStage,
  stage,
  totalStops,
}: {
  deliveredStops: number;
  nextStop: (typeof initialStops)[number];
  onStage: (stage: DriverStage, message: string) => void;
  stage: DriverStage;
  totalStops: number;
}) {
  const actions: Array<{ label: string; stage: DriverStage; message: string; icon: React.ReactNode }> = [
    { label: "Recibi el viaje", stage: "asignado", message: "Chofer confirmo recepcion del viaje.", icon: <ClipboardCheck size={20} /> },
    { label: "En camino a cargar", stage: "atracar", message: "Chofer salio hacia punto de carga.", icon: <Navigation size={20} /> },
    { label: "Llegue a cargar", stage: "atracar", message: "Chofer llego a cargar. Pendiente validar atracado.", icon: <MapPin size={20} /> },
    { label: "Cargando", stage: "cargando", message: "Carga iniciada.", icon: <Package size={20} /> },
    { label: "Carga finalizada", stage: "carga-finalizada", message: "Carga finalizada.", icon: <CheckCircle2 size={20} /> },
    { label: "En viaje", stage: "en-viaje", message: "Viaje iniciado.", icon: <Truck size={20} /> },
  ];

  return (
    <div className="space-y-4">
      <CardSurface>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Viaje asignado</p>
            <h2 className="mt-1 text-xl font-black">{mockTrip.id}</h2>
            <p className="mt-1 text-sm text-slate-500">{mockTrip.origin} a {mockTrip.destination}</p>
          </div>
          <Badge tone={stageCopy[stage].tone}>{stageCopy[stage].label}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <InfoItem icon={<UserRound size={17} />} label="Chofer" value={mockDriver.name} />
          <InfoItem icon={<Truck size={17} />} label="Unidad" value={`${mockTrip.unit} - ${mockTrip.unitState}`} />
          <InfoItem icon={<Package size={17} />} label="Carga" value={mockTrip.load} />
          <InfoItem icon={<Clock size={17} />} label="Asignado" value={mockTrip.assignedAt} />
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">Proxima accion</p>
          <p className="mt-1 font-bold text-blue-950">{nextStop.client}</p>
          <p className="mt-1 text-sm text-blue-800">{nextStop.address}</p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Progreso de paradas</span>
          <span className="font-black text-slate-950">{deliveredStops}/{totalStops}</span>
        </div>
      </CardSurface>

      <CardSurface>
        <h3 className="font-bold">Acciones rapidas</h3>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onStage(action.stage, action.message)}
              className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">{action.icon}{action.label}</span>
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      </CardSurface>
    </div>
  );
}

function StopsView({
  onUpdateStop,
  stops,
}: {
  onUpdateStop: (id: string, status: StopStatus) => void;
  stops: typeof initialStops;
}) {
  return (
    <div className="space-y-3">
      {stops.map((stop) => (
        <CardSurface key={stop.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Parada {stop.number}</p>
              <h3 className="mt-1 text-lg font-black">{stop.client}</h3>
              <p className="mt-1 text-sm text-slate-500">{stop.address}</p>
            </div>
            <Badge tone={stop.status === "Entregado" ? "green" : stop.status === "No disponible" ? "red" : "blue"}>
              {stop.status}
            </Badge>
          </div>

          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><Package size={16} />{stop.goods}</p>
            <p className="flex items-center gap-2"><Phone size={16} />{stop.contact}</p>
            <p className="flex items-center gap-2"><Clock size={16} />{stop.reception}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={stop.requiresTurn ? "amber" : "green"}>{stop.alert}</Badge>
            {stop.requiresTurn ? <Badge tone="amber">Validar turno</Badge> : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ActionButton label="En camino" onClick={() => onUpdateStop(stop.id, "En camino")} />
            <ActionButton label="Llegue" onClick={() => onUpdateStop(stop.id, "En descarga")} />
            <ActionButton label="Entregado" onClick={() => onUpdateStop(stop.id, "Entregado")} primary />
            <ActionButton label="No disponible" onClick={() => onUpdateStop(stop.id, "No disponible")} danger />
          </div>
        </CardSurface>
      ))}
    </div>
  );
}

function DocumentsView({
  lastUpload,
  onUpload,
}: {
  lastUpload: string;
  onUpload: (fileName: string) => void;
}) {
  return (
    <div className="space-y-4">
      <CardSurface>
        <h3 className="font-bold">Documentacion del viaje</h3>
        <div className="mt-3 space-y-2">
          <DocRow label="Remito firmado" status="Pendiente" tone="amber" />
          <DocRow label="Foto de entrega" status="A subir" tone="slate" />
          <DocRow label="Comprobante de peaje" status="Opcional" tone="blue" />
          <DocRow label="Seguro unidad" status="Vigente" tone="green" />
        </div>
      </CardSurface>

      <CardSurface>
        <h3 className="font-bold">Subir archivo</h3>
        <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm font-bold text-slate-700">
          <Camera size={24} />
          Foto, remito o comprobante
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(event) => onUpload(event.target.files?.[0]?.name ?? "archivo seleccionado")}
          />
        </label>
        {lastUpload ? <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{lastUpload}</p> : null}
      </CardSurface>
    </div>
  );
}

function IncidentsView({
  incidentText,
  onChangeIncident,
  onReportIncident,
}: {
  incidentText: string;
  onChangeIncident: (value: string) => void;
  onReportIncident: () => void;
}) {
  return (
    <div className="space-y-4">
      <CardSurface>
        <h3 className="font-bold">Reportar incidencia o reclamo</h3>
        <textarea
          value={incidentText}
          onChange={(event) => onChangeIncident(event.target.value)}
          placeholder="Ej: cliente no recibe, bulto dañado, demora, falta remito..."
          className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={onReportIncident}
          className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-bold text-white"
        >
          <AlertTriangle size={18} />
          Enviar reclamo
        </button>
      </CardSurface>

      <CardSurface>
        <h3 className="font-bold">Tipos frecuentes</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["Demora", "No recibe", "Devolucion", "Falta remito", "Rotura", "Unidad"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChangeIncident(item)}
              className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700"
            >
              {item}
            </button>
          ))}
        </div>
      </CardSurface>
    </div>
  );
}

function NotificationsView({ events }: { events: string[] }) {
  return (
    <div className="space-y-4">
      <CardSurface>
        <h3 className="font-bold">Notificaciones</h3>
        <div className="mt-3 space-y-3">
          <Notice icon={<Bell size={18} />} title="Turno Easy" text="Recorda presentarte 10 minutos antes del turno." tone="amber" />
          <Notice icon={<ShieldCheck size={18} />} title="Documentacion" text={mockTrip.docs} tone="blue" />
          <Notice icon={<CircleDot size={18} />} title="Unidad" text={`${mockTrip.unit} figura ${mockTrip.unitState.toLowerCase()}.`} tone="green" />
        </div>
      </CardSurface>

      <CardSurface>
        <h3 className="font-bold">Trazabilidad local</h3>
        <div className="mt-3 space-y-2">
          {events.map((event) => (
            <div key={event} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {event}
            </div>
          ))}
        </div>
      </CardSurface>
    </div>
  );
}

function CardSurface({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] bg-white p-4 text-slate-950 shadow-xl">
      {children}
    </section>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ActionButton({
  danger = false,
  label,
  onClick,
  primary = false,
}: {
  danger?: boolean;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-2xl px-3 text-sm font-bold shadow-sm",
        primary ? "bg-slate-950 text-white" : danger ? "bg-red-50 text-red-700" : "border border-slate-200 bg-white text-slate-700",
      )}
    >
      {label}
    </button>
  );
}

function DocRow({ label, status, tone }: { label: string; status: string; tone: Tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <FileText size={16} />
        {label}
      </span>
      <Badge tone={tone}>{status}</Badge>
    </div>
  );
}

function Notice({ icon, text, title, tone }: { icon: React.ReactNode; text: string; title: string; tone: Tone }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <span className={cn("mt-0.5", tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : "text-blue-600")}>{icon}</span>
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function DesktopCard({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">{icon}</div>
      <p className="font-bold text-white">{title}</p>
      <p className="mt-2 text-sm leading-5 text-slate-300">{text}</p>
    </div>
  );
}
