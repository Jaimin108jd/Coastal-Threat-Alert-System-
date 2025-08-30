import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';

// Generate realistic pollution monitoring data
function generatePollutionData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate pollution levels (0-1 scale where 1 is heavily polluted)
    const pollutionIntensity = Math.random();
    const timeVariation = Math.sin(Date.now() / 12000) * 0.2; // Daily variation

    return {
        timestamp: now.toISOString(),
        location: {
            latitude: baseLocation.lat + (Math.random() - 0.5) * 0.05,
            longitude: baseLocation.lng + (Math.random() - 0.5) * 0.05,
            region: "Gujarat Coast",
            depth: Math.random() * 10, // meters underwater for water sampling
        },

        // Water Quality Parameters
        waterQuality: {
            pH: 7.0 + (pollutionIntensity * 2) + timeVariation, // 7.0-9.0+ (higher = more alkaline pollution)
            dissolvedOxygen: 8.0 - (pollutionIntensity * 4), // mg/L (lower = more polluted)
            turbidity: 2 + (pollutionIntensity * 30), // NTU (higher = more polluted)
            salinity: 35 + (Math.random() - 0.5) * 2, // psu
            temperature: 25 + (pollutionIntensity * 8) + timeVariation, // °C (thermal pollution)
            conductivity: 50000 + (pollutionIntensity * 5000), // μS/cm
        },

        // Chemical Pollutants
        chemicals: {
            nitrateLevel: pollutionIntensity * 15, // mg/L (agricultural runoff)
            phosphateLevel: pollutionIntensity * 5, // mg/L (fertilizer pollution)
            ammonia: pollutionIntensity * 3, // mg/L (sewage pollution)
            heavyMetals: {
                lead: pollutionIntensity * 0.05, // mg/L
                mercury: pollutionIntensity * 0.002, // mg/L
                cadmium: pollutionIntensity * 0.01, // mg/L
                chromium: pollutionIntensity * 0.1, // mg/L
            },
            hydrocarbons: pollutionIntensity * 10, // μg/L (oil pollution)
            pesticides: pollutionIntensity * 2, // μg/L
        },

        // Biological Indicators
        biological: {
            coliformCount: Math.floor(pollutionIntensity * 10000), // CFU/100ml (sewage indicator)
            algaeConcentration: pollutionIntensity * 50, // mg/L chlorophyll-a
            biodiversityIndex: 1.0 - (pollutionIntensity * 0.8), // 0-1 (higher = healthier)
            fishMortality: pollutionIntensity > 0.7 ? pollutionIntensity * 100 : 0, // fish per km²
        },

        // Physical Pollution
        physical: {
            plasticParticles: Math.floor(pollutionIntensity * 500), // particles/m³
            oilSlickPresence: pollutionIntensity > 0.6,
            visibleDebris: pollutionIntensity > 0.4,
            foamPresence: pollutionIntensity > 0.5,
            colorAnomalies: pollutionIntensity > 0.3,
        },

        // Source Identification
        sources: {
            industrialRunoff: pollutionIntensity > 0.6 ? pollutionIntensity : 0,
            agriculturalRunoff: pollutionIntensity > 0.4 ? pollutionIntensity * 0.8 : 0,
            sewageDischarge: pollutionIntensity > 0.5 ? pollutionIntensity * 0.9 : 0,
            stormwaterRunoff: pollutionIntensity > 0.3 ? pollutionIntensity * 0.7 : 0,
            shippingActivity: pollutionIntensity > 0.4 ? pollutionIntensity * 0.6 : 0,
            illegalDumping: pollutionIntensity > 0.8 ? 1 : 0,
        },

        // Risk Assessment
        riskFactors: {
            overallPollutionLevel: getPollutionLevel(pollutionIntensity),
            humanHealthRisk: pollutionIntensity > 0.6 ? "HIGH" : pollutionIntensity > 0.3 ? "MODERATE" : "LOW",
            marineLifeRisk: pollutionIntensity > 0.5 ? "HIGH" : pollutionIntensity > 0.25 ? "MODERATE" : "LOW",
            economicImpact: pollutionIntensity > 0.7 ? "SEVERE" : pollutionIntensity > 0.4 ? "MODERATE" : "MINIMAL",
            cleanupRequired: pollutionIntensity > 0.5,
            alertAuthorities: pollutionIntensity > 0.7,
        },

        // Environmental Impact
        impact: {
            affectedArea: pollutionIntensity * 1000, // square kilometers
            ecosystemDamage: pollutionIntensity * 0.8, // 0-1 scale
            recoveryTime: pollutionIntensity > 0.7 ? Math.round(pollutionIntensity * 24) : 0, // months
            carbonFootprint: pollutionIntensity * 500, // tons CO2 equivalent
        },

        // Sensor Health
        sensorHealth: {
            dataReliability: 0.88 + Math.random() * 0.12,
            lastCalibration: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
            batteryLevel: 70 + Math.random() * 30,
            signalStrength: -48 + Math.random() * 18,
        }
    };
}

function getPollutionLevel(intensity: number): string {
    if (intensity < 0.2) return "CLEAN";
    if (intensity < 0.4) return "SLIGHTLY_POLLUTED";
    if (intensity < 0.6) return "MODERATELY_POLLUTED";
    if (intensity < 0.8) return "HEAVILY_POLLUTED";
    return "CRITICALLY_POLLUTED";
}

export const pollutionRouter = createTRPCRouter({
    // Get real-time pollution data
    getLiveData: publicProcedure
        .input(z.object({
            region: z.string().optional().default("Gujarat Coast"),
            lat: z.number().optional().default(22.2587),
            lng: z.number().optional().default(71.1924),
        }))
        .query(async ({ input }) => {
            return generatePollutionData({ lat: input.lat, lng: input.lng });
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

            // Generate data points every 4 hours for pollution monitoring
            for (let i = 0; i < input.days * 6; i++) {
                const timestamp = new Date(now - (i * 4 * 60 * 60 * 1000)); // 4 hours apart
                const data = generatePollutionData({ lat: input.lat, lng: input.lng });
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
            timeInterval: z.number().min(1).max(60).default(20), // minutes between data points
        }))
        .query(async ({ input }) => {
            const csvData = [];
            const headers = [
                'timestamp', 'latitude', 'longitude', 'region', 'depth',
                'pH', 'dissolved_oxygen', 'turbidity', 'salinity', 'water_temperature', 'conductivity',
                'nitrate_level', 'phosphate_level', 'ammonia', 'lead', 'mercury', 'cadmium', 'chromium',
                'hydrocarbons', 'pesticides', 'coliform_count', 'algae_concentration', 'biodiversity_index',
                'fish_mortality', 'plastic_particles', 'oil_slick_presence', 'visible_debris', 'foam_presence',
                'color_anomalies', 'industrial_runoff', 'agricultural_runoff', 'sewage_discharge',
                'stormwater_runoff', 'shipping_activity', 'illegal_dumping', 'pollution_level',
                'human_health_risk', 'marine_life_risk', 'economic_impact', 'cleanup_required',
                'alert_authorities', 'affected_area', 'ecosystem_damage', 'recovery_time',
                'carbon_footprint', 'data_reliability', 'battery_level', 'signal_strength'
            ];

            const baseLocations = [
                { lat: 22.2587, lng: 71.1924, region: "Gujarat Coast" },
                { lat: 21.6417, lng: 69.6293, region: "Porbandar" },
                { lat: 22.2394, lng: 68.9678, region: "Dwarka" },
                { lat: 22.4707, lng: 70.0577, region: "Jamnagar" },
                { lat: 21.7645, lng: 72.1519, region: "Bhavnagar" },
                { lat: 20.9217, lng: 70.2034, region: "Veraval Industrial Zone" },
                { lat: 23.0225, lng: 72.5714, region: "Ahmedabad Outfall" }
            ];

            for (let i = 0; i < input.count; i++) {
                const timestamp = new Date(Date.now() - (i * input.timeInterval * 60 * 1000));
                const location = baseLocations[i % baseLocations.length];
                const lat = location.lat + (Math.random() - 0.5) * 0.1;
                const lng = location.lng + (Math.random() - 0.5) * 0.1;
                const data = generatePollutionData({ lat, lng });

                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    depth: data.location.depth.toFixed(2),
                    pH: data.waterQuality.pH.toFixed(2),
                    dissolved_oxygen: data.waterQuality.dissolvedOxygen.toFixed(2),
                    turbidity: data.waterQuality.turbidity.toFixed(2),
                    salinity: data.waterQuality.salinity.toFixed(2),
                    water_temperature: data.waterQuality.temperature.toFixed(2),
                    conductivity: data.waterQuality.conductivity.toFixed(1),
                    nitrate_level: data.chemicals.nitrateLevel.toFixed(3),
                    phosphate_level: data.chemicals.phosphateLevel.toFixed(3),
                    ammonia: data.chemicals.ammonia.toFixed(3),
                    lead: data.chemicals.heavyMetals.lead.toFixed(4),
                    mercury: data.chemicals.heavyMetals.mercury.toFixed(5),
                    cadmium: data.chemicals.heavyMetals.cadmium.toFixed(4),
                    chromium: data.chemicals.heavyMetals.chromium.toFixed(4),
                    hydrocarbons: data.chemicals.hydrocarbons.toFixed(3),
                    pesticides: data.chemicals.pesticides.toFixed(3),
                    coliform_count: data.biological.coliformCount,
                    algae_concentration: data.biological.algaeConcentration.toFixed(2),
                    biodiversity_index: data.biological.biodiversityIndex.toFixed(3),
                    fish_mortality: data.biological.fishMortality.toFixed(1),
                    plastic_particles: data.physical.plasticParticles,
                    oil_slick_presence: data.physical.oilSlickPresence,
                    visible_debris: data.physical.visibleDebris,
                    foam_presence: data.physical.foamPresence,
                    color_anomalies: data.physical.colorAnomalies,
                    industrial_runoff: data.sources.industrialRunoff.toFixed(3),
                    agricultural_runoff: data.sources.agriculturalRunoff.toFixed(3),
                    sewage_discharge: data.sources.sewageDischarge.toFixed(3),
                    stormwater_runoff: data.sources.stormwaterRunoff.toFixed(3),
                    shipping_activity: data.sources.shippingActivity.toFixed(3),
                    illegal_dumping: data.sources.illegalDumping,
                    pollution_level: data.riskFactors.overallPollutionLevel,
                    human_health_risk: data.riskFactors.humanHealthRisk,
                    marine_life_risk: data.riskFactors.marineLifeRisk,
                    economic_impact: data.riskFactors.economicImpact,
                    cleanup_required: data.riskFactors.cleanupRequired,
                    alert_authorities: data.riskFactors.alertAuthorities,
                    affected_area: data.impact.affectedArea.toFixed(2),
                    ecosystem_damage: data.impact.ecosystemDamage.toFixed(3),
                    recovery_time: data.impact.recoveryTime,
                    carbon_footprint: data.impact.carbonFootprint.toFixed(2),
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
                filename: `pollution_monitoring_data_${Date.now()}.csv`,
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
