import { NextRequest, NextResponse } from 'next/server';

// Generate realistic cyclone sensor data (same function as in tRPC)
function generateCycloneData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate a developing cyclone system
    const cycloneIntensity = Math.random(); // 0-1 scale
    const timeVariation = Math.sin(Date.now() / 10000) * 0.3; // Temporal variation

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.1,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.1,
        region: "Gujarat Coast",
        centralPressure: 1013 - (cycloneIntensity * 40) + (Math.random() - 0.5) * 5,
        pressureTrend: -2 * cycloneIntensity + (Math.random() - 0.5) * 1.5,
        seaLevelPressure: 1015 - (cycloneIntensity * 35) + (Math.random() - 0.5) * 3,
        speed: 20 + (cycloneIntensity * 150) + (Math.random() - 0.5) * 20,
        direction: 180 + (Math.random() - 0.5) * 60,
        gusts: 25 + (cycloneIntensity * 180) + (Math.random() - 0.5) * 25,
        verticalShear: 5 + (Math.random() * 15),
        seaSurfaceTemp: 26 + (cycloneIntensity * 4) + timeVariation,
        waveHeight: 1 + (cycloneIntensity * 8) + (Math.random() - 0.5) * 2,
        tidalLevel: 2.5 + (cycloneIntensity * 2) + Math.sin(Date.now() / 6000) * 0.8,
        currentSpeed: 0.5 + (cycloneIntensity * 2),
        salinity: 35 + (Math.random() - 0.5) * 1,
        temperature: 28 + (cycloneIntensity * 3) + timeVariation,
        humidity: 70 + (cycloneIntensity * 25) + (Math.random() - 0.5) * 10,
        precipitation: cycloneIntensity * 50 + (Math.random() - 0.5) * 20,
        visibility: 10 - (cycloneIntensity * 8),
        cloudCover: 30 + (cycloneIntensity * 60),
        cloudTopTemp: -40 - (cycloneIntensity * 30),
        vorticity: cycloneIntensity * 0.001,
        divergence: -cycloneIntensity * 0.0005,
        convectiveActivity: cycloneIntensity * 0.8,
        cycloneFormationProbability: Math.min(0.95, cycloneIntensity * 1.2),
        intensificationRate: cycloneIntensity > 0.6 ? (cycloneIntensity - 0.6) * 2.5 : 0,
        landfallETA: cycloneIntensity > 0.7 ? Math.round(48 - cycloneIntensity * 24) : null,
        category: getCycloneCategory(20 + (cycloneIntensity * 150)),
        dataReliability: 0.85 + Math.random() * 0.15,
        lastCalibration: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 70 + Math.random() * 30,
        signalStrength: -50 + Math.random() * 20,
    };
}

function getCycloneCategory(windSpeed: number): number {
    if (windSpeed < 62) return 0;
    if (windSpeed < 88) return 1;
    if (windSpeed < 118) return 2;
    if (windSpeed < 166) return 3;
    if (windSpeed < 221) return 4;
    return 5;
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
            'central_pressure',
            'pressure_trend',
            'sea_level_pressure',
            'wind_speed',
            'wind_direction',
            'wind_gusts',
            'wind_shear',
            'sea_surface_temp',
            'wave_height',
            'tidal_level',
            'current_speed',
            'salinity',
            'air_temperature',
            'humidity',
            'precipitation',
            'visibility',
            'cloud_cover',
            'cloud_top_temp',
            'vorticity',
            'divergence',
            'convective_activity',
            'cyclone_formation_probability',
            'intensification_rate',
            'landfall_eta',
            'cyclone_category',
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
            const lat = location.lat + (Math.random() - 0.5) * 0.2;
            const lng = location.lng + (Math.random() - 0.5) * 0.2;

            const data = generateCycloneData({ lat, lng });

            if (format === 'csv') {
                // Flattened data for CSV
                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    central_pressure: data.centralPressure.toFixed(2),
                    pressure_trend: data.pressureTrend.toFixed(3),
                    sea_level_pressure: data.seaLevelPressure.toFixed(2),
                    wind_speed: data.speed.toFixed(2),
                    wind_direction: data.direction.toFixed(1),
                    wind_gusts: data.gusts.toFixed(2),
                    wind_shear: data.verticalShear.toFixed(2),
                    sea_surface_temp: data.seaSurfaceTemp.toFixed(2),
                    wave_height: data.waveHeight.toFixed(2),
                    tidal_level: data.tidalLevel.toFixed(2),
                    current_speed: data.currentSpeed.toFixed(2),
                    salinity: data.salinity.toFixed(2),
                    air_temperature: data.temperature.toFixed(2),
                    humidity: data.humidity.toFixed(1),
                    precipitation: data.precipitation.toFixed(2),
                    visibility: data.visibility.toFixed(1),
                    cloud_cover: data.cloudCover.toFixed(1),
                    cloud_top_temp: data.cloudTopTemp.toFixed(2),
                    vorticity: data.vorticity.toFixed(6),
                    divergence: data.divergence.toFixed(6),
                    convective_activity: data.convectiveActivity.toFixed(3),
                    cyclone_formation_probability: data.cycloneFormationProbability.toFixed(3),
                    intensification_rate: data.intensificationRate.toFixed(3),
                    landfall_eta: data.landfallETA || '',
                    cyclone_category: data.category,
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

            const filename = `cyclone_data_${count}_points_${Date.now()}.csv`;

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
                    downloadUrl: `/api/cyclone/csv?count=${count}&download=true&interval=${timeInterval}`
                });
            }
        } else {
            // Return JSON format
            const filename = `cyclone_data_${count}_points_${Date.now()}.json`;

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
        console.error('Error generating cyclone CSV data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate cyclone data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
