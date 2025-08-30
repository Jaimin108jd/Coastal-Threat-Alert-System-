import { NextRequest, NextResponse } from 'next/server';

// Map to store recent predictions for each threat type and region
// This would normally be in a database or Redis for a real application
const predictionCache = new Map<string, {
    prediction: any,
    timestamp: number,
    region: string
}>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { threatType, data, region } = body;

        if (!threatType || !data) {
            return NextResponse.json(
                { error: 'Missing required fields: threatType and data' },
                { status: 400 }
            );
        }

        // Generate ML predictions based on the threat type
        const prediction = generatePrediction(threatType, data);

        // Save prediction to cache with region key
        const cacheKey = `${threatType}:${region || 'unknown'}`;
        predictionCache.set(cacheKey, {
            prediction,
            timestamp: Date.now(),
            region: region || 'unknown'
        });

        return NextResponse.json({
            success: true,
            threatType,
            region,
            prediction,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing ML prediction:', error);
        return NextResponse.json(
            { error: 'Failed to process prediction' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const threatType = searchParams.get('threatType');
        const region = searchParams.get('region');

        // Return all predictions if no filters provided
        if (!threatType && !region) {
            const allPredictions = Array.from(predictionCache.entries()).map(
                ([key, value]) => ({
                    key,
                    ...value,
                    timestamp: new Date(value.timestamp).toISOString()
                })
            );
            return NextResponse.json({
                success: true,
                predictions: allPredictions,
                count: allPredictions.length
            });
        }

        // Filter by threat type and region if provided
        if (threatType && region) {
            const cacheKey = `${threatType}:${region}`;
            const prediction = predictionCache.get(cacheKey);

            if (prediction) {
                return NextResponse.json({
                    success: true,
                    threatType,
                    region,
                    prediction: prediction.prediction,
                    timestamp: new Date(prediction.timestamp).toISOString()
                });
            }

            return NextResponse.json(
                { error: 'No predictions found for the specified threat type and region' },
                { status: 404 }
            );
        }

        // Filter by threat type only
        if (threatType) {
            const filteredPredictions = Array.from(predictionCache.entries())
                .filter(([key]) => key.startsWith(`${threatType}:`))
                .map(([key, value]) => ({
                    key,
                    ...value,
                    timestamp: new Date(value.timestamp).toISOString()
                }));

            return NextResponse.json({
                success: true,
                threatType,
                predictions: filteredPredictions,
                count: filteredPredictions.length
            });
        }

        // Filter by region only
        if (region) {
            const filteredPredictions = Array.from(predictionCache.entries())
                .filter(([, value]) => value.region === region)
                .map(([key, value]) => ({
                    key,
                    ...value,
                    timestamp: new Date(value.timestamp).toISOString()
                }));

            return NextResponse.json({
                success: true,
                region,
                predictions: filteredPredictions,
                count: filteredPredictions.length
            });
        }

    } catch (error) {
        console.error('Error retrieving ML predictions:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve predictions' },
            { status: 500 }
        );
    }
}

// Generate ML predictions based on threat type and input data
function generatePrediction(threatType: string, data: any) {
    // Add randomness to simulate ML model variation
    const randomFactor = 0.1; // +/- 10% variation
    const randomVariation = () => (Math.random() * 2 - 1) * randomFactor;

    switch (threatType.toLowerCase()) {
        case 'cyclone':
            // Factors that increase cyclone probability:
            // - Low pressure (< 1000 hPa)
            // - High sea surface temperature (> 26°C)
            // - Low vertical wind shear (< 10 m/s)
            // - High humidity (> 70%)
            // - High vorticity

            let cycloneProbability = 0.2; // Base probability

            // Pressure factor (lower = higher probability)
            if (data.centralPressure < 1000) cycloneProbability += 0.25;
            else if (data.centralPressure < 1005) cycloneProbability += 0.15;

            // Sea temperature factor
            if (data.seaSurfaceTemp > 28) cycloneProbability += 0.2;
            else if (data.seaSurfaceTemp > 26) cycloneProbability += 0.1;

            // Wind shear factor (lower = higher probability)
            if (data.verticalShear < 8) cycloneProbability += 0.2;
            else if (data.verticalShear < 12) cycloneProbability += 0.1;

            // Humidity factor
            if (data.humidity > 80) cycloneProbability += 0.15;
            else if (data.humidity > 70) cycloneProbability += 0.05;

            // Add intensity prediction based on wind speed
            const intensityLevel = data.speed > 120 ? "high" :
                data.speed > 90 ? "moderate" : "low";

            const predictedCategory = Math.min(5, Math.ceil(data.speed / 35));

            // Apply random variation
            cycloneProbability = Math.max(0, Math.min(1, cycloneProbability + randomVariation()));

            return {
                cyclone_formation_probability: cycloneProbability,
                predicted_intensity: intensityLevel,
                predicted_category: predictedCategory,
                landfall_probability: cycloneProbability > 0.7 ? 0.8 : 0.3,
                estimated_time_to_landfall: cycloneProbability > 0.6 ? Math.floor(Math.random() * 72) : null,
                confidence_score: 0.75 + randomVariation() / 2
            };

        case 'stormsurge':
        case 'storm-surge':
        case 'storm_surge':
            // Factors for storm surge risk:
            // - Wave height
            // - Wind speed
            // - Low pressure
            // - Proximity to coast

            let stormSurgeRisk = 0.1; // Base risk

            // Wave height factor
            if (data.waves?.significantHeight > 4) stormSurgeRisk += 0.3;
            else if (data.waves?.significantHeight > 2) stormSurgeRisk += 0.15;

            // Wind speed factor (from meteorology object)
            if (data.meteorology?.windSpeed > 60) stormSurgeRisk += 0.2;
            else if (data.meteorology?.windSpeed > 40) stormSurgeRisk += 0.1;

            // Pressure factor
            if (data.meteorology?.atmosphericPressure < 990) stormSurgeRisk += 0.25;
            else if (data.meteorology?.atmosphericPressure < 1000) stormSurgeRisk += 0.15;

            // Proximity to coast factor
            if (data.meteorology?.stormDistance < 100) stormSurgeRisk += 0.2;
            else if (data.meteorology?.stormDistance < 300) stormSurgeRisk += 0.1;

            // Apply random variation
            stormSurgeRisk = Math.max(0, Math.min(1, stormSurgeRisk + randomVariation()));

            return {
                storm_surge_risk: stormSurgeRisk,
                predicted_water_level: data.waterLevel?.currentLevel * (1 + Math.random() * 0.3),
                inundation_distance_prediction: stormSurgeRisk > 0.5 ? data.impact?.inundationExtent * 1.2 : data.impact?.inundationExtent * 0.8,
                infrastructure_damage_probability: stormSurgeRisk > 0.7 ? 0.85 : stormSurgeRisk > 0.4 ? 0.5 : 0.2,
                confidence_score: 0.72 + randomVariation() / 2
            };

        case 'pollution':
            // Simulate pollution level prediction based on input data
            // Pollution is typically measured on various scales (e.g. AQI 0-500)

            let pollutionLevel = 0.3; // Base level

            // Use custom pollution factors if available, or estimate based on weather conditions
            if (data.riskFactors?.overallPollutionLevel) {
                // Map string values to numeric probabilities
                switch (data.riskFactors.overallPollutionLevel) {
                    case 'SEVERE': pollutionLevel = 0.9; break;
                    case 'HIGH': pollutionLevel = 0.7; break;
                    case 'MODERATE': pollutionLevel = 0.5; break;
                    case 'LOW': pollutionLevel = 0.3; break;
                    default: pollutionLevel = 0.4;
                }
            } else {
                // Estimate based on other weather factors
                if (data.humidity < 30) pollutionLevel += 0.2; // Dry air traps pollutants
                if (data.windSpeed < 10) pollutionLevel += 0.15; // Low wind means less dispersion
            }

            // Apply random variation
            pollutionLevel = Math.max(0, Math.min(1, pollutionLevel + randomVariation()));

            return {
                pollution_level: pollutionLevel,
                air_quality_index: Math.round(pollutionLevel * 500),
                health_risk: pollutionLevel > 0.7 ? "high" : pollutionLevel > 0.5 ? "moderate" : "low",
                visibility_reduction: pollutionLevel * 8, // km
                confidence_score: 0.85 + randomVariation() / 2
            };

        case 'coastalerosion':
        case 'coastal-erosion':
        case 'coastal_erosion':
            // Simulate coastal erosion prediction based on input data

            let erosionRate = 0.2; // Base erosion rate prediction

            // Use erosion severity if available
            if (data.riskFactors?.erosionSeverity) {
                switch (data.riskFactors.erosionSeverity) {
                    case 'SEVERE': erosionRate = 0.8; break;
                    case 'HIGH': erosionRate = 0.6; break;
                    case 'MODERATE': erosionRate = 0.4; break;
                    case 'LOW': erosionRate = 0.2; break;
                    default: erosionRate = 0.3;
                }
            } else {
                // Use wave height and tidal factors if available
                if (data.waveHeight > 3) erosionRate += 0.2;
                if (data.tidalLevel > 3) erosionRate += 0.15;
            }

            // Apply random variation
            erosionRate = Math.max(0, Math.min(1, erosionRate + randomVariation()));

            return {
                erosion_rate_prediction: erosionRate,
                shoreline_retreat_meters_per_year: erosionRate * 10,
                at_risk_infrastructure: erosionRate > 0.6,
                recommended_action: erosionRate > 0.7 ? "immediate intervention" :
                    erosionRate > 0.5 ? "monitoring and planning" : "routine monitoring",
                confidence_score: 0.68 + randomVariation() / 2
            };

        default:
            // Generic prediction with minimal data
            return {
                prediction_value: 0.5 + randomVariation(),
                confidence: 0.6 + randomVariation() / 2,
                timestamp: Date.now()
            };
    }
}
