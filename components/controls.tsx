"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, cn } from "./ui";

export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3", className)}>
      <Search size={18} className="shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        placeholder={placeholder}
      />
    </div>
  );
}

export function ModalFrame({
  title,
  description,
  children,
  footer,
  onClose,
  size = "lg",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}) {
  const width = size === "xl" ? "md:max-w-5xl" : size === "lg" ? "md:max-w-4xl" : "md:max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm md:items-center md:p-6">
      <div className={cn("modal-surface max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:rounded-2xl", width)}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer ? (
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white p-6 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Field({
  label,
  name,
  placeholder = "",
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="min-h-24 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required = false,
  defaultValue,
}: {
  label: string;
  name?: string;
  options: Array<string | { label: string; value: string }>;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((item) => (
          typeof item === "string" ? (
            <option key={item}>{item}</option>
          ) : (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          )
        ))}
      </select>
    </label>
  );
}

export function CheckOption({ text }: { text: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
      {text}
    </label>
  );
}

export function ModalActions({
  onCancel,
  confirmLabel,
  submit = false,
  formId,
}: {
  onCancel: () => void;
  confirmLabel: string;
  submit?: boolean;
  formId?: string;
}) {
  return (
    <>
      <Button tone="light" onClick={onCancel}>
        Cancelar
      </Button>
      {submit ? (
        <SubmitButton formId={formId} label={confirmLabel} />
      ) : (
        <Button type="button" onClick={onCancel}>
          {confirmLabel}
        </Button>
      )}
    </>
  );
}

function SubmitButton({ formId, label }: { formId?: string; label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" form={formId} className={pending ? "opacity-80" : undefined}>
      <span className={pending ? "inline-block h-2 w-2 animate-pulse rounded-full bg-white" : "hidden"} />
      {pending ? "Guardando..." : label}
    </Button>
  );
}
