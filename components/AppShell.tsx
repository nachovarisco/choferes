"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { name: "Mantenimiento", href: "/mantenimiento", icon: Wrench },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-950 text-white p-5 flex flex-col">
            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight">NEXO</h1>
              <p className="text-xs text-slate-400 mt-1">Sistema logístico</p>
            </div>

            <nav className="space-y-1 flex-1">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setMobileOpen(false)}
              className="w-full mt-4 bg-slate-800 rounded-xl py-3 text-sm"
            >
              Cerrar menú
            </button>
          </aside>
        </div>
      )}

      <aside className="w-64 bg-slate-950 text-white p-5 hidden md:flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight">NEXO</h1>
          <p className="text-xs text-slate-400 mt-1">Sistema logístico</p>
        </div>

        <nav className="space-y-1 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-sm font-semibold">Transporte Nexo SRL</p>
          <p className="text-xs text-slate-400 mt-1">Plan Profesional</p>

          <div className="w-full h-2 bg-slate-800 rounded-full mt-4">
            <div className="h-2 w-2/3 bg-blue-500 rounded-full" />
          </div>

          <p className="text-xs text-slate-400 mt-2">Usuarios: 18 / 30</p>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur border-b border-slate-200">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center"
              >
                <Menu size={20} />
              </button>

              <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 w-full max-w-xl">
                <Search size={18} className="text-slate-400" />
                <input
                  className="w-full outline-none text-sm bg-transparent"
                  placeholder="Buscar viajes, choferes, unidades..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
                Sucursal Paraná
              </div>

              <button className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Bell size={19} />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  I
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">Ignacio</p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden px-4 pb-4">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                className="w-full outline-none text-sm bg-transparent"
                placeholder="Buscar..."
              />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}