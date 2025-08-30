"use client";

import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileSpreadsheet, Database, Clock, Waves, Zap, Droplets, Mountain } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function CoastalThreatDataGenerator() {
    const [threatType, setThreatType] = useState<'cyclone' | 'stormSurge' | 'pollution' | 'coastalErosion'>('cyclone');
    const [count, setCount] = useState(1000);
    const [timeInterval, setTimeInterval] = useState(30);
    const [isGenerating, setIsGenerating] = useState(false);

    const trpc = useTRPC();

    // Dynamic query based on selected threat type
    const { data: csvData, isLoading, error, refetch } = useQuery({
        ...trpc[threatType].generateCSVData.queryOptions({
            count,
            includeHeaders: true,
            timeInterval
        }),
        enabled: false,
    });

    const threatConfig = {
        cyclone: {
            icon: Zap,
            title: "Cyclone Monitoring",
            description: "Meteorological and oceanographic parameters for cyclone prediction",
            color: "from-purple-600 to-blue-600",
            features: 32
        },
        stormSurge: {
            icon: Waves,
            title: "Storm Surge Monitoring",
            description: "Water level monitoring and surge impact assessment",
            color: "from-blue-600 to-cyan-600",
            features: 27
        },
        pollution: {
            icon: Droplets,
            title: "Pollution Monitoring",
            description: "Water quality, chemical analysis, and contamination tracking",
            color: "from-red-600 to-orange-600",
            features: 48
        },
        coastalErosion: {
            icon: Mountain,
            title: "Coastal Erosion Monitoring",
            description: "Shoreline changes, sediment analysis, and erosion assessment",
            color: "from-green-600 to-teal-600",
            features: 55
        }
    };

    const currentConfig = threatConfig[threatType];
    const IconComponent = currentConfig.icon;

    const handleGenerateCSV = async () => {
        setIsGenerating(true);
        try {
            await refetch();
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadCSV = async (type: string) => {
        try {
            const response = await fetch(`/api/${type.replace(/([A-Z])/g, '-$1').toLowerCase()}/csv?count=${count}&download=true&interval=${timeInterval}`);

            if (!response.ok) {
                throw new Error('Failed to download CSV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${type}_data_${count}_points_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download CSV file');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🌊 Coastal Threat Alert System
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Comprehensive ML training data generator for coastal monitoring and early warning
                    </p>
                </div>

                {/* Threat Type Selection */}
                <Card className="bg-black/30 border-white/10 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Database className="w-5 h-5 mr-2 text-blue-400" />
                            Select Coastal Threat Type
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                            Choose the type of coastal threat data you want to generate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(threatConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <Button
                                        key={key}
                                        variant={threatType === key ? "default" : "outline"}
                                        className={`h-20 flex flex-col space-y-2 ${threatType === key
                                                ? `bg-gradient-to-r ${config.color} hover:opacity-90`
                                                : "border-white/30 text-white hover:bg-white/10"
                                            }`}
                                        onClick={() => setThreatType(key as any)}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{config.title}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Current Selection Info */}
                <Card className={`bg-gradient-to-r ${currentConfig.color}/20 border-white/10 backdrop-blur`}>
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <IconComponent className="w-5 h-5 mr-2" />
                            {currentConfig.title}
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            {currentConfig.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <Badge variant="secondary" className="bg-white/20 text-white">
                                {currentConfig.features} Features
                            </Badge>
                            <Badge variant="outline" className="border-white/30 text-white">
                                Advanced ML Ready
                            </Badge>
                            <Badge variant="outline" className="border-white/30 text-white">
                                Real-time Simulation
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card className="bg-black/30 border-white/10 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">Data Generation Configuration</CardTitle>
                        <CardDescription className="text-blue-200">
                            Configure the parameters for your {currentConfig.title.toLowerCase()} dataset
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="count" className="text-white">Number of Data Points</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="100"
                                    max="10000"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value) || 1000)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                                <p className="text-xs text-blue-300">Between 100 and 10,000 data points</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interval" className="text-white">Time Interval (minutes)</Label>
                                <Input
                                    id="interval"
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={timeInterval}
                                    onChange={(e) => setTimeInterval(parseInt(e.target.value) || 30)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                                <p className="text-xs text-blue-300">Time between consecutive data points</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <Button
                                onClick={handleGenerateCSV}
                                disabled={isGenerating || isLoading}
                                className={`bg-gradient-to-r ${currentConfig.color} hover:opacity-90`}
                            >
                                {isGenerating || isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Generate Preview
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={() => handleDownloadCSV(threatType)}
                                variant="secondary"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                        <AlertDescription className="text-white">
                            Error: {error.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Results */}
                {csvData && (
                    <>
                        <Card className="bg-black/30 border-white/10 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <FileSpreadsheet className="w-5 h-5 mr-2 text-green-400" />
                                    Generated {currentConfig.title} Dataset
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-white font-medium">Data Points</div>
                                        <div className="text-2xl text-blue-400">{csvData.dataPoints.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">File Size</div>
                                        <div className="text-2xl text-blue-400">{csvData.sizeKB} KB</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Features</div>
                                        <div className="text-2xl text-blue-400">{csvData.headers.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Locations</div>
                                        <div className="text-2xl text-blue-400">{csvData.locations.length}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-white font-medium">Time Range</h4>
                                    <div className="flex items-center space-x-4 text-sm text-blue-200">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            Start: {new Date(csvData.timeRange.start).toLocaleString()}
                                        </div>
                                        <div>
                                            End: {new Date(csvData.timeRange.end).toLocaleString()}
                                        </div>
                                        <Badge variant="outline" className="text-white border-white/30">
                                            {csvData.timeRange.intervalMinutes}min intervals
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-white font-medium">Monitoring Locations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {csvData.locations.map((location: string, index: number) => (
                                            <Badge key={index} variant="secondary" className={`bg-gradient-to-r ${currentConfig.color}/30 text-white`}>
                                                {location}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sample Data Preview */}
                        <Card className="bg-black/30 border-white/10 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white">CSV Preview (First 5 Lines)</CardTitle>
                                <CardDescription className="text-blue-200">
                                    Sample of the generated {currentConfig.title.toLowerCase()} data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs text-green-400 bg-black/50 p-4 rounded-lg overflow-auto max-h-64">
                                    {csvData.csvContent.split('\n').slice(0, 6).join('\n')}
                                </pre>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Quick Download Section */}
                <Card className="bg-black/30 border-white/10 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Download All Threat Types</CardTitle>
                        <CardDescription className="text-blue-200">
                            Download pre-configured datasets for all coastal threats
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(threatConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <Button
                                        key={key}
                                        onClick={() => handleDownloadCSV(key)}
                                        variant="outline"
                                        className="h-16 flex flex-col space-y-1 border-white/30 text-white hover:bg-white/10"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs">Download {config.title}</span>
                                        <span className="text-xs text-blue-300">{config.features} features</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
