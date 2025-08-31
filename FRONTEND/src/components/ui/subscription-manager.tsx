"use client";

import { useState } from "react";
import { Plus, MapPin, Bell, BellOff, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";
import { regions } from "../../lib/regions";

interface Subscription {
    id: number;
    state: string;
    city: string;
    active: boolean;
    createdAt: string;
}

interface SubscriptionManagerProps {
    subscriptions: Subscription[];
    onSubscribeToCity: (state: string, city: string) => Promise<void>;
    onSubscribeToState: (state: string) => Promise<void>;
    onUnsubscribeFromCity: (state: string, city: string) => Promise<void>;
    onUnsubscribeFromState: (state: string) => Promise<void>;
    isLoading?: boolean;
}

export function SubscriptionManager({
    subscriptions,
    onSubscribeToCity,
    onSubscribeToState,
    onUnsubscribeFromCity,
    onUnsubscribeFromState,
    isLoading = false,
}: SubscriptionManagerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [openState, setOpenState] = useState(false);
    const [openCity, setOpenCity] = useState(false);

    // Group regions by state
    const stateGroups = regions.reduce((acc, region) => {
        if (!acc[region.state]) {
            acc[region.state] = [];
        }
        acc[region.state].push(region);
        return acc;
    }, {} as Record<string, typeof regions>);

    const states = Object.keys(stateGroups);
    const availableCities = selectedState ? stateGroups[selectedState] || [] : [];

    // Group subscriptions by state
    const subscriptionsByState = subscriptions.reduce((acc, sub) => {
        if (!acc[sub.state]) {
            acc[sub.state] = [];
        }
        acc[sub.state].push(sub);
        return acc;
    }, {} as Record<string, Subscription[]>);

    const formatName = (name: string) => {
        return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleAddSubscription = async () => {
        if (!selectedState) return;

        try {
            if (selectedCity) {
                await onSubscribeToCity(selectedState, selectedCity);
            } else {
                await onSubscribeToState(selectedState);
            }
            setShowAddDialog(false);
            setSelectedState("");
            setSelectedCity("");
        } catch (error) {
            console.error("Failed to add subscription:", error);
        }
    };

    const handleUnsubscribe = async (state: string, city?: string) => {
        try {
            if (city) {
                await onUnsubscribeFromCity(state, city);
            } else {
                await onUnsubscribeFromState(state);
            }
        } catch (error) {
            console.error("Failed to unsubscribe:", error);
        }
    };

    const isSubscribedToCity = (state: string, city: string) => {
        return subscriptions.some(sub => sub.state === state && sub.city === city && sub.active);
    };

    const getStateSubscriptionCount = (state: string) => {
        return subscriptions.filter(sub => sub.state === state && sub.active).length;
    };

    const getStateCityCount = (state: string) => {
        return stateGroups[state]?.length || 0;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Alert Subscriptions
                    </CardTitle>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subscription
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Subscription</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">State</label>
                                    <Popover open={openState} onOpenChange={setOpenState}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openState}
                                                className="w-full justify-between"
                                            >
                                                {selectedState ? formatName(selectedState) : "Select state..."}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search state..." />
                                                <CommandList>
                                                    <CommandEmpty>No state found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {states.map((state) => (
                                                            <CommandItem
                                                                key={state}
                                                                value={state}
                                                                onSelect={() => {
                                                                    setSelectedState(state);
                                                                    setSelectedCity("");
                                                                    setOpenState(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedState === state ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {formatName(state)}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {selectedState && (
                                    <div>
                                        <label className="text-sm font-medium">
                                            City (optional - leave empty to subscribe to entire state)
                                        </label>
                                        <Popover open={openCity} onOpenChange={setOpenCity}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCity}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedCity ? formatName(selectedCity) : "Select city or leave empty..."}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search city..." />
                                                    <CommandList>
                                                        <CommandEmpty>No city found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {availableCities.map((city) => (
                                                                <CommandItem
                                                                    key={city.region}
                                                                    value={city.region}
                                                                    onSelect={() => {
                                                                        setSelectedCity(city.region);
                                                                        setOpenCity(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedCity === city.region ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {formatName(city.region)}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddSubscription}
                                        disabled={!selectedState || isLoading}
                                    >
                                        Subscribe
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {subscriptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active subscriptions</p>
                        <p className="text-sm">Add a subscription to receive alerts for specific locations.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(subscriptionsByState).map(([state, stateSubs]) => (
                            <div key={state} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="font-medium">{formatName(state)}</span>
                                        <Badge variant="secondary">
                                            {getStateSubscriptionCount(state)} / {getStateCityCount(state)} cities
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnsubscribe(state)}
                                        disabled={isLoading}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <BellOff className="h-4 w-4 mr-2" />
                                        Unsubscribe All
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {stateSubs.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 text-sm"
                                        >
                                            <span>{formatName(sub.city)}</span>
                                            <button
                                                onClick={() => handleUnsubscribe(sub.state, sub.city)}
                                                disabled={isLoading}
                                                className="text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
