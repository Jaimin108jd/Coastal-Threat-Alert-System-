import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Waves, Wind, Factory, Mountain } from 'lucide-react';

interface PredictionResult {
    cyclone_formation_probability?: number;
    storm_surge_risk?: number;
    pollution_level?: number;
    erosion_rate?: number;
    confidence?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

interface ThreatPredictionCardProps {
    threatType: 'cyclone' | 'stormSurge' | 'pollution' | 'coastalErosion';
    prediction: PredictionResult | null;
    timestamp?: string;
    isConnected?: boolean;
    className?: string;
}

const THREAT_CONFIG = {
    cyclone: {
        title: 'Cyclone Formation Risk',
        icon: Wind,
        primaryMetric: 'cyclone_formation_probability',
        primaryLabel: 'Formation Probability',
        color: {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        },
        description: 'Real-time cyclone formation probability based on atmospheric conditions'
    },
    stormSurge: {
        title: 'Storm Surge Risk',
        icon: Waves,
        primaryMetric: 'storm_surge_risk',
        primaryLabel: 'Surge Risk Level',
        color: {
            low: 'bg-blue-500',
            medium: 'bg-cyan-500',
            high: 'bg-indigo-500',
            critical: 'bg-purple-500'
        },
        description: 'Predicted storm surge height and coastal impact assessment'
    },
    pollution: {
        title: 'Pollution Level',
        icon: Factory,
        primaryMetric: 'pollution_level',
        primaryLabel: 'Pollution Index',
        color: {
            low: 'bg-emerald-500',
            medium: 'bg-amber-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        },
        description: 'Water quality and pollution concentration analysis'
    },
    coastalErosion: {
        title: 'Coastal Erosion Rate',
        icon: Mountain,
        primaryMetric: 'erosion_rate',
        primaryLabel: 'Erosion Rate',
        color: {
            low: 'bg-slate-500',
            medium: 'bg-stone-500',
            high: 'bg-yellow-600',
            critical: 'bg-red-600'
        },
        description: 'Predicted coastal erosion rate and shoreline change'
    }
};

function getRiskLevel(value: number, threatType: string): 'low' | 'medium' | 'high' | 'critical' {
    if (threatType === 'cyclone' || threatType === 'stormSurge') {
        if (value < 0.3) return 'low';
        if (value < 0.6) return 'medium';
        if (value < 0.8) return 'high';
        return 'critical';
    } else {
        if (value < 0.25) return 'low';
        if (value < 0.5) return 'medium';
        if (value < 0.75) return 'high';
        return 'critical';
    }
}

function formatTimestamp(timestamp?: string): string {
    if (!timestamp) return 'No data available';

    try {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    } catch {
        return 'Invalid timestamp';
    }
}

export function ThreatPredictionCard({
    threatType,
    prediction,
    timestamp,
    isConnected = false,
    className = ''
}: ThreatPredictionCardProps) {
    const config = THREAT_CONFIG[threatType];
    const Icon = config.icon;

    if (!prediction) {
        return (
            <Card className={`w-full ${className}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{config.title}</CardTitle>
                        <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
                            {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                    <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            No prediction data available. Waiting for ML analysis...
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const primaryValue = prediction[config.primaryMetric as keyof PredictionResult] as number;
    const riskLevel = primaryValue ? getRiskLevel(primaryValue, threatType) : 'low';
    const percentage = primaryValue ? Math.round(primaryValue * 100) : 0;
    const confidence = prediction.confidence ? Math.round(prediction.confidence * 100) : null;

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                    <Badge
                        variant={isConnected ? "default" : "destructive"}
                        className="ml-auto"
                    >
                        {isConnected ? "Live" : "Offline"}
                    </Badge>
                </div>
                <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Primary Metric Display */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{config.primaryLabel}</span>
                        <Badge
                            className={`${config.color[riskLevel]} text-white`}
                            variant="secondary"
                        >
                            {riskLevel.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Progress
                            value={percentage}
                            className="flex-1"
                        />
                        <span className="text-2xl font-bold min-w-[60px] text-right">
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* Confidence Level */}
                {confidence && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">
                                Confidence Level
                            </span>
                            <span className="text-sm font-medium">{confidence}%</span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                    </div>
                )}

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    {threatType === 'cyclone' && prediction.cyclone_formation_probability && (
                        <>
                            <div className="text-center">
                                <div className="text-lg font-semibold">
                                    {(prediction.cyclone_formation_probability * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Formation Risk</div>
                            </div>
                        </>
                    )}

                    {threatType === 'stormSurge' && prediction.storm_surge_risk && (
                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {(prediction.storm_surge_risk * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Surge Risk</div>
                        </div>
                    )}

                    {threatType === 'pollution' && prediction.pollution_level && (
                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {(prediction.pollution_level * 100).toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">Pollution Index</div>
                        </div>
                    )}

                    {threatType === 'coastalErosion' && prediction.erosion_rate && (
                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {(prediction.erosion_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Erosion Rate</div>
                        </div>
                    )}

                    <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground">
                            Last Update
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {formatTimestamp(timestamp)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
