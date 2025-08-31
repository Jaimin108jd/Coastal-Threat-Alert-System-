import { NextRequest, NextResponse } from 'next/server';

// Generate realistic coastal erosion monitoring data (same function as in tRPC)
function generateCoastalErosionData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate coastal erosion processes
    const erosionIntensity = Math.random(); // 0-1 scale
    const seasonalEffect = Math.sin(Date.now() / 20000) * 0.3; // Seasonal variation
    const stormInfluence = Math.random() > 0.8 ? Math.random() * 0.5 : 0; // Occasional storm events

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.02,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.02,
        region: "Gujarat Coast",
        shorelinePosition: 100 - (erosionIntensity * 50) + seasonalEffect,
        erosionRate: erosionIntensity * 2.5 + stormInfluence + (Math.random() - 0.5) * 0.5,
        accretionRate: (1 - erosionIntensity) * 1.2 + (Math.random() - 0.5) * 0.3,
        netShorelineChange: (erosionIntensity * -2.5) + ((1 - erosionIntensity) * 1.2) + seasonalEffect,
        beachWidth: 50 - (erosionIntensity * 30) + seasonalEffect * 5,
        beachVolume: 1000 - (erosionIntensity * 600) + seasonalEffect * 100,
        duneHeight: 8 - (erosionIntensity * 4) + (Math.random() - 0.5) * 1,
        duneWidth: 25 - (erosionIntensity * 15) + (Math.random() - 0.5) * 3,
        cliffRetreatRate: erosionIntensity * 0.8 + stormInfluence,
        rockStrength: 50 + (Math.random() - 0.5) * 20,
        sedimentGrainSize: 0.3 + (Math.random() - 0.5) * 0.2,
        sedimentComposition: getSedimentComposition(),
        sandSupply: 70 - (erosionIntensity * 40) + seasonalEffect * 10,
        sedimentTransportRate: erosionIntensity * 50 + stormInfluence * 20,
        longshoreTransportRate: 30 + (erosionIntensity * 40) + (Math.random() - 0.5) * 15,
        crossShoreTransportRate: erosionIntensity * 25 + stormInfluence * 10,
        waveHeight: 1.2 + (erosionIntensity * 4) + stormInfluence * 2,
        wavePeriod: 8 + (erosionIntensity * 6) + (Math.random() - 0.5) * 2,
        waveDirection: 180 + (Math.random() - 0.5) * 60,
        waveEnergy: erosionIntensity * 800 + stormInfluence * 400,
        tidalRange: 2.1 + (Math.random() - 0.5) * 0.8,
        stormSurgeFrequency: erosionIntensity * 0.3 + (Math.random() - 0.5) * 0.1,
        windSpeed: 15 + (erosionIntensity * 30) + stormInfluence * 20,
        windDirection: 220 + (Math.random() - 0.5) * 80,
        rainfallIntensity: 50 + seasonalEffect * 30 + (Math.random() - 0.5) * 20,
        runoffVolume: erosionIntensity * 30 + seasonalEffect * 15,
        seaLevelRise: 3.2 + (erosionIntensity * 1.5) + (Math.random() - 0.5) * 0.8,
        relativeSeaLevelChange: 3.2 + (erosionIntensity * 1.5) + (Math.random() - 0.5) * 0.5,
        subsidenceRate: erosionIntensity * 2 + (Math.random() - 0.5) * 0.5,
        vegetationCover: 80 - (erosionIntensity * 50) + (Math.random() - 0.5) * 15,
        vegetationHealth: getVegetationHealth(80 - (erosionIntensity * 50)),
        rootDensity: 70 - (erosionIntensity * 40) + (Math.random() - 0.5) * 10,
        bioturbationIndex: 0.3 + (erosionIntensity * 0.4) + (Math.random() - 0.5) * 0.1,
        humanActivity: getHumanActivityLevel(erosionIntensity),
        coastalDevelopment: erosionIntensity * 0.7 + (Math.random() - 0.5) * 0.2,
        touristTraffic: erosionIntensity * 60 + seasonalEffect * 30,
        seawallPresence: erosionIntensity > 0.6 ? "Present" : "Absent",
        seawallCondition: erosionIntensity > 0.6 ? getSeawallCondition(erosionIntensity) : "N/A",
        groynPresence: Math.random() > 0.7 ? "Present" : "Absent",
        beachNourishment: Math.random() > 0.8 ? "Recent" : "None",
        protectionEffectiveness: erosionIntensity > 0.6 ? (1 - erosionIntensity) * 0.8 : 0.9,
        vulernabilityIndex: erosionIntensity * 0.9 + (Math.random() - 0.5) * 0.1,
        riskAssessment: getErosionRisk(erosionIntensity),
        economicValue: 1000000 - (erosionIntensity * 600000),
        infrastructureAtRisk: getInfrastructureAtRisk(erosionIntensity),
        propertyDamageRisk: erosionIntensity * 500000,
        evacuationPlan: erosionIntensity > 0.7 ? "Active" : "Standby",
        communityPreparedness: getCommunityPreparedness(erosionIntensity),
        erosionPrediction1Year: erosionIntensity * 3 + (Math.random() - 0.5) * 1,
        erosionPrediction5Year: erosionIntensity * 12 + (Math.random() - 0.5) * 3,
        erosionPrediction10Year: erosionIntensity * 25 + (Math.random() - 0.5) * 5,
        adaptationCost: erosionIntensity * 2000000 + (Math.random() - 0.5) * 500000,
        costBenefitRatio: 2.5 - (erosionIntensity * 1.5) + (Math.random() - 0.5) * 0.5,
        monitoringFrequency: getMonitoringFrequency(erosionIntensity),
        dataReliability: 0.85 + Math.random() * 0.15,
        lastCalibration: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 60 + Math.random() * 40,
        signalStrength: -35 + Math.random() * 25,
    };
}

function getSedimentComposition(): string {
    const compositions = ["Sand", "Silt", "Clay", "Mixed", "Gravel", "Coral"];
    return compositions[Math.floor(Math.random() * compositions.length)];
}

function getVegetationHealth(cover: number): string {
    if (cover > 70) return "Excellent";
    if (cover > 50) return "Good";
    if (cover > 30) return "Fair";
    return "Poor";
}

function getHumanActivityLevel(intensity: number): string {
    if (intensity < 0.3) return "Low";
    if (intensity < 0.6) return "Moderate";
    return "High";
}

function getSeawallCondition(intensity: number): string {
    if (intensity < 0.7) return "Good";
    if (intensity < 0.8) return "Fair";
    return "Poor";
}

function getErosionRisk(intensity: number): string {
    if (intensity < 0.25) return "Low";
    if (intensity < 0.5) return "Moderate";
    if (intensity < 0.75) return "High";
    return "Critical";
}

function getInfrastructureAtRisk(intensity: number): string {
    if (intensity < 0.4) return "None";
    if (intensity < 0.7) return "Roads";
    return "Buildings";
}

function getCommunityPreparedness(intensity: number): string {
    if (intensity < 0.3) return "High";
    if (intensity < 0.6) return "Moderate";
    return "Low";
}

function getMonitoringFrequency(intensity: number): string {
    if (intensity < 0.3) return "Monthly";
    if (intensity < 0.6) return "Weekly";
    return "Daily";
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
            'timestamp', 'latitude', 'longitude', 'region', 'shoreline_position',
            'erosion_rate', 'accretion_rate', 'net_shoreline_change', 'beach_width',
            'beach_volume', 'dune_height', 'dune_width', 'cliff_retreat_rate',
            'rock_strength', 'sediment_grain_size', 'sediment_composition', 'sand_supply',
            'sediment_transport_rate', 'longshore_transport_rate', 'cross_shore_transport_rate',
            'wave_height', 'wave_period', 'wave_direction', 'wave_energy', 'tidal_range',
            'storm_surge_frequency', 'wind_speed', 'wind_direction', 'rainfall_intensity',
            'runoff_volume', 'sea_level_rise', 'relative_sea_level_change', 'subsidence_rate',
            'vegetation_cover', 'vegetation_health', 'root_density', 'bioturbation_index',
            'human_activity', 'coastal_development', 'tourist_traffic', 'seawall_presence',
            'seawall_condition', 'groyn_presence', 'beach_nourishment', 'protection_effectiveness',
            'vulnerability_index', 'risk_assessment', 'economic_value', 'infrastructure_at_risk',
            'property_damage_risk', 'evacuation_plan', 'community_preparedness',
            'erosion_prediction_1_year', 'erosion_prediction_5_year', 'erosion_prediction_10_year',
            'adaptation_cost', 'cost_benefit_ratio', 'monitoring_frequency', 'data_reliability',
            'battery_level', 'signal_strength'
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
            const lat = location.lat + (Math.random() - 0.5) * 0.05;
            const lng = location.lng + (Math.random() - 0.5) * 0.05;

            const data = generateCoastalErosionData({ lat, lng });

            if (format === 'csv') {
                // Flattened data for CSV
                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    shoreline_position: data.shorelinePosition.toFixed(2),
                    erosion_rate: data.erosionRate.toFixed(3),
                    accretion_rate: data.accretionRate.toFixed(3),
                    net_shoreline_change: data.netShorelineChange.toFixed(3),
                    beach_width: data.beachWidth.toFixed(2),
                    beach_volume: data.beachVolume.toFixed(2),
                    dune_height: data.duneHeight.toFixed(2),
                    dune_width: data.duneWidth.toFixed(2),
                    cliff_retreat_rate: data.cliffRetreatRate.toFixed(3),
                    rock_strength: data.rockStrength.toFixed(2),
                    sediment_grain_size: data.sedimentGrainSize.toFixed(3),
                    sediment_composition: data.sedimentComposition,
                    sand_supply: data.sandSupply.toFixed(2),
                    sediment_transport_rate: data.sedimentTransportRate.toFixed(2),
                    longshore_transport_rate: data.longshoreTransportRate.toFixed(2),
                    cross_shore_transport_rate: data.crossShoreTransportRate.toFixed(2),
                    wave_height: data.waveHeight.toFixed(2),
                    wave_period: data.wavePeriod.toFixed(2),
                    wave_direction: data.waveDirection.toFixed(1),
                    wave_energy: data.waveEnergy.toFixed(2),
                    tidal_range: data.tidalRange.toFixed(2),
                    storm_surge_frequency: data.stormSurgeFrequency.toFixed(3),
                    wind_speed: data.windSpeed.toFixed(2),
                    wind_direction: data.windDirection.toFixed(1),
                    rainfall_intensity: data.rainfallIntensity.toFixed(2),
                    runoff_volume: data.runoffVolume.toFixed(2),
                    sea_level_rise: data.seaLevelRise.toFixed(2),
                    relative_sea_level_change: data.relativeSeaLevelChange.toFixed(2),
                    subsidence_rate: data.subsidenceRate.toFixed(3),
                    vegetation_cover: data.vegetationCover.toFixed(2),
                    vegetation_health: data.vegetationHealth,
                    root_density: data.rootDensity.toFixed(2),
                    bioturbation_index: data.bioturbationIndex.toFixed(3),
                    human_activity: data.humanActivity,
                    coastal_development: data.coastalDevelopment.toFixed(3),
                    tourist_traffic: data.touristTraffic.toFixed(2),
                    seawall_presence: data.seawallPresence,
                    seawall_condition: data.seawallCondition,
                    groyn_presence: data.groynPresence,
                    beach_nourishment: data.beachNourishment,
                    protection_effectiveness: data.protectionEffectiveness.toFixed(3),
                    vulnerability_index: data.vulernabilityIndex.toFixed(3),
                    risk_assessment: data.riskAssessment,
                    economic_value: data.economicValue.toFixed(2),
                    infrastructure_at_risk: data.infrastructureAtRisk,
                    property_damage_risk: data.propertyDamageRisk.toFixed(2),
                    evacuation_plan: data.evacuationPlan,
                    community_preparedness: data.communityPreparedness,
                    erosion_prediction_1_year: data.erosionPrediction1Year.toFixed(2),
                    erosion_prediction_5_year: data.erosionPrediction5Year.toFixed(2),
                    erosion_prediction_10_year: data.erosionPrediction10Year.toFixed(2),
                    adaptation_cost: data.adaptationCost.toFixed(2),
                    cost_benefit_ratio: data.costBenefitRatio.toFixed(2),
                    monitoring_frequency: data.monitoringFrequency,
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

            const filename = `coastal_erosion_data_${count}_points_${Date.now()}.csv`;

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
                    downloadUrl: `/api/coastal-erosion/csv?count=${count}&download=true&interval=${timeInterval}`
                });
            }
        } else {
            // Return JSON format
            const filename = `coastal_erosion_data_${count}_points_${Date.now()}.json`;

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
        console.error('Error generating coastal erosion CSV data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate coastal erosion data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
