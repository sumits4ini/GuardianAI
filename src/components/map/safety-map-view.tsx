"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { useTheme } from "@/lib/theme/theme-context";
import { CommunityReport } from "@/types";
import { detectSafetyHotspots } from "@/lib/safety/hotspot-detector";
import { calculateEmergingRiskTrend } from "@/lib/safety/trend-analyzer";
import { RouteComparisonModal } from "@/components/safety/RouteComparisonModal";
import { 
  Sparkles, 
  Filter, 
  Navigation, 
  TrendingUp, 
  X
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "poor_lighting", label: "💡 Lighting" },
  { id: "harassment", label: "⚠️ Harassment" },
  { id: "theft", label: "🛑 Theft" },
  { id: "suspicious_activity", label: "👁️ Suspicious" },
  { id: "unsafe_road", label: "🚧 Road/Path" },
];

const SEVERITIES = [
  { id: "all", label: "All Severities" },
  { id: "CRITICAL", label: "Critical" },
  { id: "HIGH", label: "High" },
  { id: "MODERATE", label: "Moderate" },
  { id: "LOW", label: "Low" },
];

const TIME_WINDOWS = [
  { id: "all", label: "All Time" },
  { id: "24h", label: "Last 24h" },
  { id: "7d", label: "Last 7 Days" },
];

export default function SafetyMapView() {
  const { currentCoords, activeJourney, communityReports, riskAssessment } = useGuardian();
  const { resolvedTheme } = useTheme();
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Modal / Area Analysis States
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [isAnalyzingArea, setIsAnalyzingArea] = useState<boolean>(false);
  const [areaAnalysisData, setAreaAnalysisData] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const reportsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const riskCircleRef = useRef<L.Circle | null>(null);

  // Filter Reports
  const filteredReports = communityReports.filter((rep) => {
    if (selectedCategory !== "all" && rep.category !== selectedCategory) return false;
    if (selectedSeverity !== "all" && rep.severity !== selectedSeverity) return false;
    if (selectedTimeWindow !== "all") {
      const hours = selectedTimeWindow === "24h" ? 24 : 168;
      const cutoff = Date.now() - hours * 3600 * 1000;
      if (new Date(rep.createdAt).getTime() < cutoff) return false;
    }
    return true;
  });

  const hotspots = detectSafetyHotspots(filteredReports);
  const riskTrend = calculateEmergingRiskTrend(filteredReports);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 15,
      zoomControl: false,
    });

    const isDark = resolvedTheme === "dark";
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    hotspotsLayerGroupRef.current = L.layerGroup().addTo(map);
    reportsLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const isDark = resolvedTheme === "dark";
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    tileLayerRef.current.setUrl(tileUrl);
  }, [resolvedTheme]);

  // Update User Location Marker & Risk Perimeter
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

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
  }, [currentCoords, riskAssessment.riskLevel]);

  // Update Destination & Active Corridor
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

  // Render Hotspots & Reports Layers
  useEffect(() => {
    if (!reportsLayerGroupRef.current || !hotspotsLayerGroupRef.current || !mapInstanceRef.current) return;
    
    reportsLayerGroupRef.current.clearLayers();
    hotspotsLayerGroupRef.current.clearLayers();

    // 1. Render Hotspot Cluster Circles
    hotspots.forEach((h) => {
      const circleColor = h.riskLevel === "CRITICAL" ? "#ef4444" : h.riskLevel === "HIGH" ? "#f97316" : "#f59e0b";
      
      const circle = L.circle([h.center.lat, h.center.lng], {
        radius: h.radiusMeters,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.15,
        weight: 1.5,
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px; color: #0f172a; padding: 2px;">
          <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: ${circleColor}; margin-bottom: 2px;">
            ⚠️ SAFETY HOTSPOT (${h.riskLevel})
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #1e293b;">${h.name}</div>
          <p style="font-size: 10px; color: #475569; margin: 4px 0;">${h.recentActivitySummary}</p>
          <div style="font-size: 9px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 3px;">
            Cluster of ${h.reportsCount} anonymous community reports
          </div>
        </div>
      `;
      circle.bindPopup(popupHtml);
      hotspotsLayerGroupRef.current?.addLayer(circle);
    });

    // 2. Render Individual Anonymous Hazard Pins
    filteredReports.forEach((rep) => {
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
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
            <span>📍 ${rep.approximateLocationName}</span>
            <span style="font-style: italic;">Anonymous</span>
          </div>
        </div>
      `;

      const marker = L.marker([rep.latitude, rep.longitude], { icon: markerIcon })
        .bindPopup(popupContent);
      
      reportsLayerGroupRef.current?.addLayer(marker);
    });
  }, [filteredReports, hotspots]);

  // Handle "Analyze This Area"
  const handleAnalyzeArea = async () => {
    setIsAnalyzingArea(true);
    try {
      const res = await fetch("/api/ai/area-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaName: activeJourney?.destinationName || "Downtown Corridor Area",
          reports: filteredReports,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAreaAnalysisData(data.summary);
      }
    } catch (err) {
      console.error("Analyze area error:", err);
    } finally {
      setIsAnalyzingArea(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">
      
      {/* Top Map Action HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* Risk Trend & Active Layer Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filteredReports.length} Reports Active</span>
          </div>

          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold backdrop-blur-md flex items-center gap-1 shadow-lg ${
            riskTrend.trend === "INCREASING" 
              ? "bg-rose-50/90 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300"
              : "bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{riskTrend.trendBadge}</span>
          </div>
        </div>

        {/* Action Controls: Filter, Analyze Area, Compare Routes */}
        <div className="flex items-center gap-1.5">
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm ${
              showFilters
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-white/90 dark:bg-slate-950/85 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={handleAnalyzeArea}
            disabled={isAnalyzingArea}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 backdrop-blur-md flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingArea ? "animate-spin" : ""}`} />
            <span>{isAnalyzingArea ? "Analyzing..." : "Analyze Area"}</span>
          </button>

          <button
            onClick={() => setShowRouteModal(true)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 backdrop-blur-md flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Compare Routes</span>
          </button>

        </div>
      </div>

      {/* Floating Filter Overlay Tray */}
      {showFilters && (
        <div className="absolute top-14 left-3 right-3 z-[400] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Map Intelligence Filters</span>
            <button onClick={() => setShowFilters(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Risk Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {SEVERITIES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Time Window Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recency</label>
              <select
                value={selectedTimeWindow}
                onChange={(e) => setSelectedTimeWindow(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {TIME_WINDOWS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* AI Area Analysis Bottom Drawer */}
      {areaAnalysisData && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/40 shadow-2xl space-y-2 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                AI Spatial Intelligence: {areaAnalysisData.locationName}
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                Safety Index: {areaAnalysisData.overallSafetyIndex}/100
              </span>
            </div>
            <button onClick={() => setAreaAnalysisData(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Dominant Hazards</span>
              <p className="text-slate-800 dark:text-slate-200">{areaAnalysisData.dominantHazards?.join(" • ") || "None"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Lighting & Foot Traffic</span>
              <p className="text-slate-800 dark:text-slate-200">
                Lighting: <strong>{areaAnalysisData.lightingRating}</strong> • Pedestrians: <strong>{areaAnalysisData.pedestrianDensity}</strong>
              </p>
            </div>
          </div>

          <p className="text-[11px] text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
            💡 {areaAnalysisData.aiSafetyAdvice}
          </p>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[300] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>High Threat</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Lighting/Mod</span>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500" />
          <span>Hotspot</span>
        </div>
      </div>

      {/* Safe Corridor Route Comparison Modal */}
      <RouteComparisonModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        originName="Current Location"
        destinationName={activeJourney?.destinationName || "Downtown Transit Center"}
      />

    </div>
  );
}
