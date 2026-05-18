"use client";

import { useEffect, useState } from "react";
import { demoDataEvent, getDemoLiveData } from "@/lib/demo-store";
import { fallbackLiveData, type LiveData } from "@/lib/live-data";

export function useLiveData() {
  const [data, setData] = useState<LiveData>(fallbackLiveData);

  useEffect(() => {
    let cancelled = false;
    let baseData = fallbackLiveData;

    const applyDemoData = () => {
      if (!cancelled) {
        setData(getDemoLiveData(baseData));
      }
    };
    const initialDemoSync = window.setTimeout(applyDemoData, 0);

    fetch("/api/bootstrap", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar datos reales");
        }

        return response.json() as Promise<LiveData>;
      })
      .then((nextData) => {
        baseData = nextData;
        applyDemoData();
      })
      .catch(() => {
        applyDemoData();
      });

    window.addEventListener(demoDataEvent, applyDemoData);
    window.addEventListener("storage", applyDemoData);

    return () => {
      cancelled = true;
      window.clearTimeout(initialDemoSync);
      window.removeEventListener(demoDataEvent, applyDemoData);
      window.removeEventListener("storage", applyDemoData);
    };
  }, []);

  return data;
}
