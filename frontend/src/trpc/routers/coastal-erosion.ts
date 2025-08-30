import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';

// Generate realistic coastal erosion monitoring data
function generateCoastalErosionData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate erosion intensity (0-1 scale where 1 is severe erosion)
    const erosionIntensity = Math.random();
    const seasonalFactor = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.3; // Seasonal variation

    return {
        timestamp: now.toISOString(),
        location: {
            latitude: baseLocation.lat + (Math.random() - 0.5) * 0.02,
            longitude: baseLocation.lng + (Math.random() - 0.5) * 0.02,
            region: "Gujarat Coast",
            beachSegment: `Segment_${Math.floor(Math.random() * 50) + 1}`,
        },

        // Shoreline Changes
        shoreline: {
            currentPosition: 100 - (erosionIntensity * 25), // meters from reference point
            erosionRate: erosionIntensity * 2.5 + seasonalFactor, // meters/year
            accretionRate: Math.max(0, (1 - erosionIntensity) * 0.8), // meters/year (sediment buildup)
            shorelineRetreat: erosionIntensity * 15, // total meters retreated
            beachWidth: 50 - (erosionIntensity * 30), // current beach width in meters
            durationOfChange: erosionIntensity * 10 + 1, // years of observed change
        },

        // Sediment Analysis
        sediment: {
            grainSize: 0.2 + (erosionIntensity * 0.3), // mm (coarser = more erosion resistant)
            sedimentVolume: 1000 - (erosionIntensity * 800), // cubic meters per km
            suspendedSediment: erosionIntensity * 500, // mg/L in water
            bedloadTransport: erosionIntensity * 100, // kg/m/day
            sourceAvailability: 1.0 - (erosionIntensity * 0.7), // 0-1 scale
        },

        // Wave and Current Impact
        hydrodynamics: {
            waveEnergy: 50 + (erosionIntensity * 200), // kW/m
            waveHeight: 1.0 + (erosionIntensity * 3), // meters
            wavePeriod: 8 + (erosionIntensity * 4), // seconds
            waveAngle: 45 + (Math.random() - 0.5) * 90, // degrees to shore normal
            tidalRange: 2.5 + (Math.random() - 0.5) * 1.5, // meters
            currentVelocity: 0.2 + (erosionIntensity * 0.8), // m/s alongshore
        },

        // Coastal Protection
        protection: {
            naturalBarriers: {
                vegetation: 1.0 - (erosionIntensity * 0.6), // 0-1 coverage
                reefs: Math.random() > 0.7 ? 1 : 0, // presence/absence
                duneHeight: 3 + ((1 - erosionIntensity) * 4), // meters
                mangroveCoverage: (1 - erosionIntensity) * 0.8, // 0-1 scale
            },
            artificialStructures: {
                seawalls: Math.random() > 0.6 ? 1 : 0,
                breakwaters: Math.random() > 0.8 ? 1 : 0,
                groynes: Math.random() > 0.7 ? 1 : 0,
                revetments: Math.random() > 0.75 ? 1 : 0,
                effectivenessRating: 1.0 - (erosionIntensity * 0.4), // 0-1 scale
            }
        },

        // Environmental Drivers
        drivers: {
            stormFrequency: erosionIntensity * 12, // storms per year
            seaLevelRise: 0.3 + (erosionIntensity * 0.5), // cm/year
            climateChange: erosionIntensity * 0.8, // 0-1 impact scale
            humanActivity: erosionIntensity * 0.9, // 0-1 impact scale
            landUseChange: erosionIntensity * 0.7, // 0-1 impact scale
        },

        // Impact Assessment
        impact: {
            infrastructureAtRisk: getInfrastructureRisk(erosionIntensity),
            economicLoss: erosionIntensity * 1000000, // USD per year
            habitatLoss: erosionIntensity * 50, // hectares
            culturalSitesAtRisk: Math.floor(erosionIntensity * 5),
            populationAffected: Math.floor(erosionIntensity * 10000),
            propertyValue: 5000000 - (erosionIntensity * 3000000), // USD
        },

        // Risk Assessment
        riskFactors: {
            erosionSeverity: getErosionSeverity(erosionIntensity),
            urgencyLevel: erosionIntensity > 0.7 ? "IMMEDIATE" : erosionIntensity > 0.4 ? "HIGH" : "MODERATE",
            interventionRequired: erosionIntensity > 0.6,
            timeToAction: erosionIntensity > 0.8 ? 1 : erosionIntensity > 0.6 ? 6 : 24, // months
            recoveryPossible: erosionIntensity < 0.8,
            monitoringFrequency: erosionIntensity > 0.6 ? "WEEKLY" : "MONTHLY",
        },

        // Future Projections
        projections: {
            erosionIn10Years: erosionIntensity * 25, // meters
            seaLevelRiseImpact: erosionIntensity * 1.2, // multiplier effect
            stormSurgeVulnerability: erosionIntensity * 0.9, // 0-1 scale
            adaptationCost: erosionIntensity * 5000000, // USD
            noActionConsequence: erosionIntensity * 0.8, // 0-1 severity scale
        },

        // Sensor Health
        sensorHealth: {
            dataReliability: 0.89 + Math.random() * 0.11,
            lastSurvey: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            gpsAccuracy: 0.5 + Math.random() * 1.5, // meters
            imageQuality: 0.85 + Math.random() * 0.15, // 0-1 scale
            weatherConditions: ["CLEAR", "PARTLY_CLOUDY", "OVERCAST", "WINDY"][Math.floor(Math.random() * 4)]
        }
    };
}

function getInfrastructureRisk(intensity: number): string {
    if (intensity < 0.3) return "MINIMAL";
    if (intensity < 0.5) return "LOW";
    if (intensity < 0.7) return "MODERATE";
    if (intensity < 0.9) return "HIGH";
    return "CRITICAL";
}

function getErosionSeverity(intensity: number): string {
    if (intensity < 0.2) return "STABLE";
    if (intensity < 0.4) return "SLIGHT_EROSION";
    if (intensity < 0.6) return "MODERATE_EROSION";
    if (intensity < 0.8) return "SEVERE_EROSION";
    return "CATASTROPHIC_EROSION";
}

export const coastalErosionRouter = createTRPCRouter({
    // Get real-time coastal erosion data
    getLiveData: publicProcedure
        .input(z.object({
            region: z.string().optional().default("Gujarat Coast"),
            lat: z.number().optional().default(22.2587),
            lng: z.number().optional().default(71.1924),
        }))
        .query(async ({ input }) => {
            return generateCoastalErosionData({ lat: input.lat, lng: input.lng });
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

            // Generate data points every 12 hours for coastal erosion (slower process)
            for (let i = 0; i < input.days * 2; i++) {
                const timestamp = new Date(now - (i * 12 * 60 * 60 * 1000)); // 12 hours apart
                const data = generateCoastalErosionData({ lat: input.lat, lng: input.lng });
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
            timeInterval: z.number().min(1).max(60).default(45), // minutes between data points
        }))
        .query(async ({ input }) => {
            const csvData = [];
            const headers = [
                'timestamp', 'latitude', 'longitude', 'region', 'beach_segment',
                'current_position', 'erosion_rate', 'accretion_rate', 'shoreline_retreat',
                'beach_width', 'duration_of_change', 'grain_size', 'sediment_volume',
                'suspended_sediment', 'bedload_transport', 'source_availability',
                'wave_energy', 'wave_height', 'wave_period', 'wave_angle', 'tidal_range',
                'current_velocity', 'vegetation_coverage', 'reef_presence', 'dune_height',
                'mangrove_coverage', 'seawalls', 'breakwaters', 'groynes', 'revetments',
                'protection_effectiveness', 'storm_frequency', 'sea_level_rise',
                'climate_change_impact', 'human_activity_impact', 'land_use_change',
                'infrastructure_risk', 'economic_loss', 'habitat_loss', 'cultural_sites_at_risk',
                'population_affected', 'property_value', 'erosion_severity', 'urgency_level',
                'intervention_required', 'time_to_action', 'recovery_possible',
                'monitoring_frequency', 'erosion_in_10_years', 'sea_level_rise_impact',
                'storm_surge_vulnerability', 'adaptation_cost', 'no_action_consequence',
                'data_reliability', 'gps_accuracy', 'image_quality', 'weather_conditions'
            ];

            const baseLocations = [
                { lat: 22.2587, lng: 71.1924, region: "Gujarat Coast Central" },
                { lat: 21.6417, lng: 69.6293, region: "Porbandar Beaches" },
                { lat: 22.2394, lng: 68.9678, region: "Dwarka Peninsula" },
                { lat: 22.4707, lng: 70.0577, region: "Jamnagar Shoreline" },
                { lat: 21.7645, lng: 72.1519, region: "Bhavnagar Coast" },
                { lat: 20.9217, lng: 70.2034, region: "Veraval Beaches" },
                { lat: 23.0225, lng: 72.5714, region: "Ahmedabad Coastal Zone" }
            ];

            for (let i = 0; i < input.count; i++) {
                const timestamp = new Date(Date.now() - (i * input.timeInterval * 60 * 1000));
                const location = baseLocations[i % baseLocations.length];
                const lat = location.lat + (Math.random() - 0.5) * 0.05;
                const lng = location.lng + (Math.random() - 0.5) * 0.05;
                const data = generateCoastalErosionData({ lat, lng });

                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    beach_segment: data.location.beachSegment,
                    current_position: data.shoreline.currentPosition.toFixed(2),
                    erosion_rate: data.shoreline.erosionRate.toFixed(3),
                    accretion_rate: data.shoreline.accretionRate.toFixed(3),
                    shoreline_retreat: data.shoreline.shorelineRetreat.toFixed(2),
                    beach_width: data.shoreline.beachWidth.toFixed(2),
                    duration_of_change: data.shoreline.durationOfChange.toFixed(1),
                    grain_size: data.sediment.grainSize.toFixed(3),
                    sediment_volume: data.sediment.sedimentVolume.toFixed(2),
                    suspended_sediment: data.sediment.suspendedSediment.toFixed(2),
                    bedload_transport: data.sediment.bedloadTransport.toFixed(2),
                    source_availability: data.sediment.sourceAvailability.toFixed(3),
                    wave_energy: data.hydrodynamics.waveEnergy.toFixed(2),
                    wave_height: data.hydrodynamics.waveHeight.toFixed(2),
                    wave_period: data.hydrodynamics.wavePeriod.toFixed(1),
                    wave_angle: data.hydrodynamics.waveAngle.toFixed(1),
                    tidal_range: data.hydrodynamics.tidalRange.toFixed(2),
                    current_velocity: data.hydrodynamics.currentVelocity.toFixed(3),
                    vegetation_coverage: data.protection.naturalBarriers.vegetation.toFixed(3),
                    reef_presence: data.protection.naturalBarriers.reefs,
                    dune_height: data.protection.naturalBarriers.duneHeight.toFixed(2),
                    mangrove_coverage: data.protection.naturalBarriers.mangroveCoverage.toFixed(3),
                    seawalls: data.protection.artificialStructures.seawalls,
                    breakwaters: data.protection.artificialStructures.breakwaters,
                    groynes: data.protection.artificialStructures.groynes,
                    revetments: data.protection.artificialStructures.revetments,
                    protection_effectiveness: data.protection.artificialStructures.effectivenessRating.toFixed(3),
                    storm_frequency: data.drivers.stormFrequency.toFixed(1),
                    sea_level_rise: data.drivers.seaLevelRise.toFixed(3),
                    climate_change_impact: data.drivers.climateChange.toFixed(3),
                    human_activity_impact: data.drivers.humanActivity.toFixed(3),
                    land_use_change: data.drivers.landUseChange.toFixed(3),
                    infrastructure_risk: data.impact.infrastructureAtRisk,
                    economic_loss: data.impact.economicLoss.toFixed(2),
                    habitat_loss: data.impact.habitatLoss.toFixed(2),
                    cultural_sites_at_risk: data.impact.culturalSitesAtRisk,
                    population_affected: data.impact.populationAffected,
                    property_value: data.impact.propertyValue.toFixed(2),
                    erosion_severity: data.riskFactors.erosionSeverity,
                    urgency_level: data.riskFactors.urgencyLevel,
                    intervention_required: data.riskFactors.interventionRequired,
                    time_to_action: data.riskFactors.timeToAction,
                    recovery_possible: data.riskFactors.recoveryPossible,
                    monitoring_frequency: data.riskFactors.monitoringFrequency,
                    erosion_in_10_years: data.projections.erosionIn10Years.toFixed(2),
                    sea_level_rise_impact: data.projections.seaLevelRiseImpact.toFixed(3),
                    storm_surge_vulnerability: data.projections.stormSurgeVulnerability.toFixed(3),
                    adaptation_cost: data.projections.adaptationCost.toFixed(2),
                    no_action_consequence: data.projections.noActionConsequence.toFixed(3),
                    data_reliability: data.sensorHealth.dataReliability.toFixed(3),
                    gps_accuracy: data.sensorHealth.gpsAccuracy.toFixed(2),
                    image_quality: data.sensorHealth.imageQuality.toFixed(3),
                    weather_conditions: data.sensorHealth.weatherConditions
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
                filename: `coastal_erosion_data_${Date.now()}.csv`,
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
