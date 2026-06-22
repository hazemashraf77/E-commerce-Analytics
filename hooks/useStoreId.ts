"use client";
/**
 * useStoreId — resolves the active store UUID for API calls.
 * Fetches GET /api/v1/store.
 * Falls back to null in preview/build mode.
 */

import { useState, useEffect } from "react";

export function useStoreId(): string | null {
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/store")
      .then(r => (r.ok ? r.json() : null))
      .then((json) => {
        const id = json?.data?.id ?? null;
        setStoreId(id);
      })
      .catch(() => setStoreId(null));
  }, []);

  return storeId;
}