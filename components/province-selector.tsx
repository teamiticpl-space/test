"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, MapPin, Search } from "lucide-react";
import { PROVINCES, REGIONS, getProvince } from "@/lib/provinces";
import { useWeatherStore } from "@/stores/weather-store";
import { cn } from "@/lib/utils";

/**
 * Searchable province combobox grouped by region. Custom implementation so
 * the dropdown can sit above Leaflet's high z-index panes.
 */
export function ProvinceSelector() {
  const selectedProvinceId = useWeatherStore((s) => s.selectedProvinceId);
  const selectProvince = useWeatherStore((s) => s.selectProvince);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = getProvince(selectedProvinceId);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus the search box as soon as the dropdown opens
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROVINCES;
    return PROVINCES.filter(
      (p) => p.nameTh.includes(q) || p.nameEn.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(
    () =>
      REGIONS.map((region) => ({
        region,
        provinces: filtered.filter((p) => p.region === region),
      })).filter((g) => g.provinces.length > 0),
    [filtered],
  );

  function choose(id: string) {
    selectProvince(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate font-medium">
            {selected ? selected.nameTh : "เลือกจังหวัด"}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[1200] w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:w-80">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && filtered.length > 0) choose(filtered[0].id);
              }}
              placeholder="ค้นหาจังหวัด..."
              className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div role="listbox" className="max-h-72 overflow-y-auto p-1.5">
            {grouped.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                ไม่พบจังหวัดที่ค้นหา
              </p>
            )}
            {grouped.map((group) => (
              <div key={group.region}>
                <p className="px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                  ภาค{group.region}
                </p>
                {group.provinces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={p.id === selectedProvinceId}
                    onClick={() => choose(p.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                      p.id === selectedProvinceId && "bg-primary/10 font-medium text-primary",
                    )}
                  >
                    <span>{p.nameTh}</span>
                    <span className="text-xs text-muted-foreground">{p.nameEn}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
