"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { POI } from "@/lib/api/overpass";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  pois?: POI[];
  radiusMeters?: number;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  zoom = 14,
  pois = [],
  radiusMeters = 1000,
  className = "h-[300px] w-full rounded-lg",
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Using a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`${className} flex animate-pulse items-center justify-center bg-slate-100 dark:bg-slate-800`}
      >
        <span className="text-slate-400">Karte wird geladen...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Main location marker */}
      <Marker position={[latitude, longitude]}>
        <Popup>📍 Ausgewählter Standort</Popup>
      </Marker>

      {/* Radius circle */}
      <Circle
        center={[latitude, longitude]}
        radius={radiusMeters}
        pathOptions={{
          color: "#6366f1",
          fillColor: "#6366f1",
          fillOpacity: 0.1,
        }}
      />

      {/* POI markers */}
      {pois.slice(0, 50).map((poi) => (
        <Marker key={poi.id} position={[poi.lat, poi.lon]}>
          <Popup>
            <div className="text-sm">
              <strong>{poi.name}</strong>
              <br />
              <span className="text-slate-500">
                {poi.type === "school" && "🎓 Schule"}
                {poi.type === "transit" && "🚇 ÖPNV"}
                {poi.type === "supermarket" && "🛒 Supermarkt"}
                {poi.type === "hospital" && "🏥 Krankenhaus"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
