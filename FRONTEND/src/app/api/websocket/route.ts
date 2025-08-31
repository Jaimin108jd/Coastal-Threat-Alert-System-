import { NextRequest, NextResponse } from 'next/server';

// Store for threat data and predictions
interface ThreatData {
    threatType: string;
    data: any;
    prediction?: any;
    timestamp: string;
    region: string;
}

interface MlPredictionResponse {
    cyclone_formation_probability?: number;
    storm_surge_risk?: number;
    pollution_level?: number;
    erosion_rate_prediction?: number;
}

// In-memory store for active threat data
const activeThreatData = new Map<string, ThreatData>();

// Server-Sent Events connections
const sseConnections = new Set<ReadableStreamDefaultController>();

// Broadcast data to all SSE connections
function broadcastToSSE(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;

    sseConnections.forEach(controller => {
        try {
            controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
            sseConnections.delete(controller);
        }
    });
}

// Function to send ML prediction to external API and get results
async function getMlPrediction(threatType: string, data: any): Promise<MlPredictionResponse | null> {
    try {
        const mlPayload = prepareMlPayload(threatType, data);

        const response = await fetch('https://scx7v12m-8000.inc1.devtunnels.ms/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mlPayload)
        });

        if (response.ok) {
            const prediction = await response.json();
            console.log(`🤖 ML Prediction for ${threatType}:`, prediction);
            return prediction;
        } else {
            console.error(`❌ ML API error for ${threatType}:`, response.status);
            return null;
        }
    } catch (error) {
        console.error(`🚨 ML Prediction error for ${threatType}:`, error);
        return null;
    }
}

// Prepare data payload for ML API based on threat type
function prepareMlPayload(threatType: string, data: any) {
    switch (threatType) {
        case 'cyclone':
            return {
                central_pressure: data.centralPressure,
                wind_speed: data.speed,
                wind_shear: data.verticalShear,
                sea_surface_temp: data.seaSurfaceTemp,
                cloud_top_temp: data.cloudTopTemp,
                vorticity: data.vorticity,
                convective_activity: data.convectiveActivity,
                humidity: data.humidity,
                precipitation: data.precipitation
            };
        case 'stormSurge':
            return {
                water_level: data.waterLevel?.currentLevel,
                wave_height: data.waves?.significantHeight,
                wind_speed: data.meteorology?.windSpeed,
                atmospheric_pressure: data.meteorology?.atmosphericPressure,
                storm_distance: data.meteorology?.stormDistance
            };
        case 'pollution':
            return {
                pH: data.waterQuality?.pH,
                dissolved_oxygen: data.waterQuality?.dissolvedOxygen,
                turbidity: data.waterQuality?.turbidity,
                heavy_metals: data.chemicals?.heavyMetals?.lead,
                coliform_count: data.biological?.coliformCount
            };
        case 'coastalErosion':
            return {
                erosion_rate: data.shoreline?.erosionRate,
                wave_energy: data.hydrodynamics?.waveEnergy,
                sea_level_rise: data.drivers?.seaLevelRise,
                vegetation_coverage: data.protection?.naturalBarriers?.vegetation
            };
        default:
            return data;
    }
}

// HTTP endpoint to receive threat data and trigger ML predictions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { threatType, data, region = "Gujarat Coast" } = body;

        // Get ML prediction
        const prediction = await getMlPrediction(threatType, data);

        // Store threat data with prediction
        const threatData: ThreatData = {
            threatType,
            data,
            prediction,
            timestamp: new Date().toISOString(),
            region
        };

        activeThreatData.set(threatType, threatData);

        // Broadcast to all SSE clients
        broadcastToSSE({
            type: 'threat_update',
            threatType,
            data,
            prediction,
            timestamp: threatData.timestamp,
            region
        });

        return NextResponse.json({
            success: true,
            threatType,
            prediction,
            clientsNotified: sseConnections.size,
            timestamp: threatData.timestamp
        });

    } catch (error) {
        console.error('� Threat data processing error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process threat data' },
            { status: 500 }
        );
    }
}

// Server-Sent Events endpoint for real-time updates
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const subscribe = searchParams.get('subscribe');

    if (subscribe === 'true') {
        // Create SSE stream
        const stream = new ReadableStream({
            start(controller) {
                // Add to connections
                sseConnections.add(controller);

                // Send initial data
                const initialData = Array.from(activeThreatData.values());
                if (initialData.length > 0) {
                    controller.enqueue(new TextEncoder().encode(
                        `data: ${JSON.stringify({
                            type: 'initial_data',
                            data: initialData,
                            timestamp: new Date().toISOString()
                        })}\n\n`
                    ));
                }

                // Send heartbeat every 30 seconds
                const heartbeat = setInterval(() => {
                    try {
                        controller.enqueue(new TextEncoder().encode(
                            `data: ${JSON.stringify({
                                type: 'heartbeat',
                                timestamp: new Date().toISOString()
                            })}\n\n`
                        ));
                    } catch (error) {
                        clearInterval(heartbeat);
                        sseConnections.delete(controller);
                    }
                }, 30000);
            },
            cancel() {
                // Clean up when client disconnects
                sseConnections.delete(this as any);
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            }
        });
    }

    // Health check
    const clientCount = sseConnections.size;
    const activeThreats = Array.from(activeThreatData.keys());

    return NextResponse.json({
        status: 'healthy',
        sseClients: clientCount,
        activeThreats,
        threatDataCount: activeThreatData.size,
        timestamp: new Date().toISOString()
    });
}
