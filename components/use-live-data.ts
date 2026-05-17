"use client";

import { useEffect, useState } from "react";
import { fallbackLiveData, type LiveData } from "@/lib/live-data";

export function useLiveData() {
  const [data, setData] = useState<LiveData>(fallbackLiveData);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/bootstrap", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar datos reales");
        }

        return response.json() as Promise<LiveData>;
      })
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
        }
      })
      .catch(() => {
        // Keep seeded mock data visible if the local database is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
