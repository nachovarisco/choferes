import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/data";

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

export function toneClass(tone: Tone) {
  return toneClasses[tone];
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-sm text-slate-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </header>
  );
}

export function Button({
  children,
  tone = "dark",
  className,
  type = "button",
  onClick,
  form,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  form?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      form={form}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
        tone === "dark"
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  tone = "light",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
        tone === "dark"
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClass(tone),
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  title,
  value,
  detail,
  icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</h2>
        </div>
        {icon ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", toneClass(tone))}>
            {icon}
          </div>
        ) : null}
      </div>
      {detail ? <p className={cn("mt-3 text-xs font-medium", tone === "red" ? "text-red-600" : "text-slate-500")}>{detail}</p> : null}
    </Card>
  );
}

export function Panel({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export function InfoRow({
  icon,
  label,
  children,
  tone = "slate",
}: {
  icon?: ReactNode;
  label?: string;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", tone === "red" ? "text-red-600" : "text-slate-600")}>
      {icon ? <span className="shrink-0 text-slate-500">{icon}</span> : null}
      <span>
        {label ? <span className="font-medium text-slate-800">{label}: </span> : null}
        {children}
      </span>
    </div>
  );
}

type DataColumn<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getKey,
  emptyText = "No hay resultados para mostrar.",
}: {
  columns: DataColumn<T>[];
  data: T[];
  getKey: (item: T) => string;
  emptyText?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={cn("p-4 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={getKey(item)} className="transition hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.header} className={cn("p-4 align-middle", column.className)}>
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <Card className="p-8 text-center">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </Card>
  );
}
