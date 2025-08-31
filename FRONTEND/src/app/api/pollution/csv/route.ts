import { NextRequest, NextResponse } from 'next/server';

// Generate realistic pollution monitoring data (same function as in tRPC)
function generatePollutionData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate pollution levels with daily and seasonal variations
    const pollutionIntensity = Math.random(); // 0-1 scale
    const timeVariation = Math.sin(Date.now() / 15000) * 0.3; // Temporal variation
    const urbanProximity = Math.random(); // Distance from urban sources

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.08,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.08,
        region: "Gujarat Coast",
        pH: 7.8 - (pollutionIntensity * 1.5) + (Math.random() - 0.5) * 0.4,
        dissolvedOxygen: 8.5 - (pollutionIntensity * 3) + timeVariation,
        biochemicalOxygenDemand: 2 + (pollutionIntensity * 12) + (Math.random() - 0.5) * 2,
        chemicalOxygenDemand: 10 + (pollutionIntensity * 40) + (Math.random() - 0.5) * 8,
        totalSuspendedSolids: 20 + (pollutionIntensity * 150) + (Math.random() - 0.5) * 30,
        turbidity: 5 + (pollutionIntensity * 45) + (Math.random() - 0.5) * 10,
        nitrates: 0.5 + (pollutionIntensity * 8) + (Math.random() - 0.5) * 1.5,
        nitrites: 0.1 + (pollutionIntensity * 2) + (Math.random() - 0.5) * 0.3,
        ammonia: 0.2 + (pollutionIntensity * 3) + (Math.random() - 0.5) * 0.5,
        phosphates: 0.3 + (pollutionIntensity * 4) + (Math.random() - 0.5) * 0.8,
        sulfates: 150 + (pollutionIntensity * 200) + (Math.random() - 0.5) * 50,
        chlorides: 18000 + (pollutionIntensity * 3000) + (Math.random() - 0.5) * 1000,
        heavyMetalsIndex: pollutionIntensity * 0.8 + (Math.random() - 0.5) * 0.2,
        mercury: pollutionIntensity * 0.002 + (Math.random() - 0.5) * 0.0005,
        lead: pollutionIntensity * 0.05 + (Math.random() - 0.5) * 0.01,
        cadmium: pollutionIntensity * 0.01 + (Math.random() - 0.5) * 0.003,
        chromium: pollutionIntensity * 0.1 + (Math.random() - 0.5) * 0.02,
        copper: pollutionIntensity * 0.2 + (Math.random() - 0.5) * 0.05,
        zinc: pollutionIntensity * 0.5 + (Math.random() - 0.5) * 0.1,
        pesticidesIndex: pollutionIntensity * 0.6 + (Math.random() - 0.5) * 0.15,
        hydrocarbonIndex: pollutionIntensity * 0.9 + (Math.random() - 0.5) * 0.2,
        oilSpillIndicator: pollutionIntensity > 0.7 ? pollutionIntensity * 0.8 : 0,
        plasticDebrisCount: Math.floor(pollutionIntensity * 50 + urbanProximity * 30),
        microplasticsCount: Math.floor(pollutionIntensity * 200 + urbanProximity * 100),
        bacterialCount: Math.floor((pollutionIntensity * 10000 + urbanProximity * 5000) * (1 + timeVariation)),
        coliformCount: Math.floor((pollutionIntensity * 2000 + urbanProximity * 1000) * (1 + timeVariation)),
        viralLoad: pollutionIntensity * 500 + urbanProximity * 200,
        algalBloomRisk: pollutionIntensity * 0.7 + (Math.random() - 0.5) * 0.2,
        eutrophicationIndex: pollutionIntensity * 0.8 + (Math.random() - 0.5) * 0.15,
        toxicityLevel: getPollutionToxicityLevel(pollutionIntensity),
        temperature: 26 + timeVariation + (pollutionIntensity * 2),
        salinity: 35 + (pollutionIntensity * 2) + (Math.random() - 0.5) * 1,
        conductivity: 50000 + (pollutionIntensity * 5000) + (Math.random() - 0.5) * 2000,
        redoxPotential: 200 - (pollutionIntensity * 150) + (Math.random() - 0.5) * 50,
        seabirdsAffected: Math.floor(pollutionIntensity * 20),
        fishMortalityRate: pollutionIntensity * 0.15 + (Math.random() - 0.5) * 0.05,
        coralBleachingIndex: pollutionIntensity * 0.6 + (Math.random() - 0.5) * 0.2,
        pollutionSource: identifyPollutionSource(urbanProximity, pollutionIntensity),
        industrialWasteIndicator: urbanProximity > 0.6 ? pollutionIntensity * 0.8 : pollutionIntensity * 0.3,
        agriculturalRunoffIndex: pollutionIntensity * 0.7 + (Math.random() - 0.5) * 0.2,
        domesticSewagewIndex: urbanProximity * 0.9 + (Math.random() - 0.5) * 0.2,
        stormwaterRunoffIndex: pollutionIntensity * 0.5 + (Math.random() - 0.5) * 0.3,
        shipTrafficImpact: pollutionIntensity * 0.4 + (Math.random() - 0.5) * 0.2,
        remediationEfficiency: 0.8 - (pollutionIntensity * 0.4) + (Math.random() - 0.5) * 0.2,
        treatmentCapacity: 85 - (pollutionIntensity * 30) + (Math.random() - 0.5) * 10,
        complianceStatus: pollutionIntensity < 0.3 ? "Compliant" : pollutionIntensity < 0.7 ? "Warning" : "Non-Compliant",
        riskLevel: getPollutionRiskLevel(pollutionIntensity),
        dataReliability: 0.88 + Math.random() * 0.12,
        lastCalibration: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 70 + Math.random() * 30,
        signalStrength: -40 + Math.random() * 20,
    };
}

function getPollutionToxicityLevel(intensity: number): string {
    if (intensity < 0.2) return "Low";
    if (intensity < 0.4) return "Moderate";
    if (intensity < 0.6) return "High";
    if (intensity < 0.8) return "Very High";
    return "Critical";
}

function getPollutionRiskLevel(intensity: number): string {
    if (intensity < 0.25) return "Low";
    if (intensity < 0.5) return "Moderate";
    if (intensity < 0.75) return "High";
    return "Extreme";
}

function identifyPollutionSource(urbanProximity: number, intensity: number): string {
    if (urbanProximity > 0.7 && intensity > 0.6) return "Industrial";
    if (urbanProximity > 0.5) return "Urban Runoff";
    if (intensity > 0.4) return "Agricultural";
    return "Natural/Background";
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
            'timestamp', 'latitude', 'longitude', 'region', 'pH', 'dissolved_oxygen',
            'biochemical_oxygen_demand', 'chemical_oxygen_demand', 'total_suspended_solids',
            'turbidity', 'nitrates', 'nitrites', 'ammonia', 'phosphates', 'sulfates',
            'chlorides', 'heavy_metals_index', 'mercury', 'lead', 'cadmium', 'chromium',
            'copper', 'zinc', 'pesticides_index', 'hydrocarbon_index', 'oil_spill_indicator',
            'plastic_debris_count', 'microplastics_count', 'bacterial_count', 'coliform_count',
            'viral_load', 'algal_bloom_risk', 'eutrophication_index', 'toxicity_level',
            'temperature', 'salinity', 'conductivity', 'redox_potential', 'seabirds_affected',
            'fish_mortality_rate', 'coral_bleaching_index', 'pollution_source',
            'industrial_waste_indicator', 'agricultural_runoff_index', 'domestic_sewage_index',
            'stormwater_runoff_index', 'ship_traffic_impact', 'remediation_efficiency',
            'treatment_capacity', 'compliance_status', 'risk_level', 'data_reliability',
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
            const lat = location.lat + (Math.random() - 0.5) * 0.1;
            const lng = location.lng + (Math.random() - 0.5) * 0.1;

            const data = generatePollutionData({ lat, lng });

            if (format === 'csv') {
                // Flattened data for CSV
                const flatData = {
                    timestamp: timestamp.toISOString(),
                    latitude: lat.toFixed(4),
                    longitude: lng.toFixed(4),
                    region: location.region,
                    pH: data.pH.toFixed(2),
                    dissolved_oxygen: data.dissolvedOxygen.toFixed(2),
                    biochemical_oxygen_demand: data.biochemicalOxygenDemand.toFixed(2),
                    chemical_oxygen_demand: data.chemicalOxygenDemand.toFixed(2),
                    total_suspended_solids: data.totalSuspendedSolids.toFixed(2),
                    turbidity: data.turbidity.toFixed(2),
                    nitrates: data.nitrates.toFixed(3),
                    nitrites: data.nitrites.toFixed(3),
                    ammonia: data.ammonia.toFixed(3),
                    phosphates: data.phosphates.toFixed(3),
                    sulfates: data.sulfates.toFixed(2),
                    chlorides: data.chlorides.toFixed(2),
                    heavy_metals_index: data.heavyMetalsIndex.toFixed(4),
                    mercury: data.mercury.toFixed(6),
                    lead: data.lead.toFixed(5),
                    cadmium: data.cadmium.toFixed(5),
                    chromium: data.chromium.toFixed(4),
                    copper: data.copper.toFixed(4),
                    zinc: data.zinc.toFixed(4),
                    pesticides_index: data.pesticidesIndex.toFixed(4),
                    hydrocarbon_index: data.hydrocarbonIndex.toFixed(4),
                    oil_spill_indicator: data.oilSpillIndicator.toFixed(4),
                    plastic_debris_count: data.plasticDebrisCount,
                    microplastics_count: data.microplasticsCount,
                    bacterial_count: data.bacterialCount,
                    coliform_count: data.coliformCount,
                    viral_load: data.viralLoad.toFixed(2),
                    algal_bloom_risk: data.algalBloomRisk.toFixed(4),
                    eutrophication_index: data.eutrophicationIndex.toFixed(4),
                    toxicity_level: data.toxicityLevel,
                    temperature: data.temperature.toFixed(2),
                    salinity: data.salinity.toFixed(2),
                    conductivity: data.conductivity.toFixed(2),
                    redox_potential: data.redoxPotential.toFixed(2),
                    seabirds_affected: data.seabirdsAffected,
                    fish_mortality_rate: data.fishMortalityRate.toFixed(4),
                    coral_bleaching_index: data.coralBleachingIndex.toFixed(4),
                    pollution_source: data.pollutionSource,
                    industrial_waste_indicator: data.industrialWasteIndicator.toFixed(4),
                    agricultural_runoff_index: data.agriculturalRunoffIndex.toFixed(4),
                    domestic_sewage_index: data.domesticSewagewIndex.toFixed(4),
                    stormwater_runoff_index: data.stormwaterRunoffIndex.toFixed(4),
                    ship_traffic_impact: data.shipTrafficImpact.toFixed(4),
                    remediation_efficiency: data.remediationEfficiency.toFixed(4),
                    treatment_capacity: data.treatmentCapacity.toFixed(2),
                    compliance_status: data.complianceStatus,
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

            const filename = `pollution_data_${count}_points_${Date.now()}.csv`;

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
                    downloadUrl: `/api/pollution/csv?count=${count}&download=true&interval=${timeInterval}`
                });
            }
        } else {
            // Return JSON format
            const filename = `pollution_data_${count}_points_${Date.now()}.json`;

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
        console.error('Error generating pollution CSV data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate pollution data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
