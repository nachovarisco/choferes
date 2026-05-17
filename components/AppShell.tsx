"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Truck,
  Users,
  Wrench,
  Wallet,
} from "lucide-react";
import { useLiveData } from "@/components/use-live-data";
import type { LiveData } from "@/lib/live-data";
import { cn } from "./ui";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Viajes", href: "/viajes", icon: Truck },
  { name: "Órdenes de carga", href: "/ordenes", icon: ClipboardList },
  { name: "Choferes", href: "/choferes", icon: Users },
  { name: "Unidades", href: "/unidades", icon: Building2 },
  { name: "Clientes", href: "/clientes", icon: Building2 },
  { name: "Documentos", href: "/documentos", icon: FileText },
  { name: "Incidencias", href: "/alertas", icon: AlertTriangle },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Caja", href: "/caja", icon: Wallet },
  { name: "Mantenimiento", href: "/mantenimiento", icon: Wrench },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const data = useLiveData();
  const openIncidents = data.incidents.filter((incident) => incident.type !== "Resuelta").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <Sidebar
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            className="absolute left-0 top-0 h-full w-72"
          />
        </div>
      ) : null}

      <Sidebar pathname={pathname} className="sticky top-0 hidden h-screen w-64 shrink-0 md:flex" />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white md:hidden"
              >
                <Menu size={20} />
              </button>

              <GlobalSearch data={data} className="hidden w-full max-w-xl lg:block" />
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:block">
                Sucursal Paraná
              </div>

              <Link
                href="/alertas"
                aria-label="Notificaciones"
                className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              >
                <Bell size={19} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {openIncidents}
                </span>
              </Link>

              <Link href="/perfil" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  I
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-950">Ignacio</p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="px-4 pb-4 lg:hidden">
            <GlobalSearch data={data} />
          </div>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

function GlobalSearch({ data, className }: { data: LiveData; className?: string }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (normalized.length < 2) {
      return [];
    }

    const clientName = (slug: string) => data.clients.find((client) => client.slug === slug)?.name ?? slug;
    const matches = [
      ...data.trips.map((trip) => ({
        href: `/viajes/${trip.slug}`,
        title: trip.id,
        eyebrow: "Viaje",
        body: `${trip.origin} → ${trip.destination} · ${trip.clientSlugs.map(clientName).join(" + ")}`,
      })),
      ...data.orders.map((order) => ({
        href: `/ordenes/${order.slug}`,
        title: order.code,
        eyebrow: "Orden",
        body: `${clientName(order.clientSlug)} · ${order.load}`,
      })),
      ...data.drivers.map((driver) => ({
        href: `/choferes/${driver.slug}`,
        title: driver.name,
        eyebrow: "Chofer",
        body: `${driver.status} · ${driver.phone}`,
      })),
      ...data.units.map((unit) => ({
        href: `/unidades/${unit.id}`,
        title: unit.plate,
        eyebrow: "Unidad",
        body: `${unit.brand} ${unit.model} · ${unit.status}`,
      })),
      ...data.clients.map((client) => ({
        href: `/clientes/${client.slug}`,
        title: `${client.code} · ${client.name}`,
        eyebrow: "Cliente",
        body: `${client.contact} · ${client.status}`,
      })),
      ...data.documents.map((document) => ({
        href: "/documentos",
        title: document.name,
        eyebrow: "Documento",
        body: `${document.owner} · ${document.status}`,
      })),
    ];

    return matches
      .filter((item) => `${item.title} ${item.eyebrow} ${item.body}`.toLowerCase().includes(normalized))
      .slice(0, 7);
  }, [data, normalized]);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
        <Search size={18} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Buscar viajes, choferes, unidades..."
        />
      </div>

      {results.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {results.map((item) => (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              onClick={() => setQuery("")}
              className="block border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.eyebrow}</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{item.body}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <aside className={cn("flex flex-col bg-slate-950 p-5 text-white", className)}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Transporte</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">NEXO</h1>
        <p className="mt-1 text-xs text-slate-400">Sistema logístico</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold">Transporte Nexo SRL</p>
        <p className="mt-1 text-xs text-slate-400">Plan Profesional</p>

        <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
          <div className="h-2 w-2/3 rounded-full bg-blue-500" />
        </div>

        <p className="mt-2 text-xs text-slate-400">Usuarios: 18 / 30</p>
      </div>
    </aside>
  );
}
