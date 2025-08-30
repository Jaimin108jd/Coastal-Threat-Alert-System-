import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';

// Generate realistic storm surge sensor data
function generateStormSurgeData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate storm surge intensity (0-1 scale)
    const surgeIntensity = Math.random();
    const tidalCycle = Math.sin(Date.now() / 8000) * 0.4; // Tidal variation

    return {
        timestamp: now.toISOString(),
        location: {
            latitude: baseLocation.lat + (Math.random() - 0.5) * 0.05,
            longitude: baseLocation.lng + (Math.random() - 0.5) * 0.05,
            region: "Gujarat Coast",
        },

        // Water Level Measurements
        waterLevel: {
            currentLevel: 2.0 + (surgeIntensity * 4) + tidalCycle, // 2-6m above mean sea level
            predictedLevel: 2.2 + (surgeIntensity * 3.8),
            anomaly: surgeIntensity * 3.5, // Deviation from normal
            rateOfRise: surgeIntensity > 0.5 ? (surgeIntensity * 0.8) : 0, // m/hour
            maxRecorded: 3.0 + (surgeIntensity * 5), // Historical max for comparison
        },

        // Wave Conditions
        waves: {
            significantHeight: 1.5 + (surgeIntensity * 6), // meters
            maxHeight: 2.0 + (surgeIntensity * 8),
            period: 8 + (surgeIntensity * 4), // seconds
            direction: 180 + (Math.random() - 0.5) * 45, // degrees
            breakingIntensity: surgeIntensity * 1.0, // 0-1 scale
        },

        // Meteorological Drivers
        meteorology: {
            windSpeed: 15 + (surgeIntensity * 80), // km/h
            windDirection: 160 + (Math.random() - 0.5) * 60,
            atmosphericPressure: 1010 - (surgeIntensity * 25), // hPa (lower = stronger surge)
            stormDistance: 500 - (surgeIntensity * 400), // km from coast
        },

        // Coastal Impact Assessment
        impact: {
            inundationDepth: surgeIntensity > 0.3 ? (surgeIntensity * 2.5) : 0, // meters inland flooding
            inundationExtent: surgeIntensity > 0.3 ? (surgeIntensity * 1000) : 0, // meters inland
            erosionRate: surgeIntensity * 0.5, // m/hour of shoreline retreat
            infrastructureRisk: surgeIntensity > 0.6 ? "HIGH" : surgeIntensity > 0.3 ? "MODERATE" : "LOW",
        },

        // Risk Assessment
        riskFactors: {
            surgeLevel: getSurgeCategory(2.0 + (surgeIntensity * 4)),
            floodingProbability: Math.min(0.95, surgeIntensity * 1.3),
            evacuationRecommended: surgeIntensity > 0.7,
            timeToImpact: surgeIntensity > 0.5 ? Math.round(8 - (surgeIntensity * 6)) : null, // hours
        },

        // Sensor Health
        sensorHealth: {
            dataReliability: 0.90 + Math.random() * 0.10,
            lastMaintenance: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            batteryLevel: 75 + Math.random() * 25,
            signalStrength: -45 + Math.random() * 15,
        }
    };
}

function getSurgeCategory(waterLevel: number): string {
    if (waterLevel < 2.5) return "MINOR";
    if (waterLevel < 3.5) return "MODERATE";
    if (waterLevel < 4.5) return "MAJOR";
    if (waterLevel < 5.5) return "EXTREME";
    return "CATASTROPHIC";
}

export const stormSurgeRouter = createTRPCRouter({
    // Get real-time storm surge data
    getLiveData: publicProcedure
        .input(z.object({
            region: z.string().optional().default("Gujarat Coast"),
            lat: z.number().optional().default(22.2587),
            lng: z.number().optional().default(71.1924),
        }))
        .query(async ({ input }) => {
            return generateStormSurgeData({ lat: input.lat, lng: input.lng });
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

            // Generate data points every 1 hour for storm surge monitoring
            for (let i = 0; i < input.days * 24; i++) {
                const timestamp = new Date(now - (i * 60 * 60 * 1000)); // 1 hour apart
                const data = generateStormSurgeData({ lat: input.lat, lng: input.lng });
                data.timestamp = timestamp.toISOString();
                historicalData.push(data);
            }

            return historicalData.reverse();
        }),

    // Generate CSV data for ML training
    generateCSVData: publicProcedure
        .input(z.object({
            count: z.number().min(100).max(10000).default(1000),
            includeHeaders: z.boolean().default(true),
            timeInterval: z.number().min(1).max(60).default(15), // minutes between data points
        }))
        .query(async ({ input }) => {
            const csvData = [];
            const headers = [
                'timestamp', 'latitude', 'longitude', 'region',
                'current_water_level', 'predicted_level', 'water_anomaly', 'rate_of_rise',
                'wave_height', 'max_wave_height', 'wave_period', 'wave_direction',
                'wind_speed', 'wind_direction', 'atmospheric_pressure', 'storm_distance',
                'inundation_depth', 'inundation_extent', 'erosion_rate', 'infrastructure_risk',
                'surge_category', 'flooding_probability', 'evacuation_recommended', 'time_to_impact',
                'data_reliability', 'battery_level', 'signal_strength'
            ];

            const baseLocations = [
                { lat: 22.2587, lng: 71.1924, region: "Gujarat Coast" },
                { lat: 21.6417, lng: 69.6293, region: "Porbandar" },
                { lat: 22.2394, lng: 68.9678, region: "Dwarka" },
                { lat: 22.4707, lng: 70.0577, region: "Jamnagar" },
                { lat: 21.7645, lng: 72.1519, region: "Bhavnagar" },
            ];

            for (let i = 0; i < input.count; i++) {
                const timestamp = new Date(Date.now() - (i * input.timeInterval * 60 * 1000));
                const location = baseLocations[i % baseLocations.length];
                const lat = location.lat + (Math.random() - 0.5) * 0.1;
                const lng = location.lng + (Math.random() - 0.5) * 0.1;
                const data = generateStormSurgeData({ lat, lng });

                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    current_water_level: data.waterLevel.currentLevel.toFixed(2),
                    predicted_level: data.waterLevel.predictedLevel.toFixed(2),
                    water_anomaly: data.waterLevel.anomaly.toFixed(2),
                    rate_of_rise: data.waterLevel.rateOfRise.toFixed(3),
                    wave_height: data.waves.significantHeight.toFixed(2),
                    max_wave_height: data.waves.maxHeight.toFixed(2),
                    wave_period: data.waves.period.toFixed(1),
                    wave_direction: data.waves.direction.toFixed(1),
                    wind_speed: data.meteorology.windSpeed.toFixed(1),
                    wind_direction: data.meteorology.windDirection.toFixed(1),
                    atmospheric_pressure: data.meteorology.atmosphericPressure.toFixed(2),
                    storm_distance: data.meteorology.stormDistance.toFixed(1),
                    inundation_depth: data.impact.inundationDepth.toFixed(2),
                    inundation_extent: data.impact.inundationExtent.toFixed(1),
                    erosion_rate: data.impact.erosionRate.toFixed(3),
                    infrastructure_risk: data.impact.infrastructureRisk,
                    surge_category: data.riskFactors.surgeLevel,
                    flooding_probability: data.riskFactors.floodingProbability.toFixed(3),
                    evacuation_recommended: data.riskFactors.evacuationRecommended,
                    time_to_impact: data.riskFactors.timeToImpact || '',
                    data_reliability: data.sensorHealth.dataReliability.toFixed(3),
                    battery_level: data.sensorHealth.batteryLevel.toFixed(1),
                    signal_strength: data.sensorHealth.signalStrength.toFixed(1)
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
                filename: `storm_surge_data_${Date.now()}.csv`,
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
