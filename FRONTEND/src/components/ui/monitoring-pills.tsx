"use client";

import { Activity, MapPin, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

interface MonitoringPillProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: "increase" | "decrease" | "stable";
    };
    location?: {
        state: string;
        region: string;
    };
    status: "normal" | "warning" | "critical";
    icon?: React.ReactNode;
    className?: string;
}

export function MonitoringPill({
    title,
    value,
    change,
    location,
    status,
    icon,
    className,
}: MonitoringPillProps) {
    const statusColors = {
        normal: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        critical: "bg-red-50 border-red-200 text-red-800",
    };

    const changeColors = {
        increase: "text-red-600",
        decrease: "text-green-600",
        stable: "text-gray-600",
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-200 hover:shadow-md",
                statusColors[status],
                className
            )}
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                {icon || <Activity className="h-5 w-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{title}</span>
                    {location && (
                        <div className="flex items-center gap-1 text-xs opacity-75">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                                {location.region.replace(/_/g, " ")}, {location.state.replace(/_/g, " ")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Value */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg font-bold">{value}</span>

                {/* Change indicator */}
                {change && (
                    <div className={cn("flex items-center gap-1 text-sm", changeColors[change.type])}>
                        {change.type === "increase" && <TrendingUp className="h-4 w-4" />}
                        {change.type === "decrease" && <TrendingDown className="h-4 w-4" />}
                        {change.type === "stable" && <div className="h-2 w-2 rounded-full bg-current" />}
                        <span>{Math.abs(change.value)}%</span>
                    </div>
                )}
            </div>

            {/* Status indicator */}
            {status === "critical" && (
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            )}
        </div>
    );
}

interface MonitoringGridProps {
    stations: Array<{
        id: string;
        title: string;
        value: string | number;
        change?: {
            value: number;
            type: "increase" | "decrease" | "stable";
        };
        location: {
            state: string;
            region: string;
        };
        status: "normal" | "warning" | "critical";
        type: "pollution" | "erosion" | "wave" | "temperature";
    }>;
    selectedState?: string | null;
    selectedRegion?: string | null;
}

export function MonitoringGrid({ stations, selectedState, selectedRegion }: MonitoringGridProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "pollution":
                return <div className="h-5 w-5 rounded-full bg-blue-500" />;
            case "erosion":
                return <div className="h-5 w-5 rounded-full bg-orange-500" />;
            case "wave":
                return <div className="h-5 w-5 rounded-full bg-cyan-500" />;
            case "temperature":
                return <div className="h-5 w-5 rounded-full bg-red-500" />;
            default:
                return <Activity className="h-5 w-5" />;
        }
    };

    // Filter stations based on selected location
    const filteredStations = stations.filter((station) => {
        if (selectedState && station.location.state !== selectedState) return false;
        if (selectedRegion && station.location.region !== selectedRegion) return false;
        return true;
    });

    if (filteredStations.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No monitoring stations found for the selected location.</p>
                <p className="text-sm">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="text-sm text-gray-600">
                Showing {filteredStations.length} monitoring station{filteredStations.length !== 1 ? "s" : ""}
                {selectedState && (
                    <span> in {selectedState.replace(/_/g, " ")}</span>
                )}
                {selectedRegion && (
                    <span>, {selectedRegion.replace(/_/g, " ")}</span>
                )}
            </div>

            <div className="grid gap-3">
                {filteredStations.map((station) => (
                    <MonitoringPill
                        key={station.id}
                        title={station.title}
                        value={station.value}
                        change={station.change}
                        location={station.location}
                        status={station.status}
                        icon={getIcon(station.type)}
                    />
                ))}
            </div>
        </div>
    );
}
