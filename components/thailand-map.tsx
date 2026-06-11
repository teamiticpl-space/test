"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { RiskLevel } from "@/lib/types";
import { RISK_LEVEL_INFO } from "@/lib/risk/risk-engine";

export interface MapMarkerData {
  provinceId: string;
  nameTh: string;
  lat: number;
  lon: number;
  total: number;
  level: RiskLevel;
}

interface ThailandMapProps {
  markers: MapMarkerData[];
  selectedId: string;
  onSelect: (provinceId: string) => void;
}

/**
 * Keep Leaflet sized to its container. The map fills a flex card whose height
 * tracks the side panel, so the container can resize without a window resize —
 * invalidateSize() repaints tiles to fill the new area instead of leaving gray.
 */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// Loaded only on the client via next/dynamic (Leaflet touches `window`).
export default function ThailandMap({ markers, selectedId, onSelect }: ThailandMapProps) {
  return (
    <MapContainer
      center={[13.2, 101.0]}
      zoom={6}
      minZoom={5}
      scrollWheelZoom
      className="z-0 h-full w-full rounded-xl"
      attributionControl
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => {
        const isSelected = m.provinceId === selectedId;
        const color = RISK_LEVEL_INFO[m.level].color;
        return (
          <CircleMarker
            key={m.provinceId}
            center={[m.lat, m.lon]}
            radius={isSelected ? 11 : 6}
            pathOptions={{
              color: isSelected ? "#0f172a" : "#ffffff",
              weight: isSelected ? 2.5 : 1.5,
              fillColor: color,
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(m.provinceId) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="text-sm font-medium">{m.nameTh}</span>
              <br />
              <span className="text-xs">
                คะแนนความเสี่ยง: {m.total} ({RISK_LEVEL_INFO[m.level].labelTh})
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
