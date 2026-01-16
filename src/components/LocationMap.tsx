"use client";

import React, { useEffect, useState } from "react";
import { POI } from "@/lib/api/overpass";
import type { DivIcon } from "leaflet";

// Type definitions for dynamically loaded components
interface MapContainerProps {
  center: [number, number];
  zoom: number;
  className: string;
  scrollWheelZoom: boolean;
  style: React.CSSProperties;
  children: React.ReactNode;
}

interface TileLayerProps {
  attribution: string;
  url: string;
  maxZoom: number;
  tileSize: number;
  zoomOffset: number;
}

interface MarkerProps {
  position: [number, number];
  icon: DivIcon;
  children: React.ReactNode;
}

interface PopupProps {
  children: React.ReactNode;
}

interface CircleProps {
  center: [number, number];
  radius: number;
  pathOptions: {
    color: string;
    fillColor: string;
    fillOpacity: number;
    weight: number;
  };
}

interface LeafletComponents {
  MapContainer: React.ComponentType<MapContainerProps>;
  TileLayer: React.ComponentType<TileLayerProps>;
  Marker: React.ComponentType<MarkerProps>;
  Popup: React.ComponentType<PopupProps>;
  Circle: React.ComponentType<CircleProps>;
}

interface LeafletLib {
  divIcon: (options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor: [number, number];
  }) => DivIcon;
  Icon: {
    Default: {
      prototype: { _getIconUrl?: () => void };
      mergeOptions: (options: {
        iconUrl: string;
        iconRetinaUrl: string;
        shadowUrl: string;
      }) => void;
    };
  };
}

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  pois?: POI[];
  radiusMeters?: number;
  className?: string;
}

// Loading skeleton
function MapSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`${className} flex animate-pulse items-center justify-center bg-slate-200 dark:bg-slate-700`}
    >
      <div className="text-center">
        <div className="mb-2 text-2xl">🗺️</div>
        <span className="text-sm text-slate-500 dark:text-slate-400">Karte wird geladen...</span>
      </div>
    </div>
  );
}

export function LocationMap({
  latitude,
  longitude,
  zoom = 14,
  pois = [],
  radiusMeters = 1000,
  className = "h-[300px] w-full rounded-lg overflow-hidden",
}: LocationMapProps) {
  const [MapComponents, setMapComponents] = useState<LeafletComponents | null>(null);
  const [L, setL] = useState<LeafletLib | null>(null);

  // Load Leaflet and react-leaflet on client side only
  useEffect(() => {
    const loadMap = async () => {
      // Import Leaflet
      const leaflet = (await import("leaflet")) as unknown as LeafletLib;

      // Fix default marker icons by deleting _getIconUrl from the prototype
      // This is necessary because Leaflet expects marker icons in a relative path which doesn't work with bundlers
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setL(leaflet);

      // Import react-leaflet components
      const { MapContainer, TileLayer, Marker, Popup, Circle } = await import("react-leaflet");

      setMapComponents({ MapContainer, TileLayer, Marker, Popup, Circle });
    };

    loadMap();
  }, []);

  // Show skeleton while loading
  if (!MapComponents || !L) {
    return <MapSkeleton className={className} />;
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle } = MapComponents;

  // Create custom marker icons
  const createMainIcon = () => {
    return L.divIcon({
      className: "custom-main-marker",
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: #4f46e5;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 12px;">📍</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  const createPOIIcon = (type: POI["type"]) => {
    const config = {
      school: { color: "#8b5cf6", emoji: "🎓" },
      transit: { color: "#3b82f6", emoji: "🚇" },
      supermarket: { color: "#f97316", emoji: "🛒" },
      hospital: { color: "#ef4444", emoji: "🏥" },
    };
    const { color, emoji } = config[type] || { color: "#6b7280", emoji: "📍" };

    return L.divIcon({
      className: "custom-poi-marker",
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">${emoji}</div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13],
    });
  };

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      {/* TileLayer MUST be first child and properly configured */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        tileSize={256}
        zoomOffset={0}
      />

      {/* Radius circle */}
      <Circle
        center={[latitude, longitude]}
        radius={radiusMeters}
        pathOptions={{
          color: "#6366f1",
          fillColor: "#6366f1",
          fillOpacity: 0.1,
          weight: 2,
        }}
      />

      {/* Main location marker */}
      <Marker position={[latitude, longitude]} icon={createMainIcon()}>
        <Popup>
          <div className="text-center">
            <strong>📍 Ausgewählter Standort</strong>
            <br />
            <span className="text-xs text-slate-500">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        </Popup>
      </Marker>

      {/* POI markers */}
      {pois.slice(0, 50).map((poi) => (
        <Marker
          key={`${poi.type}-${poi.id}`}
          position={[poi.lat, poi.lon]}
          icon={createPOIIcon(poi.type)}
        >
          <Popup>
            <div className="text-sm">
              <strong>{poi.name}</strong>
              <br />
              <span className="text-slate-500">
                {poi.type === "school" && "🎓 Schule"}
                {poi.type === "transit" && "🚇 ÖPNV-Haltestelle"}
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
