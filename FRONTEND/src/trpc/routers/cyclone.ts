import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';


// Generate realistic cyclone sensor data
function generateCycloneData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate a developing cyclone system
    const cycloneIntensity = Math.random(); // 0-1 scale
    const timeVariation = Math.sin(Date.now() / 10000) * 0.3; // Temporal variation

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.1,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.1,
        region: "Gujarat Coast", // Example region

        // Primary Cyclone Indicators
        centralPressure: 1013 - (cycloneIntensity * 40) + (Math.random() - 0.5) * 5, // 973-1018 hPa
        pressureTrend: -2 * cycloneIntensity + (Math.random() - 0.5) * 1.5, // hPa/hour
        seaLevelPressure: 1015 - (cycloneIntensity * 35) + (Math.random() - 0.5) * 3,

        speed: 20 + (cycloneIntensity * 150) + (Math.random() - 0.5) * 20, // 0-170 km/h
        direction: 180 + (Math.random() - 0.5) * 60, // degrees
        gusts: 25 + (cycloneIntensity * 180) + (Math.random() - 0.5) * 25, // km/h
        verticalShear: 5 + (Math.random() * 15), // m/s (lower is better for cyclones)

        seaSurfaceTemp: 26 + (cycloneIntensity * 4) + timeVariation, // 26-30°C
        waveHeight: 1 + (cycloneIntensity * 8) + (Math.random() - 0.5) * 2, // meters
        tidalLevel: 2.5 + (cycloneIntensity * 2) + Math.sin(Date.now() / 6000) * 0.8, // meters
        currentSpeed: 0.5 + (cycloneIntensity * 2), // m/s
        salinity: 35 + (Math.random() - 0.5) * 1, // psu

        temperature: 28 + (cycloneIntensity * 3) + timeVariation, // °C
        humidity: 70 + (cycloneIntensity * 25) + (Math.random() - 0.5) * 10, // %
        precipitation: cycloneIntensity * 50 + (Math.random() - 0.5) * 20, // mm/hour
        visibility: 10 - (cycloneIntensity * 8), // km
        cloudCover: 30 + (cycloneIntensity * 60), // %
        // Advanced Parameters for ML
        cloudTopTemp: -40 - (cycloneIntensity * 30), // °C (colder = higher clouds)
        vorticity: cycloneIntensity * 0.001, // s⁻¹
        divergence: -cycloneIntensity * 0.0005, // s⁻¹
        convectiveActivity: cycloneIntensity * 0.8, // 0-1 scale

        // Risk Assessment
        cycloneFormationProbability: Math.min(0.95, cycloneIntensity * 1.2),
        intensificationRate: cycloneIntensity > 0.6 ? (cycloneIntensity - 0.6) * 2.5 : 0,
        landfallETA: cycloneIntensity > 0.7 ? Math.round(48 - cycloneIntensity * 24) : null, // hours
        category: getCycloneCategory(20 + (cycloneIntensity * 150)),

        // Data Quality Indicators
        dataReliability: 0.85 + Math.random() * 0.15, // 0-1 scale
        lastCalibration: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 70 + Math.random() * 30, // %
        signalStrength: -50 + Math.random() * 20, // dBm
    };
}

function getCycloneCategory(windSpeed: number): number {
    if (windSpeed < 62) return 0; // Depression
    if (windSpeed < 88) return 1; // Cyclonic Storm
    if (windSpeed < 118) return 2; // Severe Cyclonic Storm
    if (windSpeed < 166) return 3; // Very Severe Cyclonic Storm
    if (windSpeed < 221) return 4; // Extremely Severe Cyclonic Storm
    return 5; // Super Cyclonic Storm
}

export const cycloneRouter = createTRPCRouter({
    // Get real-time cyclone data
    getLiveData: publicProcedure
        .input(z.object({
            region: z.string().optional().default("Gujarat Coast"),
            lat: z.number().optional().default(22.2587),
            lng: z.number().optional().default(71.1924),
        }))
        .query(async ({ input }) => {
            return generateCycloneData({ lat: input.lat, lng: input.lng });
        }),

    // Get historical data for ML training
    getHistoricalData: publicProcedure
        .input(z.object({
            days: z.number().min(1).max(365).default(30),
            region: z.string().optional().default("Gujarat Coast"),
            lat: z.number().optional().default(22.2587),
            lng: z.number().optional().default(71.1924),
        }))
        .query(async ({ input }) => {
            const historicalData = [];
            const now = Date.now();

            // Generate data points every 6 hours for the specified days
            for (let i = 0; i < input.days * 4; i++) {
                const timestamp = new Date(now - (i * 6 * 60 * 60 * 1000)); // 6 hours apart
                const data = generateCycloneData({ lat: input.lat, lng: input.lng });
                data.timestamp = timestamp.toISOString();
                historicalData.push(data);
            }

            return historicalData.reverse(); // Chronological order
        }),

    // Get multiple sensor stations data
    getMultiStationData: publicProcedure
        .input(z.object({
            stations: z.array(z.object({
                id: z.string(),
                name: z.string(),
                lat: z.number(),
                lng: z.number(),
            })).optional().default([
                { id: "GUJ01", name: "Porbandar Station", lat: 21.6417, lng: 69.6293 },
                { id: "GUJ02", name: "Dwarka Station", lat: 22.2394, lng: 68.9678 },
                { id: "GUJ03", name: "Jamnagar Station", lat: 22.4707, lng: 70.0577 },
                { id: "GUJ04", name: "Bhavnagar Station", lat: 21.7645, lng: 72.1519 },
            ])
        }))
        .query(async ({ input }) => {
            return input.stations.map(station => ({
                station,
                data: generateCycloneData({ lat: station.lat, lng: station.lng })
            }));
        }),

    // Get cyclone tracking data (simulated movement)
    getCycloneTrack: publicProcedure
        .input(z.object({
            cycloneId: z.string().optional().default("CYCLONE_2024_01"),
            hoursBack: z.number().min(1).max(72).default(24),
        }))
        .query(async ({ input }) => {
            const trackPoints = [];
            const now = Date.now();

            // Simulate cyclone movement (northeast direction)
            const startLat = 20.0;
            const startLng = 68.0;

            for (let i = 0; i < input.hoursBack; i++) {
                const timestamp = new Date(now - (i * 60 * 60 * 1000)); // 1 hour apart
                const progress = (input.hoursBack - i) / input.hoursBack;

                trackPoints.push({
                    timestamp: timestamp.toISOString(),
                    position: {
                        latitude: startLat + (progress * 3), // Moving northeast
                        longitude: startLng + (progress * 2),
                    },
                    intensity: generateCycloneData({ lat: startLat, lng: startLng }),
                    forecast: {
                        nextPosition: {
                            latitude: startLat + (progress * 3) + 0.5,
                            longitude: startLng + (progress * 2) + 0.3,
                        },
                        confidence: 0.85 - (progress * 0.2), // Confidence decreases with time
                    }
                });
            }

            return {
                cycloneId: input.cycloneId,
                name: "Cyclone Demo",
                status: "ACTIVE",
                track: trackPoints.reverse()
            };
        }),

    // Generate CSV data for ML training
    generateCSVData: publicProcedure
        .input(z.object({
            count: z.number().min(100).max(10000).default(1000),
            includeHeaders: z.boolean().default(true),
            timeInterval: z.number().min(1).max(60).default(30), // minutes between data points
        }))
        .query(async ({ input }) => {
            const csvData = [];
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

            // Generate data points
            for (let i = 0; i < input.count; i++) {
                // Create time series with specified intervals
                const timestamp = new Date(Date.now() - (i * input.timeInterval * 60 * 1000));

                // Rotate through different locations for variety
                const location = baseLocations[i % baseLocations.length];

                // Add small random variation to location
                const lat = location.lat + (Math.random() - 0.5) * 0.2;
                const lng = location.lng + (Math.random() - 0.5) * 0.2;

                const data = generateCycloneData({ lat, lng });

                // Create flattened row for CSV
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
            }

            // Convert to CSV string
            let csvString = '';

            if (input.includeHeaders) {
                csvString += headers.join(',') + '\n';
            }

            csvData.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header as keyof typeof row];
                    // Handle null/undefined values and escape strings with commas
                    if (value === null || value === undefined || value === '') return '';
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`;
                    }
                    return value;
                });
                csvString += values.join(',') + '\n';
            });

            return {
                success: true,
                dataPoints: csvData.length,
                headers: headers,
                csvContent: csvString,
                filename: `cyclone_training_data_${Date.now()}.csv`,
                size: csvString.length,
                sizeKB: (csvString.length / 1024).toFixed(2),
                generatedAt: new Date().toISOString(),
                timeRange: {
                    start: new Date(Date.now() - ((input.count - 1) * input.timeInterval * 60 * 1000)).toISOString(),
                    end: new Date().toISOString(),
                    intervalMinutes: input.timeInterval
                },
                locations: baseLocations.map(loc => loc.region)
            };
        })
});