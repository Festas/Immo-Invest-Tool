"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { POI } from "@/lib/api/overpass";
import type { DivIcon } from "leaflet";

// Loading skeleton for map
function MapSkeleton() {
  return (
    <div className="flex h-[300px] w-full animate-pulse items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
      <span className="text-slate-400">Karte wird geladen...</span>
    </div>
  );
}

// Dynamic imports for react-leaflet components with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <MapSkeleton />,
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

// Internal component that creates markers with Leaflet icons
function MapMarkers({
  latitude,
  longitude,
  pois,
  radiusMeters,
}: {
  latitude: number;
  longitude: number;
  pois: POI[];
  radiusMeters: number;
}) {
  const [icons, setIcons] = useState<{
    mainIcon: DivIcon;
    poiIcons: Record<POI["type"], DivIcon>;
  } | null>(null);

  useEffect(() => {
    // Import Leaflet and create icons only on client side
    import("leaflet").then((L) => {
      // Fix Leaflet default marker icons
      // @ts-expect-error - Deleting prototype property for icon fix
      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create main location marker icon
      const mainIcon = L.divIcon({
        className: "main-location-marker",
        html: `<div style="
          background-color: #4f46e5;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        "><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Create POI icons
      const colors = {
        school: "#8b5cf6",
        transit: "#3b82f6",
        supermarket: "#f97316",
        hospital: "#ef4444",
      };

      const emojis = {
        school: "🎓",
        transit: "🚇",
        supermarket: "🛒",
        hospital: "🏥",
      };

      const poiIcons: Record<POI["type"], DivIcon> = {
        school: L.divIcon({
          className: "custom-poi-marker",
          html: `<div style="
            background-color: ${colors.school};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${emojis.school}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        }),
        transit: L.divIcon({
          className: "custom-poi-marker",
          html: `<div style="
            background-color: ${colors.transit};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${emojis.transit}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        }),
        supermarket: L.divIcon({
          className: "custom-poi-marker",
          html: `<div style="
            background-color: ${colors.supermarket};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${emojis.supermarket}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        }),
        hospital: L.divIcon({
          className: "custom-poi-marker",
          html: `<div style="
            background-color: ${colors.hospital};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${emojis.hospital}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        }),
      };

      setIcons({ mainIcon, poiIcons });
    });
  }, []);

  if (!icons) {
    return null;
  }

  return (
    <>
      {/* Main location marker with custom icon */}
      <Marker position={[latitude, longitude]} icon={icons.mainIcon}>
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

      {/* POI markers with custom icons */}
      {pois.slice(0, 50).map((poi) => (
        <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={icons.poiIcons[poi.type]}>
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
    </>
  );
}

export function LocationMap({
  latitude,
  longitude,
  zoom = 14,
  pois = [],
  radiusMeters = 1000,
  className = "h-[300px] w-full rounded-lg",
}: LocationMapProps) {
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
      <MapMarkers
        latitude={latitude}
        longitude={longitude}
        pois={pois}
        radiusMeters={radiusMeters}
      />
    </MapContainer>
  );
}
