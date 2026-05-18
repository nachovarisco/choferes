"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, ImagePlus, Palette, RotateCcw, Save } from "lucide-react";
import type { CompanyBrand } from "@/lib/live-data";
import { Button, Card } from "@/components/ui";

const storageKey = "nexo-demo-brand";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

function mergeBrand(base: CompanyBrand, next?: Partial<CompanyBrand>): CompanyBrand {
  return {
    ...base,
    ...next,
    name: next?.name || base.name,
    legalName: next?.legalName || base.legalName,
    branchName: next?.branchName || base.branchName,
    primaryColor: next?.primaryColor || base.primaryColor,
    accentColor: next?.accentColor || base.accentColor,
    backgroundColor: next?.backgroundColor || base.backgroundColor,
  };
}

export function BrandingDemo({ initialBrand }: { initialBrand: CompanyBrand }) {
  const [brand, setBrand] = useState<CompanyBrand>(initialBrand);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        setBrand(raw ? mergeBrand(initialBrand, JSON.parse(raw) as Partial<CompanyBrand>) : initialBrand);
      } catch {
        setBrand(initialBrand);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialBrand]);

  function update<K extends keyof CompanyBrand>(key: K, value: CompanyBrand[K]) {
    setBrand((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(file?: File) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update("logoUrl", String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function applyDemoBrand() {
    window.localStorage.setItem(storageKey, JSON.stringify(brand));
    window.dispatchEvent(new Event("nexo-brand-updated"));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function resetDemoBrand() {
    window.localStorage.removeItem(storageKey);
    setBrand(initialBrand);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    window.dispatchEvent(new Event("nexo-brand-updated"));
  }

  const logoStyle = brand.logoUrl
    ? {
        backgroundImage: `url(${brand.logoUrl})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }
    : undefined;

  return (
    <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Personalizacion visual</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Branding de empresa</h2>
            <p className="mt-1 text-sm text-slate-500">Vista previa local para probar marca, logo y colores en toda la app.</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Palette size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Nombre comercial</span>
            <input value={brand.name} onChange={(event) => update("name", event.target.value)} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Razon social</span>
            <input value={brand.legalName} onChange={(event) => update("legalName", event.target.value)} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Sucursal</span>
            <input value={brand.branchName} onChange={(event) => update("branchName", event.target.value)} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Logo</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={(event) => handleLogo(event.target.files?.[0])} className={fieldClass} />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ColorInput label="Principal" value={brand.primaryColor} onChange={(value) => update("primaryColor", value)} />
          <ColorInput label="Acento" value={brand.accentColor} onChange={(value) => update("accentColor", value)} />
          <ColorInput label="Fondo" value={brand.backgroundColor} onChange={(value) => update("backgroundColor", value)} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={applyDemoBrand}>
            <Save size={18} />
            Aplicar vista previa
          </Button>
          <Button tone="light" onClick={resetDemoBrand}>
            <RotateCcw size={18} />
            Restablecer demo
          </Button>
          {saved ? <span className="flex min-h-11 items-center text-sm font-medium text-emerald-700">Marca aplicada</span> : null}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6" style={{ backgroundColor: brand.backgroundColor }}>
          <div className="rounded-lg border border-white/70 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white"
                style={logoStyle}
              >
                {brand.logoUrl ? null : <Building2 size={28} className="text-slate-500" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-950">{brand.name}</p>
                <p className="truncate text-sm text-slate-500">{brand.legalName}</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg p-4 text-white" style={{ backgroundColor: brand.primaryColor }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Logistica OS</p>
              <p className="mt-1 text-xl font-black">{brand.branchName}</p>
              <button
                type="button"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: brand.accentColor }}
              >
                <ImagePlus size={17} />
                Accion principal
              </button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ColorInput({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-12 rounded border-0 bg-transparent p-0" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" />
      </div>
    </label>
  );
}
