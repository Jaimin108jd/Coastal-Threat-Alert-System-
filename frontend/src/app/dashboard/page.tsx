"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { useUser } from '@/hooks/use-user';
import { useTRPC } from '@/trpc/client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Waves,
    Wind,
    Droplets,
    Mountain,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Activity,
    Thermometer,
    Eye,
    CloudRain,
    MapPin,
    WifiOff,
    Wifi
} from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';

// Interface definitions for threat data and ML predictions
interface ThreatData {
    threatType: string;
    data: any;
    prediction?: any;
    timestamp: string;
    region: string;
}

interface MLPrediction {
    cyclone_formation_probability?: number;
    storm_surge_risk?: number;
    pollution_level?: number;
    erosion_rate_prediction?: number;
}

export default function Dashboard() {
    const { user, isLoading: userLoading } = useUser();
    const trpc = useTRPC();

    // State for SSE connection and ML predictions
    const [mlPredictions, setMlPredictions] = useState<Record<string, MLPrediction>>({});
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use tRPC useQuery hooks for real-time data
    const { data: cycloneData, refetch: refetchCyclone } = useQuery({
        ...trpc.cyclone.getLiveData.queryOptions({
            region: "Gujarat Coast",
        }),
        refetchInterval: 8000,
        refetchIntervalInBackground: true
    });

    const { data: stormSurgeData, refetch: refetchStormSurge } = useQuery({
        ...trpc.stormSurge.getLiveData.queryOptions({
            region: "Gujarat Coast",
        }),
        refetchInterval: 8000
    });

    const { data: pollutionData, refetch: refetchPollution } = useQuery({
        ...trpc.pollution.getLiveData.queryOptions({
            region: "Gujarat Coast",
        }),
        refetchInterval: 8000
    });

    const { data: coastalErosionData, refetch: refetchCoastalErosion } = useQuery({
        ...trpc.coastalErosion.getLiveData.queryOptions({
            region: "Gujarat Coast",
        }),
        refetchInterval: 8000
    });    // Function to send threat data to local WebSocket endpoint and get ML predictions
    const sendThreatData = useCallback(async (threatType: string, data: any) => {
        try {
            const response = await fetch('/api/websocket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    threatType,
                    data,
                    region: "Gujarat Coast"
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ ${threatType} data processed with ML prediction:`, result);

                // Update ML predictions state
                if (result.prediction) {
                    setMlPredictions(prev => ({
                        ...prev,
                        [threatType]: result.prediction
                    }));
                }
            } else {
                console.error(`❌ Error processing ${threatType} data:`, response.status);
            }
        } catch (error) {
            console.error(`🚨 Error sending ${threatType} data:`, error);
        }
    }, []);

    // Send data to ML API whenever new data arrives
    useEffect(() => {
        if (cycloneData) {
            sendThreatData('cyclone', cycloneData);
        }
    }, [cycloneData, sendThreatData]);

    useEffect(() => {
        if (stormSurgeData) {
            sendThreatData('stormSurge', stormSurgeData);
        }
    }, [stormSurgeData, sendThreatData]);

    useEffect(() => {
        if (pollutionData) {
            sendThreatData('pollution', pollutionData);
        }
    }, [pollutionData, sendThreatData]);

    useEffect(() => {
        if (coastalErosionData) {
            sendThreatData('coastalErosion', coastalErosionData);
        }
    }, [coastalErosionData, sendThreatData]);

    // SSE connection setup for real-time ML predictions
    const connectSSE = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource('/api/websocket?subscribe=true');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('🔌 SSE connection established');
            setConnectionStatus('connected');
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastUpdate(new Date().toLocaleTimeString());

                if (data.type === 'threat_update') {
                    // Update ML predictions from SSE
                    if (data.prediction) {
                        setMlPredictions(prev => ({
                            ...prev,
                            [data.threatType]: data.prediction
                        }));
                    }
                } else if (data.type === 'initial_data' && Array.isArray(data.data)) {
                    // Handle initial ML prediction data
                    data.data.forEach((threat: ThreatData) => {
                        if (threat.prediction) {
                            setMlPredictions(prev => ({
                                ...prev,
                                [threat.threatType]: threat.prediction
                            }));
                        }
                    });
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            setConnectionStatus('disconnected');
            eventSource.close();

            // Retry connection after 5 seconds
            retryTimeoutRef.current = setTimeout(() => {
                console.log('🔄 Attempting to reconnect SSE...');
                connectSSE();
            }, 5000);
        };
    }, []);

    // Initialize SSE connection for ML predictions
    useEffect(() => {
        connectSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [connectSSE]);

    const refreshAllData = () => {
        refetchCyclone();
        refetchStormSurge();
        refetchPollution();
        refetchCoastalErosion();
    };    // Risk level color mapping
    const getRiskColor = (risk: string) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'bg-green-500';
            case 'moderate': return 'bg-yellow-500';
            case 'high': return 'bg-orange-500';
            case 'very high': case 'critical': case 'extreme': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getRiskBadgeColor = (risk: string) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'moderate': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'very high': case 'critical': case 'extreme': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Coastal Threat Monitoring Dashboard</h1>
                            <p className="text-gray-600">Real-time monitoring of coastal environmental threats</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                {connectionStatus === 'connected' ? (
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <Wifi className="h-4 w-4" />
                                        <span className="text-xs">Live</span>
                                    </div>
                                ) : connectionStatus === 'connecting' ? (
                                    <div className="flex items-center space-x-1 text-yellow-600">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span className="text-xs">Connecting</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1 text-red-600">
                                        <WifiOff className="h-4 w-4" />
                                        <span className="text-xs">Disconnected</span>
                                    </div>
                                )}
                                {lastUpdate && (
                                    <span className="text-xs text-gray-500">
                                        Last: {lastUpdate}
                                    </span>
                                )}
                            </div>
                            <Button
                                onClick={refreshAllData}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh All</span>
                            </Button>
                            {user && (
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src={user.picture ?? ''} alt={user.given_name ?? ''} />
                                        <AvatarFallback>
                                            {user.given_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p className="font-medium">{user.given_name || 'User'}</p>
                                        <p className="text-gray-500">{user.email}</p>
                                    </div>
                                    <LogoutLink>
                                        <Button variant="outline" size="sm">
                                            Logout
                                        </Button>
                                    </LogoutLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alert Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Cyclone Alert */}
                    <Alert className={`border-l-4 ${(cycloneData?.category || 0) >= 3 ? 'border-red-500 bg-red-50' : (cycloneData?.category || 0) >= 1 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <Wind className="h-5 w-5" />
                        <AlertTitle className="flex items-center justify-between">
                            Cyclone Risk
                            <Badge className={getRiskBadgeColor((cycloneData?.category || 0) >= 3 ? 'High' : (cycloneData?.category || 0) >= 1 ? 'Moderate' : 'Low')}>
                                Category {cycloneData?.category || 0}
                            </Badge>
                        </AlertTitle>
                        <AlertDescription>
                            <div className="space-y-1">
                                <div>Wind Speed: {cycloneData?.speed?.toFixed(1) || 0} km/h</div>
                                <div>Formation Risk: {((cycloneData?.cycloneFormationProbability || 0) * 100).toFixed(1)}%</div>
                                {mlPredictions.cyclone?.cyclone_formation_probability !== undefined && (
                                    <div className="text-blue-600">
                                        🤖 ML Prediction: {(mlPredictions.cyclone.cyclone_formation_probability * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Storm Surge Alert */}
                    <Alert className={`border-l-4 ${(stormSurgeData?.waves?.significantHeight || 0) > 3 ? 'border-red-500 bg-red-50' : (stormSurgeData?.waves?.significantHeight || 0) > 1.5 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <Waves className="h-5 w-5" />
                        <AlertTitle className="flex items-center justify-between">
                            Storm Surge
                            <Badge className={getRiskBadgeColor(stormSurgeData?.riskFactors?.surgeLevel || 'Low')}>
                                {stormSurgeData?.riskFactors?.surgeLevel || 'Low'}
                            </Badge>
                        </AlertTitle>
                        <AlertDescription>
                            Wave Height: {stormSurgeData?.waves?.significantHeight?.toFixed(1) || 0} m<br />
                            Water Level: {stormSurgeData?.waterLevel?.currentLevel?.toFixed(1) || 0} m
                        </AlertDescription>
                    </Alert>

                    {/* Pollution Alert */}
                    <Alert className={`border-l-4 ${pollutionData?.riskFactors?.overallPollutionLevel === 'SEVERE' ? 'border-red-500 bg-red-50' : pollutionData?.riskFactors?.overallPollutionLevel === 'HIGH' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <Droplets className="h-5 w-5" />
                        <AlertTitle className="flex items-center justify-between">
                            Water Quality
                            <Badge className={getRiskBadgeColor(pollutionData?.riskFactors?.overallPollutionLevel || 'Low')}>
                                {pollutionData?.riskFactors?.overallPollutionLevel || 'Low'}
                            </Badge>
                        </AlertTitle>
                        <AlertDescription>
                            pH Level: {pollutionData?.waterQuality?.pH?.toFixed(1) || 7.5}<br />
                            Dissolved O₂: {pollutionData?.waterQuality?.dissolvedOxygen?.toFixed(1) || 8} mg/L
                        </AlertDescription>
                    </Alert>

                    {/* Coastal Erosion Alert */}
                    <Alert className={`border-l-4 ${coastalErosionData?.riskFactors?.erosionSeverity === 'SEVERE' ? 'border-red-500 bg-red-50' : coastalErosionData?.riskFactors?.erosionSeverity === 'HIGH' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <Mountain className="h-5 w-5" />
                        <AlertTitle className="flex items-center justify-between">
                            Coastal Erosion
                            <Badge className={getRiskBadgeColor(coastalErosionData?.riskFactors?.erosionSeverity || 'Low')}>
                                {coastalErosionData?.riskFactors?.erosionSeverity || 'Low'}
                            </Badge>
                        </AlertTitle>
                        <AlertDescription>
                            Erosion Rate: {coastalErosionData?.shoreline?.erosionRate?.toFixed(2) || 0} m/year<br />
                            Beach Width: {coastalErosionData?.shoreline?.beachWidth?.toFixed(1) || 50} m
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Detailed Monitoring Tabs */}
                <Tabs defaultValue="cyclone" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="cyclone" className="flex items-center space-x-2">
                            <Wind className="h-4 w-4" />
                            <span>Cyclone</span>
                        </TabsTrigger>
                        <TabsTrigger value="storm-surge" className="flex items-center space-x-2">
                            <Waves className="h-4 w-4" />
                            <span>Storm Surge</span>
                        </TabsTrigger>
                        <TabsTrigger value="pollution" className="flex items-center space-x-2">
                            <Droplets className="h-4 w-4" />
                            <span>Pollution</span>
                        </TabsTrigger>
                        <TabsTrigger value="erosion" className="flex items-center space-x-2">
                            <Mountain className="h-4 w-4" />
                            <span>Erosion</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Cyclone Tab */}
                    <TabsContent value="cyclone" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Wind Conditions</CardTitle>
                                    <Wind className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{cycloneData?.speed?.toFixed(1) || 0} km/h</div>
                                    <p className="text-xs text-muted-foreground">
                                        Gusts: {cycloneData?.gusts?.toFixed(1) || 0} km/h
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Direction: {cycloneData?.direction?.toFixed(0) || 0}°
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Atmospheric Pressure</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{cycloneData?.centralPressure?.toFixed(1) || 1013} hPa</div>
                                    <p className="text-xs text-muted-foreground flex items-center">
                                        {(cycloneData?.pressureTrend || 0) < 0 ?
                                            <TrendingDown className="h-3 w-3 mr-1 text-red-500" /> :
                                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                                        }
                                        {cycloneData?.pressureTrend?.toFixed(2) || 0} hPa/hr
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sea Conditions</CardTitle>
                                    <Waves className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{cycloneData?.waveHeight?.toFixed(1) || 0} m</div>
                                    <p className="text-xs text-muted-foreground">
                                        Sea Temp: {cycloneData?.seaSurfaceTemp?.toFixed(1) || 27}°C
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Tidal Level: {cycloneData?.tidalLevel?.toFixed(1) || 2.5} m
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Weather Conditions</CardTitle>
                                    <CloudRain className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{cycloneData?.precipitation?.toFixed(1) || 0} mm/h</div>
                                    <p className="text-xs text-muted-foreground">
                                        Humidity: {cycloneData?.humidity?.toFixed(0) || 75}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Visibility: {cycloneData?.visibility?.toFixed(1) || 10} km
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Formation Risk</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Local Formation Probability */}
                                        <div>
                                            <div className="text-lg font-bold">
                                                {((cycloneData?.cycloneFormationProbability || 0) * 100).toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">Local Formation Risk</p>
                                            <Progress value={(cycloneData?.cycloneFormationProbability || 0) * 100} className="h-2 mt-1" />
                                        </div>

                                        {/* ML Prediction */}
                                        {mlPredictions.cyclone?.cyclone_formation_probability !== undefined && (
                                            <div className="border-t pt-2">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {(mlPredictions.cyclone.cyclone_formation_probability * 100).toFixed(1)}%
                                                </div>
                                                <p className="text-xs text-blue-600">🤖 ML Prediction</p>
                                                <Progress
                                                    value={mlPredictions.cyclone.cyclone_formation_probability * 100}
                                                    className="h-2 mt-1"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Enhanced by Machine Learning
                                                </p>
                                            </div>
                                        )}

                                        {cycloneData?.landfallETA && (
                                            <p className="text-xs text-muted-foreground">
                                                ETA: {cycloneData.landfallETA} hours
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Location</CardTitle>
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium">{cycloneData?.region || 'Gujarat Coast'}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {cycloneData?.latitude?.toFixed(4) || 22.2587}°N, {cycloneData?.longitude?.toFixed(4) || 71.1924}°E
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Updated: {cycloneData?.timestamp ? new Date(cycloneData.timestamp).toLocaleTimeString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Storm Surge Tab */}
                    <TabsContent value="storm-surge" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Water Levels</CardTitle>
                                    <Waves className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stormSurgeData?.waterLevel?.currentLevel?.toFixed(1) || 0} m</div>
                                    <p className="text-xs text-muted-foreground">
                                        Anomaly: {stormSurgeData?.waterLevel?.anomaly?.toFixed(1) || 0} m
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Rate of Rise: {stormSurgeData?.waterLevel?.rateOfRise?.toFixed(2) || 0} m/h
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Wave Conditions</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stormSurgeData?.waves?.significantHeight?.toFixed(1) || 0} m</div>
                                    <p className="text-xs text-muted-foreground">
                                        Max Height: {stormSurgeData?.waves?.maxHeight?.toFixed(1) || 0} m
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Period: {stormSurgeData?.waves?.period?.toFixed(1) || 6} s
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Flood Risk</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stormSurgeData?.impact?.inundationDepth?.toFixed(1) || 0} m</div>
                                    <p className="text-xs text-muted-foreground">
                                        Inundation: {stormSurgeData?.impact?.inundationExtent?.toFixed(0) || 0} m inland
                                    </p>
                                    <Badge className={getRiskBadgeColor(stormSurgeData?.riskFactors?.surgeLevel || 'Low')}>
                                        {stormSurgeData?.riskFactors?.surgeLevel || 'Low'} Risk
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Pollution Tab */}
                    <TabsContent value="pollution" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
                                    <Droplets className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">pH {pollutionData?.waterQuality?.pH?.toFixed(1) || 7.5}</div>
                                    <p className="text-xs text-muted-foreground">
                                        DO: {pollutionData?.waterQuality?.dissolvedOxygen?.toFixed(1) || 8} mg/L
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Turbidity: {pollutionData?.waterQuality?.turbidity?.toFixed(1) || 5} NTU
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Chemical Contamination</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pollutionData?.chemicals?.heavyMetals?.lead?.toFixed(3) || 0} mg/L</div>
                                    <p className="text-xs text-muted-foreground">
                                        Lead Concentration
                                    </p>
                                    <Badge className={getRiskBadgeColor(pollutionData?.riskFactors?.humanHealthRisk || 'Low')}>
                                        {pollutionData?.riskFactors?.humanHealthRisk || 'Low'} Health Risk
                                    </Badge>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Biological Impact</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pollutionData?.biological?.coliformCount?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Coliform Count (CFU/100ml)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Fish Mortality: {pollutionData?.biological?.fishMortality?.toFixed(1) || 0} per km²
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Coastal Erosion Tab */}
                    <TabsContent value="erosion" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Shoreline Changes</CardTitle>
                                    <Mountain className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{coastalErosionData?.shoreline?.erosionRate?.toFixed(2) || 0} m/yr</div>
                                    <p className="text-xs text-muted-foreground">
                                        Beach Width: {coastalErosionData?.shoreline?.beachWidth?.toFixed(1) || 50} m
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Retreat: {coastalErosionData?.shoreline?.shorelineRetreat?.toFixed(1) || 0} m total
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{((coastalErosionData?.protection?.artificialStructures?.effectivenessRating || 0) * 100).toFixed(0)}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        Protection Effectiveness
                                    </p>
                                    <Badge variant={coastalErosionData?.protection?.artificialStructures?.seawalls ? 'default' : 'secondary'}>
                                        {coastalErosionData?.protection?.artificialStructures?.seawalls ? 'Has' : 'No'} Seawall
                                    </Badge>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Economic Impact</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{(coastalErosionData?.impact?.economicLoss || 0).toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Annual Economic Loss
                                    </p>
                                    <Badge className={getRiskBadgeColor(coastalErosionData?.riskFactors?.erosionSeverity || 'Low')}>
                                        {coastalErosionData?.riskFactors?.erosionSeverity || 'Low'} Risk
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

