import db from '@/lib/db';
import { regions } from '@/lib/regions';

// Enum definitions to match Prisma schema
enum AlertType {
    CYCLONE = 'CYCLONE',
    STORM_SURGE = 'STORM_SURGE',
    COASTAL_EROSION = 'COASTAL_EROSION',
    WATER_POLLUTION = 'WATER_POLLUTION'
}

enum AlertSeverity {
    LOW = 'LOW',
    MODERATE = 'MODERATE',
    HIGH = 'HIGH',
    EXTREME = 'EXTREME'
}

enum AlertStatus {
    GENERATED = 'GENERATED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SENT = 'SENT'
}

// Alert threshold configurations
const ALERT_THRESHOLDS = {
    cyclone: {
        moderate: { speed: 120, pressure: 980, mlPrediction: 0.6 },
        high: { speed: 150, pressure: 950, mlPrediction: 0.75 },
        extreme: { speed: 180, pressure: 920, mlPrediction: 0.85 }
    },
    pollution: {
        moderate: { turbidity: 15, ph: { min: 6.5, max: 8.5 }, dissolvedOxygen: 4, mlPrediction: 0.6 },
        high: { turbidity: 25, ph: { min: 6.0, max: 9.0 }, dissolvedOxygen: 3, mlPrediction: 0.75 },
        extreme: { turbidity: 40, ph: { min: 5.5, max: 9.5 }, dissolvedOxygen: 2, mlPrediction: 0.85 }
    },
    stormSurge: {
        moderate: { waterLevel: 3, waveHeight: 2.5, windSpeed: 60, mlPrediction: 0.6 },
        high: { waterLevel: 4.5, waveHeight: 4, windSpeed: 80, mlPrediction: 0.75 },
        extreme: { waterLevel: 6, waveHeight: 6, windSpeed: 100, mlPrediction: 0.85 }
    },
    coastal: {
        moderate: { erosionRate: 2, waveEnergy: 150, mlPrediction: 0.6 },
        high: { erosionRate: 3.5, waveEnergy: 200, mlPrediction: 0.75 },
        extreme: { erosionRate: 5, waveEnergy: 300, mlPrediction: 0.85 }
    }
};

// Helper function to get random region from our regions data
function getRandomRegion() {
    return regions[Math.floor(Math.random() * regions.length)];
}

// Helper function to determine alert severity
function determineCycloneAlertSeverity(data: any): AlertSeverity {
    const thresholds = ALERT_THRESHOLDS.cyclone;

    if (data.speed >= thresholds.extreme.speed || data.centralPressure <= thresholds.extreme.pressure || data.mlPrediction >= thresholds.extreme.mlPrediction) {
        return AlertSeverity.EXTREME;
    }
    if (data.speed >= thresholds.high.speed || data.centralPressure <= thresholds.high.pressure || data.mlPrediction >= thresholds.high.mlPrediction) {
        return AlertSeverity.HIGH;
    }
    if (data.speed >= thresholds.moderate.speed || data.centralPressure <= thresholds.moderate.pressure || data.mlPrediction >= thresholds.moderate.mlPrediction) {
        return AlertSeverity.MODERATE;
    }

    return AlertSeverity.LOW;
}

function determinePollutionAlertSeverity(data: any): AlertSeverity {
    const thresholds = ALERT_THRESHOLDS.pollution;
    const { waterQuality } = data;

    if (waterQuality.turbidity >= thresholds.extreme.turbidity || waterQuality.dissolvedOxygen <= thresholds.extreme.dissolvedOxygen || data.mlPrediction >= thresholds.extreme.mlPrediction) {
        return AlertSeverity.EXTREME;
    }
    if (waterQuality.turbidity >= thresholds.high.turbidity || waterQuality.dissolvedOxygen <= thresholds.high.dissolvedOxygen || data.mlPrediction >= thresholds.high.mlPrediction) {
        return AlertSeverity.HIGH;
    }
    if (waterQuality.turbidity >= thresholds.moderate.turbidity || waterQuality.dissolvedOxygen <= thresholds.moderate.dissolvedOxygen || data.mlPrediction >= thresholds.moderate.mlPrediction) {
        return AlertSeverity.MODERATE;
    }

    return AlertSeverity.LOW;
}

function determineStormSurgeAlertSeverity(data: any): AlertSeverity {
    const thresholds = ALERT_THRESHOLDS.stormSurge;
    const { waterLevel, waves, meteorology } = data;

    if (waterLevel.currentLevel >= thresholds.extreme.waterLevel || waves.significantHeight >= thresholds.extreme.waveHeight || meteorology.windSpeed >= thresholds.extreme.windSpeed || data.mlPrediction >= thresholds.extreme.mlPrediction) {
        return AlertSeverity.EXTREME;
    }
    if (waterLevel.currentLevel >= thresholds.high.waterLevel || waves.significantHeight >= thresholds.high.waveHeight || meteorology.windSpeed >= thresholds.high.windSpeed || data.mlPrediction >= thresholds.high.mlPrediction) {
        return AlertSeverity.HIGH;
    }
    if (waterLevel.currentLevel >= thresholds.moderate.waterLevel || waves.significantHeight >= thresholds.moderate.waveHeight || meteorology.windSpeed >= thresholds.moderate.windSpeed || data.mlPrediction >= thresholds.moderate.mlPrediction) {
        return AlertSeverity.MODERATE;
    }

    return AlertSeverity.LOW;
}

function determineCoastalErosionAlertSeverity(data: any): AlertSeverity {
    const thresholds = ALERT_THRESHOLDS.coastal;
    const { shoreline, hydrodynamics } = data;

    if (shoreline.erosionRate >= thresholds.extreme.erosionRate || hydrodynamics.waveEnergy >= thresholds.extreme.waveEnergy || data.mlPrediction >= thresholds.extreme.mlPrediction) {
        return AlertSeverity.EXTREME;
    }
    if (shoreline.erosionRate >= thresholds.high.erosionRate || hydrodynamics.waveEnergy >= thresholds.high.waveEnergy || data.mlPrediction >= thresholds.high.mlPrediction) {
        return AlertSeverity.HIGH;
    }
    if (shoreline.erosionRate >= thresholds.moderate.erosionRate || hydrodynamics.waveEnergy >= thresholds.moderate.waveEnergy || data.mlPrediction >= thresholds.moderate.mlPrediction) {
        return AlertSeverity.MODERATE;
    }

    return AlertSeverity.LOW;
}

// Helper function to generate alert title and description
function generateAlertContent(data: any, type: AlertType, severity: AlertSeverity, region: any) {
    const riskLevel = severity.toLowerCase();
    const regionName = region.region.charAt(0).toUpperCase() + region.region.slice(1);
    const stateName = region.state.replace('_', ' ').split(' ').map((word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    let title = '';
    let description = '';

    switch (type) {
        case AlertType.CYCLONE:
            title = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Cyclone Formation Risk - ${regionName}`;
            description = `Cyclone formation detected near ${regionName}, ${stateName} with ${Math.round(data.mlPrediction * 100)}% probability. Wind speed: ${data.speed?.toFixed(1)} km/h, Central pressure: ${data.centralPressure?.toFixed(1)} hPa. Immediate precautionary measures recommended.`;
            break;

        case AlertType.STORM_SURGE:
            title = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Storm Surge Warning - ${regionName}`;
            description = `Storm surge threat detected in ${regionName}, ${stateName} with ${Math.round(data.mlPrediction * 100)}% confidence. Water level: ${data.waterLevel?.currentLevel?.toFixed(1)}m, Wave height: ${data.waves?.significantHeight?.toFixed(1)}m. Coastal flooding possible.`;
            break;

        case AlertType.COASTAL_EROSION:
            title = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Coastal Erosion Alert - ${regionName}`;
            description = `Accelerated coastal erosion detected in ${regionName}, ${stateName} with ${Math.round(data.mlPrediction * 100)}% confidence. Erosion rate: ${data.shoreline?.erosionRate?.toFixed(2)} m/year. Shoreline infrastructure at risk.`;
            break;

        case AlertType.WATER_POLLUTION:
            title = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Water Quality Alert - ${regionName}`;
            description = `Water quality degradation detected in ${regionName}, ${stateName} with ${Math.round(data.mlPrediction * 100)}% confidence. Turbidity: ${data.waterQuality?.turbidity?.toFixed(1)} NTU, DO: ${data.waterQuality?.dissolvedOxygen?.toFixed(1)} mg/L. Marine ecosystem under stress.`;
            break;
    }

    return { title, description };
}

// Main alert monitoring functions
export async function checkCycloneAlerts(data: any) {
    const severity = determineCycloneAlertSeverity(data);

    if (severity !== AlertSeverity.LOW) {
        const region = getRandomRegion();
        const { title, description } = generateAlertContent(data, AlertType.CYCLONE, severity, region);

        // Check if similar alert already exists recently (within last hour)
        const recentAlert = await db.alert.findFirst({
            where: {
                type: AlertType.CYCLONE,
                region: region.region,
                state: region.state,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
            }
        });

        if (!recentAlert) {
            const alert = await db.alert.create({
                data: {
                    type: AlertType.CYCLONE,
                    severity,
                    title,
                    description,
                    region: region.region,
                    state: region.state,
                    coordinates: { lat: region.lat, lng: region.long },
                    predictionData: data,
                    mlPrediction: data.mlPrediction || Math.random() * 0.4 + 0.6, // Ensure reasonable ML prediction
                    thresholdMet: true,
                    autoGenerated: true,
                    status: AlertStatus.GENERATED
                }
            });

            console.log(`🌪️ Cyclone alert generated: ${alert.title}`);
            return alert;
        }
    }

    return null;
}

export async function checkPollutionAlerts(data: any) {
    const severity = determinePollutionAlertSeverity(data);

    if (severity !== AlertSeverity.LOW) {
        const region = getRandomRegion();
        const { title, description } = generateAlertContent(data, AlertType.WATER_POLLUTION, severity, region);

        const recentAlert = await db.alert.findFirst({
            where: {
                type: AlertType.WATER_POLLUTION,
                region: region.region,
                state: region.state,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000)
                }
            }
        });

        if (!recentAlert) {
            const alert = await db.alert.create({
                data: {
                    type: AlertType.WATER_POLLUTION,
                    severity,
                    title,
                    description,
                    region: region.region,
                    state: region.state,
                    coordinates: { lat: region.lat, lng: region.long },
                    predictionData: data,
                    mlPrediction: data.mlPrediction || Math.random() * 0.4 + 0.6,
                    thresholdMet: true,
                    autoGenerated: true,
                    status: AlertStatus.GENERATED
                }
            });

            console.log(`🏭 Water pollution alert generated: ${alert.title}`);
            return alert;
        }
    }

    return null;
}

export async function checkStormSurgeAlerts(data: any) {
    const severity = determineStormSurgeAlertSeverity(data);

    if (severity !== AlertSeverity.LOW) {
        const region = getRandomRegion();
        const { title, description } = generateAlertContent(data, AlertType.STORM_SURGE, severity, region);

        const recentAlert = await db.alert.findFirst({
            where: {
                type: AlertType.STORM_SURGE,
                region: region.region,
                state: region.state,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000)
                }
            }
        });

        if (!recentAlert) {
            const alert = await db.alert.create({
                data: {
                    type: AlertType.STORM_SURGE,
                    severity,
                    title,
                    description,
                    region: region.region,
                    state: region.state,
                    coordinates: { lat: region.lat, lng: region.long },
                    predictionData: data,
                    mlPrediction: data.mlPrediction || Math.random() * 0.4 + 0.6,
                    thresholdMet: true,
                    autoGenerated: true,
                    status: AlertStatus.GENERATED
                }
            });

            console.log(`🌊 Storm surge alert generated: ${alert.title}`);
            return alert;
        }
    }

    return null;
}

export async function checkCoastalErosionAlerts(data: any) {
    const severity = determineCoastalErosionAlertSeverity(data);

    if (severity !== AlertSeverity.LOW) {
        const region = getRandomRegion();
        const { title, description } = generateAlertContent(data, AlertType.COASTAL_EROSION, severity, region);

        const recentAlert = await db.alert.findFirst({
            where: {
                type: AlertType.COASTAL_EROSION,
                region: region.region,
                state: region.state,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000)
                }
            }
        });

        if (!recentAlert) {
            const alert = await db.alert.create({
                data: {
                    type: AlertType.COASTAL_EROSION,
                    severity,
                    title,
                    description,
                    region: region.region,
                    state: region.state,
                    coordinates: { lat: region.lat, lng: region.long },
                    predictionData: data,
                    mlPrediction: data.mlPrediction || Math.random() * 0.4 + 0.6,
                    thresholdMet: true,
                    autoGenerated: true,
                    status: AlertStatus.GENERATED
                }
            });

            console.log(`🏖️ Coastal erosion alert generated: ${alert.title}`);
            return alert;
        }
    }

    return null;
}

// Function to get alert statistics
export async function getAlertStats() {
    const [
        totalGenerated,
        pendingApproval,
        totalApproved,
        totalSent,
        last24Hours,
        byType,
        bySeverity
    ] = await Promise.all([
        db.alert.count({ where: { autoGenerated: true } }),
        db.alert.count({ where: { status: AlertStatus.GENERATED } }),
        db.alert.count({ where: { status: AlertStatus.APPROVED } }),
        db.alert.count({ where: { status: AlertStatus.SENT } }),
        db.alert.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                autoGenerated: true
            }
        }),
        db.alert.groupBy({
            by: ['type'],
            _count: { type: true },
            where: { autoGenerated: true }
        }),
        db.alert.groupBy({
            by: ['severity'],
            _count: { severity: true },
            where: { autoGenerated: true }
        })
    ]);

    return {
        totalGenerated,
        pendingApproval,
        totalApproved,
        totalSent,
        last24Hours,
        byType: byType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
        }, {} as Record<string, number>),
        bySeverity: bySeverity.reduce((acc, item) => {
            acc[item.severity] = item._count.severity;
            return acc;
        }, {} as Record<string, number>)
    };
}
