"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Badge } from "./badge";
import { regions } from "../../lib/regions";

interface RegionFilterProps {
    selectedState: string | null;
    selectedRegion: string | null;
    onStateChange: (state: string | null) => void;
    onRegionChange: (region: string | null) => void;
    onLocationFilter: (lat: number, lng: number) => void;
}

export function RegionFilter({
    selectedState,
    selectedRegion,
    onStateChange,
    onRegionChange,
    onLocationFilter,
}: RegionFilterProps) {
    const [openState, setOpenState] = useState(false);
    const [openRegion, setOpenRegion] = useState(false);

    // Group regions by state
    const stateGroups = regions.reduce((acc, region) => {
        if (!acc[region.state]) {
            acc[region.state] = [];
        }
        acc[region.state].push(region);
        return acc;
    }, {} as Record<string, typeof regions>);

    const states = Object.keys(stateGroups);
    const availableRegions = selectedState ? stateGroups[selectedState] || [] : [];

    const handleStateSelect = (state: string) => {
        if (selectedState === state) {
            onStateChange(null);
            onRegionChange(null);
        } else {
            onStateChange(state);
            onRegionChange(null);
        }
        setOpenState(false);
    };

    const handleRegionSelect = (region: typeof regions[0]) => {
        if (selectedRegion === region.region) {
            onRegionChange(null);
        } else {
            onRegionChange(region.region);
            onLocationFilter(region.lat, region.long);
        }
        setOpenRegion(false);
    };

    const clearFilters = () => {
        onStateChange(null);
        onRegionChange(null);
    };

    const formatStateName = (state: string) => {
        return state.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatRegionName = (region: string) => {
        return region.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Filter by Location:
            </div>

            {/* State Filter */}
            <Popover open={openState} onOpenChange={setOpenState}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openState}
                        className="min-w-[180px] justify-between"
                    >
                        {selectedState ? formatStateName(selectedState) : "Select state..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search state..." />
                        <CommandList>
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup>
                                {states.map((state) => (
                                    <CommandItem
                                        key={state}
                                        value={state}
                                        onSelect={() => handleStateSelect(state)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedState === state ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {formatStateName(state)}
                                        <Badge variant="secondary" className="ml-auto">
                                            {stateGroups[state].length}
                                        </Badge>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Region Filter */}
            {selectedState && (
                <Popover open={openRegion} onOpenChange={setOpenRegion}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openRegion}
                            className="min-w-[180px] justify-between"
                        >
                            {selectedRegion ? formatRegionName(selectedRegion) : "Select city..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search city..." />
                            <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                    {availableRegions.map((region) => (
                                        <CommandItem
                                            key={region.region}
                                            value={region.region}
                                            onSelect={() => handleRegionSelect(region)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedRegion === region.region ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {formatRegionName(region.region)}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {/* Active Filters */}
            {(selectedState || selectedRegion) && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {selectedState && (
                        <Badge variant="default" className="flex items-center gap-1">
                            {formatStateName(selectedState)}
                        </Badge>
                    )}
                    {selectedRegion && (
                        <Badge variant="default" className="flex items-center gap-1">
                            {formatRegionName(selectedRegion)}
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
