import { NextRequest, NextResponse } from 'next/server';

// Generate realistic storm surge sensor data (same function as in tRPC)
function generateStormSurgeData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate a storm surge event
    const surgeIntensity = Math.random(); // 0-1 scale
    const timeVariation = Math.sin(Date.now() / 8000) * 0.4; // Temporal variation
    const tidalCycle = Math.sin(Date.now() / 12000) * 0.3; // Tidal influence

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.05,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.05,
        region: "Gujarat Coast",
        waterLevel: 2.5 + (surgeIntensity * 6) + tidalCycle + (Math.random() - 0.5) * 0.5,
        surgeHeight: surgeIntensity * 4 + (Math.random() - 0.5) * 0.8,
        waveHeight: 1 + (surgeIntensity * 7) + (Math.random() - 0.5) * 1.5,
        wavePeriod: 6 + (surgeIntensity * 8) + (Math.random() - 0.5) * 2,
        waveDirection: 180 + (Math.random() - 0.5) * 90,
        tidalLevel: 2.0 + tidalCycle + (Math.random() - 0.5) * 0.3,
        tidalRange: 1.8 + (Math.random() - 0.5) * 0.6,
        currentSpeed: 0.3 + (surgeIntensity * 2.5) + (Math.random() - 0.5) * 0.4,
        currentDirection: 200 + (Math.random() - 0.5) * 80,
        windSpeed: 15 + (surgeIntensity * 100) + (Math.random() - 0.5) * 20,
        windDirection: 180 + (Math.random() - 0.5) * 60,
        windGusts: 20 + (surgeIntensity * 120) + (Math.random() - 0.5) * 25,
        atmosphericPressure: 1013 - (surgeIntensity * 45) + (Math.random() - 0.5) * 8,
        pressureTrend: -1.5 * surgeIntensity + (Math.random() - 0.5) * 1,
        temperature: 26 + (surgeIntensity * 4) + timeVariation,
        seaSurfaceTemp: 27 + (surgeIntensity * 3) + timeVariation,
        salinity: 35 + (Math.random() - 0.5) * 2,
        turbidity: 10 + (surgeIntensity * 80) + (Math.random() - 0.5) * 20,
        sedimentLoad: surgeIntensity * 150 + (Math.random() - 0.5) * 30,
        floodDepth: surgeIntensity > 0.4 ? (surgeIntensity - 0.4) * 8 : 0,
        inundationArea: surgeIntensity > 0.5 ? (surgeIntensity - 0.5) * 1000 : 0,
        drainageRate: 50 - (surgeIntensity * 30) + (Math.random() - 0.5) * 10,
        evacuationStatus: surgeIntensity > 0.7 ? "Active" : surgeIntensity > 0.4 ? "Standby" : "Normal",
        riskLevel: getSurgeRiskLevel(surgeIntensity * 4),
        dataReliability: 0.82 + Math.random() * 0.18,
        lastCalibration: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 65 + Math.random() * 35,
        signalStrength: -45 + Math.random() * 25,
    };
}

function getSurgeRiskLevel(surgeHeight: number): string {
    if (surgeHeight < 1) return "Low";
    if (surgeHeight < 2) return "Moderate";
    if (surgeHeight < 3) return "High";
    if (surgeHeight < 4) return "Very High";
    return "Extreme";
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const count = Math.min(parseInt(searchParams.get('count') || '1000'), 10000);
        const format = searchParams.get('format') || 'csv'; // csv or json
        const download = searchParams.get('download') === 'true';
        const timeInterval = parseInt(searchParams.get('interval') || '30'); // minutes

        // CSV Headers
        const headers = [
            'timestamp',
            'latitude',
            'longitude',
            'region',
            'water_level',
            'surge_height',
            'wave_height',
            'wave_period',
            'wave_direction',
            'tidal_level',
            'tidal_range',
            'current_speed',
            'current_direction',
            'wind_speed',
            'wind_direction',
            'wind_gusts',
            'atmospheric_pressure',
            'pressure_trend',
            'air_temperature',
            'sea_surface_temp',
            'salinity',
            'turbidity',
            'sediment_load',
            'flood_depth',
            'inundation_area',
            'drainage_rate',
            'evacuation_status',
            'risk_level',
            'data_reliability',
            'battery_level',
            'signal_strength'
        ];

        // Different coastal locations for variety
        const baseLocations = [
            { lat: 22.2587, lng: 71.1924, region: "Gujarat Coast" },
            { lat: 21.6417, lng: 69.6293, region: "Porbandar" },
            { lat: 22.2394, lng: 68.9678, region: "Dwarka" },
            { lat: 22.4707, lng: 70.0577, region: "Jamnagar" },
            { lat: 21.7645, lng: 72.1519, region: "Bhavnagar" },
            { lat: 20.9217, lng: 70.2034, region: "Veraval" },
            { lat: 23.0225, lng: 72.5714, region: "Ahmedabad Coast" }
        ];

        const csvData = [];
        const jsonData = [];

        // Generate data points
        for (let i = 0; i < count; i++) {
            // Create time series going backwards from now
            const timestamp = new Date(Date.now() - (i * timeInterval * 60 * 1000));

            // Rotate through different locations
            const location = baseLocations[i % baseLocations.length];
            const lat = location.lat + (Math.random() - 0.5) * 0.1;
            const lng = location.lng + (Math.random() - 0.5) * 0.1;

            const data = generateStormSurgeData({ lat, lng });

            if (format === 'csv') {
                // Flattened data for CSV
                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    water_level: data.waterLevel.toFixed(2),
                    surge_height: data.surgeHeight.toFixed(2),
                    wave_height: data.waveHeight.toFixed(2),
                    wave_period: data.wavePeriod.toFixed(1),
                    wave_direction: data.waveDirection.toFixed(1),
                    tidal_level: data.tidalLevel.toFixed(2),
                    tidal_range: data.tidalRange.toFixed(2),
                    current_speed: data.currentSpeed.toFixed(2),
                    current_direction: data.currentDirection.toFixed(1),
                    wind_speed: data.windSpeed.toFixed(2),
                    wind_direction: data.windDirection.toFixed(1),
                    wind_gusts: data.windGusts.toFixed(2),
                    atmospheric_pressure: data.atmosphericPressure.toFixed(2),
                    pressure_trend: data.pressureTrend.toFixed(3),
                    air_temperature: data.temperature.toFixed(2),
                    sea_surface_temp: data.seaSurfaceTemp.toFixed(2),
                    salinity: data.salinity.toFixed(2),
                    turbidity: data.turbidity.toFixed(1),
                    sediment_load: data.sedimentLoad.toFixed(2),
                    flood_depth: data.floodDepth.toFixed(2),
                    inundation_area: data.inundationArea.toFixed(2),
                    drainage_rate: data.drainageRate.toFixed(2),
                    evacuation_status: data.evacuationStatus,
                    risk_level: data.riskLevel,
                    data_reliability: data.dataReliability.toFixed(3),
                    battery_level: data.batteryLevel.toFixed(1),
                    signal_strength: data.signalStrength.toFixed(1)
                };
                csvData.push(flatData);
            } else {
                // Full nested data for JSON
                data.timestamp = timestamp.toISOString();
                data.latitude = lat;
                data.longitude = lng;
                data.region = location.region;
                jsonData.push(data);
            }
        }

        if (format === 'csv') {
            // Convert to CSV string
            let csvString = headers.join(',') + '\n';

            csvData.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header as keyof typeof row];
                    if (value === null || value === undefined || value === '') return '';
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`;
                    }
                    return value;
                });
                csvString += values.join(',') + '\n';
            });

            const filename = `storm_surge_data_${count}_points_${Date.now()}.csv`;

            // Set appropriate headers for CSV download
            const responseHeaders = new Headers({
                'Content-Type': download ? 'text/csv' : 'application/json',
                'Content-Length': csvString.length.toString(),
            });

            if (download) {
                responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
                return new NextResponse(csvString, { headers: responseHeaders });
            } else {
                // Return JSON with CSV content
                return NextResponse.json({
                    success: true,
                    format: 'csv',
                    dataPoints: csvData.length,
                    filename,
                    size: csvString.length,
                    sizeKB: (csvString.length / 1024).toFixed(2),
                    headers,
                    csvContent: csvString,
                    generatedAt: new Date().toISOString(),
                    timeRange: {
                        start: new Date(Date.now() - ((count - 1) * timeInterval * 60 * 1000)).toISOString(),
                        end: new Date().toISOString(),
                        intervalMinutes: timeInterval
                    },
                    downloadUrl: `/api/storm-surge/csv?count=${count}&download=true&interval=${timeInterval}`
                });
            }
        } else {
            // Return JSON format
            const filename = `storm_surge_data_${count}_points_${Date.now()}.json`;

            return NextResponse.json({
                success: true,
                format: 'json',
                dataPoints: jsonData.length,
                filename,
                data: jsonData,
                generatedAt: new Date().toISOString(),
                timeRange: {
                    start: new Date(Date.now() - ((count - 1) * timeInterval * 60 * 1000)).toISOString(),
                    end: new Date().toISOString(),
                    intervalMinutes: timeInterval
                }
            });
        }

    } catch (error) {
        console.error('Error generating storm surge CSV data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate storm surge data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
