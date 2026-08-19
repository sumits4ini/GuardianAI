"use client";

import React, { useEffect, useRef } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { CommunityReport } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function SafetyMapView() {
  const { currentCoords, activeJourney, communityReports, riskAssessment } = useGuardian();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const reportsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const riskCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 15,
      zoomControl: false,
    });

    // Add sleek dark CartoDB tile layer for modern aesthetics
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const reportsGroup = L.layerGroup().addTo(map);
    reportsLayerGroupRef.current = reportsGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Location Marker & Risk Radius
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // User pulsating radar pin
    const userHtml = `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: #6366f1; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 16px; height: 16px; border-radius: 9999px; background-color: #4f46e5; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(99,102,241,0.8);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: "custom-user-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([currentCoords.lat, currentCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<div style="color: #0f172a; font-weight: bold; font-size: 12px;">Your Live Location</div>`);
    } else {
      userMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    }

    // Risk perimeter circle
    const getRiskCircleColor = () => {
      switch (riskAssessment.riskLevel) {
        case "SAFE": return "#10b981";
        case "MODERATE": return "#f59e0b";
        case "HIGH": return "#f97316";
        case "CRITICAL": return "#ef4444";
      }
    };

    if (!riskCircleRef.current) {
      riskCircleRef.current = L.circle([currentCoords.lat, currentCoords.lng], {
        radius: 280,
        color: getRiskCircleColor(),
        fillColor: getRiskCircleColor(),
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map);
    } else {
      riskCircleRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
      riskCircleRef.current.setStyle({
        color: getRiskCircleColor(),
        fillColor: getRiskCircleColor(),
      });
    }

    map.panTo([currentCoords.lat, currentCoords.lng], { animate: true, duration: 0.5 });
  }, [currentCoords, riskAssessment.riskLevel]);

  // Update Destination Marker & Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (activeJourney) {
      const destCoords = activeJourney.destinationCoords;
      const destHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #ef4444; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(239,68,68,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
            📍
          </div>
        </div>
      `;

      const destIcon = L.divIcon({
        html: destHtml,
        className: "custom-dest-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<div style="color: #0f172a; font-weight: bold; font-size: 12px;">Destination: ${activeJourney.destinationName}</div>`);
      } else {
        destMarkerRef.current.setLatLng([destCoords.lat, destCoords.lng]);
      }

      // Draw safe journey corridor line
      const latlngs: [number, number][] = [
        [activeJourney.originCoords.lat, activeJourney.originCoords.lng],
        [currentCoords.lat, currentCoords.lng],
        [destCoords.lat, destCoords.lng],
      ];

      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(latlngs, {
          color: activeJourney.routeDeviationDetected ? "#f97316" : "#6366f1",
          weight: 4,
          opacity: 0.8,
          dashArray: activeJourney.routeDeviationDetected ? "6, 8" : undefined,
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(latlngs);
        routePolylineRef.current.setStyle({
          color: activeJourney.routeDeviationDetected ? "#f97316" : "#6366f1",
          dashArray: activeJourney.routeDeviationDetected ? "6, 8" : undefined,
        });
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
    }
  }, [activeJourney, currentCoords]);

  // Update Community Incident Markers
  useEffect(() => {
    if (!reportsLayerGroupRef.current || !mapInstanceRef.current) return;
    reportsLayerGroupRef.current.clearLayers();

    communityReports.forEach((rep) => {
      const getSeverityColor = () => {
        if (rep.severity === "CRITICAL") return "#ef4444";
        if (rep.severity === "HIGH") return "#f97316";
        if (rep.severity === "MODERATE") return "#f59e0b";
        return "#3b82f6";
      };

      const getCategoryIcon = () => {
        switch (rep.category) {
          case "harassment": return "⚠️";
          case "poor_lighting": return "💡";
          case "suspicious_activity": return "👁️";
          case "isolated_area": return "🚧";
          case "theft": return "🛑";
          default: return "📍";
        }
      };

      const markerHtml = `
        <div style="background-color: ${getSeverityColor()}; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-size: 13px; cursor: pointer;">
          ${getCategoryIcon()}
        </div>
      `;

      const markerIcon = L.divIcon({
        html: markerHtml,
        className: "custom-hazard-marker",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: ${getSeverityColor()};">${rep.category.replace('_', ' ')}</span>
            <span style="font-size: 10px; background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-weight: 600;">${rep.severity}</span>
          </div>
          <p style="font-size: 12px; margin: 4px 0; color: #334155; line-height: 1.3;">${rep.description}</p>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            📍 ${rep.approximateLocationName}
          </div>
        </div>
      `;

      const marker = L.marker([rep.latitude, rep.longitude], { icon: markerIcon })
        .bindPopup(popupContent);
      
      reportsLayerGroupRef.current?.addLayer(marker);
    });
  }, [communityReports]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay Map HUD Elements */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Safety Net Layer</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>High Hazard</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Lighting/Mod</span>
        </div>
      </div>
    </div>
  );
}
