"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  Menu,
  Route,
  Search,
  Settings,
  Smartphone,
  Truck,
  Users,
  Wrench,
  Wallet,
} from "lucide-react";
import { useLiveData } from "@/components/use-live-data";
import { clearDemoLiveData, demoDataEvent, demoSummary } from "@/lib/demo-store";
import type { CompanyBrand, LiveData } from "@/lib/live-data";
import { cn } from "./ui";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { name: "Onboarding", href: "/onboarding", icon: ClipboardList, permission: "settings.view" },
  { name: "Demo V1", href: "/demo-operativa", icon: Route, permission: "settings.view" },
  { name: "Portal Chofer", href: "/chofer", icon: Smartphone, permission: "driver_app.use" },
  { name: "Viajes", href: "/viajes", icon: Truck, permission: "trips.view" },
  { name: "Ordenes de carga", href: "/ordenes", icon: ClipboardList, permission: "orders.manage" },
  { name: "Choferes", href: "/choferes", icon: Users, permission: "drivers.manage" },
  { name: "Unidades", href: "/unidades", icon: Building2, permission: "units.manage" },
  { name: "Clientes", href: "/clientes", icon: Building2, permission: "clients.manage" },
  { name: "Documentos", href: "/documentos", icon: FileText, permission: "documents.manage" },
  { name: "Incidencias", href: "/alertas", icon: AlertTriangle, permission: "incidents.manage" },
  { name: "Reportes", href: "/reportes", icon: BarChart3, permission: "reports.view" },
  { name: "Caja", href: "/caja", icon: Wallet, permission: "cash.view" },
  { name: "Mantenimiento", href: "/mantenimiento", icon: Wrench, permission: "maintenance.view" },
  { name: "Planes SaaS", href: "/planes", icon: CreditCard, permission: "settings.view" },
  { name: "Configuracion", href: "/configuracion", icon: Settings, permission: "settings.view" },
  { name: "Estado V1", href: "/estado-v1", icon: ListChecks, permission: "settings.view" },
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
  const [brandOverride, setBrandOverride] = useState<CompanyBrand | null>(null);
  const [demoMode, setDemoMode] = useState<ReturnType<typeof demoSummary>>(null);
  const data = useLiveData();
  const company = brandOverride ?? data.company;
  const openIncidents = data.incidents.filter((incident) => incident.type !== "Resuelta").length;

  useEffect(() => {
    function loadDemoBrand() {
      try {
        const raw = window.localStorage.getItem("nexo-demo-brand");
        setBrandOverride(raw ? { ...data.company, ...(JSON.parse(raw) as Partial<CompanyBrand>) } : null);
      } catch {
        setBrandOverride(null);
      }
    }

    loadDemoBrand();
    window.addEventListener("nexo-brand-updated", loadDemoBrand);

    return () => window.removeEventListener("nexo-brand-updated", loadDemoBrand);
  }, [data.company]);

  useEffect(() => {
    const loadDemoMode = () => setDemoMode(demoSummary());
    const timeoutId = window.setTimeout(loadDemoMode, 0);

    window.addEventListener(demoDataEvent, loadDemoMode);
    window.addEventListener("storage", loadDemoMode);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(demoDataEvent, loadDemoMode);
      window.removeEventListener("storage", loadDemoMode);
    };
  }, []);

  if (pathname.startsWith("/chofer") || pathname.startsWith("/app-chofer")) {
    return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen text-slate-900 md:flex" style={{ backgroundColor: company.backgroundColor }}>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <Sidebar
            pathname={pathname}
            company={company}
            permissions={data.currentUser.permissions}
            onNavigate={() => setMobileOpen(false)}
            className="absolute left-0 top-0 h-full w-72"
          />
        </div>
      ) : null}

      <Sidebar pathname={pathname} company={company} permissions={data.currentUser.permissions} className="sticky top-0 hidden h-screen w-64 shrink-0 md:flex" />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white md:hidden"
              >
                <Menu size={20} />
              </button>

              <GlobalSearch data={data} className="hidden w-full max-w-xl lg:block" />
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:block">
                Sucursal {company.branchName}
              </div>

              <Link
                href="/notificaciones"
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
                  <p className="text-sm font-medium text-slate-950">{data.currentUser.name}</p>
                  <p className="text-xs text-slate-500">{data.currentUser.roleName}</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="px-4 pb-4 lg:hidden">
            <GlobalSearch data={data} />
          </div>
        </header>

        <div className="p-4 md:p-8">
          {demoMode ? (
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold">Modo demo local activo</p>
                <p className="mt-1 text-blue-800">{demoMode.events[0] ?? "Datos guardados localmente para probar la Fase 1."}</p>
              </div>
              <button
                type="button"
                onClick={clearDemoLiveData}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 font-medium text-blue-900 hover:bg-blue-100"
              >
                Reiniciar demo
              </button>
            </div>
          ) : null}
          {children}
        </div>
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
        body: `${trip.origin} -> ${trip.destination} - ${trip.clientSlugs.map(clientName).join(" + ")}`,
      })),
      ...data.orders.map((order) => ({
        href: `/ordenes/${order.slug}`,
        title: order.code,
        eyebrow: "Orden",
        body: `${clientName(order.clientSlug)} - ${order.load}`,
      })),
      ...data.drivers.map((driver) => ({
        href: `/choferes/${driver.slug}`,
        title: driver.name,
        eyebrow: "Chofer",
        body: `${driver.status} - ${driver.phone}`,
      })),
      ...data.units.map((unit) => ({
        href: `/unidades/${unit.id}`,
        title: unit.plate,
        eyebrow: "Unidad",
        body: `${unit.brand} ${unit.model} - ${unit.status}`,
      })),
      ...data.clients.map((client) => ({
        href: `/clientes/${client.slug}`,
        title: `${client.code} - ${client.name}`,
        eyebrow: "Cliente",
        body: `${client.contact} - ${client.status}`,
      })),
      ...data.documents.map((document) => ({
        href: "/documentos",
        title: document.name,
        eyebrow: "Documento",
        body: `${document.owner} - ${document.status}`,
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
  company,
  permissions,
  pathname,
  onNavigate,
  className,
}: {
  company: CompanyBrand;
  permissions: string[];
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const canUse = (permission: string) => permissions.includes("*") || permissions.includes(permission);
  const logoIsDataUrl = company.logoUrl?.startsWith("data:");

  return (
    <aside
      className={cn("flex flex-col border-r border-white/10 p-5 text-white shadow-2xl", className)}
      style={{ backgroundColor: company.primaryColor }}
    >
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl">
        <div className="relative mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
          {company.logoUrl ? (
            logoIsDataUrl ? (
              <span
                role="img"
                aria-label={company.name}
                className="h-full w-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${company.logoUrl})` }}
              />
            ) : (
              <Image src={company.logoUrl} alt={company.name} fill sizes="44px" className="object-contain p-1.5" />
            )
          ) : (
            <span className="text-sm font-black">{company.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Logistica OS</p>
        <h1 className="mt-1 text-xl font-black tracking-tight">{company.name}</h1>
        <p className="mt-1 text-xs text-slate-300">Operacion, flota y choferes</p>
      </div>

      {canUse("driver_app.use") ? (
        <Link
          href="/chofer"
          onClick={onNavigate}
          className="mb-4 flex items-center justify-between rounded-2xl border border-blue-200/20 bg-white/10 p-4 text-sm font-semibold text-white shadow-lg hover:bg-white/15"
        >
          <span className="flex items-center gap-3">
            <Smartphone size={18} />
            Abrir Portal Chofer
          </span>
          <span className="text-xs text-blue-100">Mobile</span>
        </Link>
      ) : null}

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {menu.filter((item) => canUse(item.permission)).map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active ? "text-white shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
              style={active ? { backgroundColor: company.accentColor } : undefined}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold">{company.legalName}</p>
        <p className="mt-1 text-xs text-slate-400">Plan Profesional</p>

        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 w-2/3 rounded-full bg-blue-500" />
        </div>

        <p className="mt-2 text-xs text-slate-400">Usuarios: 18 / 30</p>
      </div>
    </aside>
  );
}

