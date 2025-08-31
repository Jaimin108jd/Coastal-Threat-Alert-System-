"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTRPC } from "@/trpc/client"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import ProfileDropdown from "@/components/auth/ProfileDropdown"
import Link from "next/link"
import {
  Waves,
  Wind,
  Shield,
  MapPin,
  AlertTriangle,
  Activity,
  Globe,
  Zap,
  TrendingUp,
  Bell,
  Settings,
  Eye,
  RefreshCw,
  ArrowLeft,
  Brain,
  Satellite,
  Users,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSubscription, } from "@trpc/tanstack-react-query"
import dynamic from "next/dynamic";
import { regions } from "@/lib/regions"

const DynamicAlertsMap = dynamic(() => import("@/components/AlertsMap"), { ssr: false });

type CycloneData = {
  centralPressure: number
  speed: number
  verticalShear: number
  seaSurfaceTemp: number
  cloudTopTemp: number
  vorticity: number
  convectiveActivity: number
  humidity: number
  precipitation: number
  lat: number
  lng: number
  ml_pred?: { val: number | null }
}

type PollutionData = {
  waterQuality: {
    pH: number
    dissolvedOxygen: number
    turbidity: number
    temperature: number
    conductivity: number
  }
  chemicals: { nitrateLevel: number; phosphateLevel: number; hydrocarbons: number }
  biological: { biodiversityIndex: number }
  riskFactors: { overallPollutionLevel: string }
}

type StormSurgeData = {
  waterLevel: {
    currentLevel: number
    predictedLevel: number
    anomaly: number
    rateOfRise: number
  }
  waves: { significantHeight: number; period: number }
  meteorology: { windSpeed: number; atmosphericPressure: number }
  impact: { infrastructureRisk: "LOW" | "MODERATE" | "HIGH" }
}

type CoastalData = {
  shoreline: { erosionRate: number; beachWidth: number; shorelineRetreat: number }
  hydrodynamics: { waveEnergy: number; waveHeight: number }
  protection: { naturalBarriers: { vegetation: number }; artificialStructures: { effectivenessRating: number } }
  riskFactors: { erosionSeverity: string; urgencyLevel: string }
}

// Helper functions for alert generation
function getAlertType(pred: any): 'CYCLONE' | 'STORM_SURGE' | 'COASTAL_EROSION' | 'WATER_POLLUTION' {
  if (pred.speed !== undefined) return 'CYCLONE'
  if (pred.waterLevel !== undefined) return 'STORM_SURGE'
  if (pred.shoreline !== undefined) return 'COASTAL_EROSION'
  return 'WATER_POLLUTION'
}

function getAlertTitle(pred: any): string {
  const type = getAlertType(pred)
  const risk = pred.mlPrediction > 0.85 ? 'Extreme' : pred.mlPrediction > 0.75 ? 'High' : 'Moderate'

  switch (type) {
    case 'CYCLONE':
      return `${risk} Cyclone Formation Risk Detected`
    case 'STORM_SURGE':
      return `${risk} Storm Surge Warning`
    case 'COASTAL_EROSION':
      return `${risk} Coastal Erosion Alert`
    case 'WATER_POLLUTION':
      return `${risk} Water Quality Degradation`
    default:
      return `${risk} Environmental Risk`
  }
}

function getAlertDescription(pred: any): string {
  const confidence = Math.round(pred.mlPrediction * 100)
  const type = getAlertType(pred)

  switch (type) {
    case 'CYCLONE':
      return `ML model detected ${confidence}% probability of cyclone formation based on wind speed: ${pred.speed?.toFixed(1)} km/h, central pressure: ${pred.centralPressure?.toFixed(1)} hPa.`
    case 'STORM_SURGE':
      return `Elevated water levels detected with ${confidence}% risk. Current level: ${pred.waterLevel?.currentLevel?.toFixed(1)}m, wave height: ${pred.waves?.significantHeight?.toFixed(1)}m.`
    case 'COASTAL_EROSION':
      return `${confidence}% probability of significant coastal erosion. Current erosion rate: ${pred.shoreline?.erosionRate?.toFixed(2)} m/year.`
    case 'WATER_POLLUTION':
      return `Water quality degradation detected with ${confidence}% confidence. Turbidity: ${pred.waterQuality?.turbidity?.toFixed(1)} NTU, DO: ${pred.waterQuality?.dissolvedOxygen?.toFixed(1)} mg/L.`
    default:
      return `Environmental risk detected with ${confidence}% confidence based on current sensor data.`
  }
}

function ClientTimeDisplay() {
  const [time, setTime] = React.useState<string>("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="text-white/60 text-sm">
        Last updated: --:--:--
      </div>
    )
  }

  return (
    <motion.div
      className="text-white/60 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Last updated: {time}
    </motion.div>
  )
}

function Stat({
  label,
  value,
  suffix,
  good,
}: { label: string; value: number | string; suffix?: string; good?: boolean }) {
  const isNumber = typeof value === "number"
  const formatted = isNumber ? (value as number).toLocaleString(undefined, { maximumFractionDigits: 2 }) : value
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", good === true && "text-emerald-700", good === false && "text-red-600")}>
        {formatted}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </div>
  )
}

function TinySpark({ data, dataKey = "y" }: { data: any[]; dataKey?: string }) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <XAxis dataKey="x" hide />
          <YAxis hide />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-balance text-blue-900">{title}</CardTitle>
      {badge ? <Badge className="bg-blue-600 hover:bg-blue-700">{badge}</Badge> : null}
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
      {/* Coastal gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <motion.div
              className="text-2xl font-bold text-blue-400 relative flex items-center gap-3"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowLeft className="h-6 w-6" />
           Dashboard
              <motion.div
                className="absolute -inset-2 bg-blue-400/15 rounded-lg blur-sm -z-10"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>
        </nav>
      </motion.header>

      {/* Loading Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Coastal Risk <span className="text-blue-400">Live Dashboard</span>
          </h1>
          <p className="text-white/80 text-lg mb-8">Connecting to real-time monitoring streams...</p>

          <motion.div
            className="flex items-center justify-center gap-2 text-blue-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Establishing WebSocket connections</span>
          </motion.div>
        </motion.div>

        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="h-48 bg-blue-400/10 rounded-lg border border-blue-400/20 backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  // Ensure client-side hydration
  React.useEffect(() => {
    setMounted(true)

    // Prevent MetaMask auto-connection
    if (typeof window !== 'undefined') {
      // Override ethereum detection to prevent MetaMask auto-connect
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: false,
        configurable: false
      })
    }
  }, [])

  // tRPC setup
  const trpc = useTRPC()

  const mapData = useQuery({
    ...trpc.alerts.getApprovedAlerts.queryOptions({
      limit: 50,
    }),
  })
  // Real-time data states
  const [cycloneData, setCycloneData] = React.useState<CycloneData | null>(null)
  const [pollutionData, setPollutionData] = React.useState<PollutionData | null>(null)
  const [stormData, setStormData] = React.useState<StormSurgeData | null>(null)
  const [coastalData, setCoastalData] = React.useState<CoastalData | null>(null)

  // History for charts
  const [history, setHistory] = React.useState<{
    cyclone: CycloneData[]
    pollution: PollutionData[]
    storm: StormSurgeData[]
    coastal: CoastalData[]
  }>({
    cyclone: [],
    pollution: [],
    storm: [],
    coastal: [],
  })

  // Alert mutation setup
  const alertMutation = useMutation({ ...trpc.alerts.createAlert.mutationOptions(), onError: (e) => console.log(e) });

  // Subscribe to cyclone data using tRPC useSubscription
  useSubscription({
    ...trpc.cysub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newCycloneData: CycloneData = {
        centralPressure: data.centralPressure,
        speed: data.speed,
        verticalShear: data.verticalShear,
        seaSurfaceTemp: data.seaSurfaceTemp,
        cloudTopTemp: data.cloudTopTemp,
        vorticity: data.vorticity,
        convectiveActivity: data.convectiveActivity,
        humidity: data.humidity,
        precipitation: data.precipitation,
        lat: data.lat,
        lng: data.lng,
        ml_pred: data.ml_pred
      }
      setCycloneData(newCycloneData)
      setHistory(prev => ({
        ...prev,
        cyclone: [...prev.cyclone, newCycloneData].slice(-60)
      }))

      // Check for high-risk cyclone conditions and create alert
      const mlConfidence = newCycloneData.ml_pred?.val || 0;
      const windSpeedRisk = newCycloneData.speed > 120; // High wind speed
      const pressureRisk = newCycloneData.centralPressure < 980; // Low pressure indicates strong cyclone

      if (mlConfidence > 0.7 || windSpeedRisk || pressureRisk) {
        const severity = mlConfidence > 0.85 || newCycloneData.speed > 150 ? "EXTREME" :
          mlConfidence > 0.75 || newCycloneData.speed > 120 ? "HIGH" : "MODERATE";

        // Only create alert if ML confidence is above 70%
        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "CYCLONE",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Cyclone Formation Risk Detected`,
            description: `ML model detected ${Math.round(mlConfidence * 100)}% probability of cyclone formation. Wind speed: ${newCycloneData.speed.toFixed(1)} km/h, central pressure: ${newCycloneData.centralPressure.toFixed(1)} hPa, humidity: ${newCycloneData.humidity.toFixed(1)}%, sea surface temp: ${newCycloneData.seaSurfaceTemp.toFixed(1)}°C.`,
            region: data.region || "Coastal Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newCycloneData,
              riskFactors: {
                windSpeedRisk,
                pressureRisk,
                mlConfidence,
                vorticity: newCycloneData.vorticity,
                convectiveActivity: newCycloneData.convectiveActivity
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || newCycloneData.lat,
              lng: data.lng || newCycloneData.lng,
            }
          });
        }
      }
    },
    onError: (err: any) => console.error('Cyclone subscription error:', err),
  })
  // Subscribe to pollution data using tRPC useSubscription
  useSubscription({
    ...trpc.pollsub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newPollutionData: PollutionData = {
        waterQuality: {
          pH: 7.0 + (data.aqi / 200), // Convert AQI to pH approximation
          dissolvedOxygen: 8 - (data.aqi / 50), // Inverse relationship
          turbidity: data.aqi / 5, // Convert AQI to turbidity
          temperature: 25 + Math.random() * 5, // Still random for now
          conductivity: 45000 + (data.aqi * 100), // Scale with pollution
        },
        chemicals: {
          nitrateLevel: data.no2 / 10, // Convert NO2 to nitrate approx
          phosphateLevel: data.pm25 / 50, // Use PM2.5 as phosphate proxy
          hydrocarbons: data.co, // Use CO directly
        },
        biological: {
          biodiversityIndex: Math.max(0, 1 - (data.aqi / 200)), // Inverse of pollution
        },
        riskFactors: {
          overallPollutionLevel: data.aqi > 150 ? "HIGHLY_POLLUTED" : data.aqi > 100 ? "MODERATELY_POLLUTED" : "SLIGHTLY_POLLUTED",
        },
      }
      setPollutionData(newPollutionData)
      setHistory(prev => ({
        ...prev,
        pollution: [...prev.pollution, newPollutionData].slice(-60)
      }))

      // Check for high pollution levels and create alert
      const turbidityRisk = newPollutionData.waterQuality.turbidity > 20;
      const doRisk = newPollutionData.waterQuality.dissolvedOxygen < 5;
      const phRisk = newPollutionData.waterQuality.pH < 6.5 || newPollutionData.waterQuality.pH > 8.5;
      const overallRisk = newPollutionData.riskFactors.overallPollutionLevel !== "SLIGHTLY_POLLUTED";

      if (turbidityRisk || doRisk || phRisk || overallRisk) {
        const severity = newPollutionData.riskFactors.overallPollutionLevel === "HIGHLY_POLLUTED" ? "HIGH" : "MODERATE";
        const mlConfidence = Math.min(0.95, Math.max(0.5, data.aqi / 200));

        // Only create alert if ML confidence is above 70%
        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "WATER_POLLUTION",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Water Quality Degradation Alert`,
            description: `Water quality degradation detected. pH: ${newPollutionData.waterQuality.pH.toFixed(2)}, turbidity: ${newPollutionData.waterQuality.turbidity.toFixed(1)} NTU, dissolved oxygen: ${newPollutionData.waterQuality.dissolvedOxygen.toFixed(1)} mg/L, pollution level: ${newPollutionData.riskFactors.overallPollutionLevel.replace('_', ' ')}.`,
            region: data.region || "Coastal Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newPollutionData,
              riskFactors: {
                turbidityRisk,
                doRisk,
                phRisk,
                overallRisk,
                aqi: data.aqi,
                chemicals: newPollutionData.chemicals
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || 22.0,
              lng: data.lng || 72.0,
            }
          });
        }
      }
    },
    onError: (err: any) => console.error('Pollution subscription error:', err),
  })

  // Subscribe to storm surge data using tRPC useSubscription
  useSubscription({
    ...trpc.surgesub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newStormData: StormSurgeData = {
        waterLevel: {
          currentLevel: data.tideLevel + data.surgeHeight,
          predictedLevel: data.tideLevel + data.surgeHeight + 0.5,
          anomaly: data.surgeHeight,
          rateOfRise: data.surgeHeight / 10, // Approximate rate
        },
        waves: {
          significantHeight: data.waveHeight,
          period: data.wavePeriod,
        },
        meteorology: {
          windSpeed: data.windSpeed,
          atmosphericPressure: data.pressure,
        },
        impact: {
          infrastructureRisk: data.surgeHeight > 2.5 ? "HIGH" : data.surgeHeight > 1.5 ? "MODERATE" : "LOW",
        },
      }
      setStormData(newStormData)
      setHistory(prev => ({
        ...prev,
        storm: [...prev.storm, newStormData].slice(-60)
      }));
      // Check for high-risk storm surge conditions and create alert
      if (newStormData.impact.infrastructureRisk === "HIGH" || newStormData.impact.infrastructureRisk === "MODERATE") {
        const mlConfidence = Math.min(0.95, newStormData.waterLevel.anomaly / 4);

        // Only create alert if ML confidence is above 70%
        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "STORM_SURGE",
            severity: newStormData.impact.infrastructureRisk as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${newStormData.impact.infrastructureRisk} Storm Surge Warning`,
            description: `Elevated water levels detected with risk to coastal areas. Current level: ${newStormData.waterLevel.currentLevel.toFixed(1)}m, rising at ${newStormData.waterLevel.rateOfRise.toFixed(2)}m/h. Wave height: ${newStormData.waves.significantHeight.toFixed(1)}m with strong winds at ${newStormData.meteorology.windSpeed.toFixed(1)} km/h.`,
            region: data.region || "Coastal Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newStormData,
              riskFactors: {
                waterLevelRisk: newStormData.waterLevel.currentLevel > 3,
                rateOfRiseRisk: newStormData.waterLevel.rateOfRise > 0.5,
                waveHeightRisk: newStormData.waves.significantHeight > 3,
                windSpeedRisk: newStormData.meteorology.windSpeed > 60,
                infrastructureRisk: newStormData.impact.infrastructureRisk
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || 22.0,
              lng: data.lng || 72.0,
            }
          });
        }
      }
    },
    onError: (err: any) => console.error('Storm subscription error:', err),
  })

  // Subscribe to coastal erosion data using tRPC useSubscription
  useSubscription({
    ...trpc.coastalsub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newCoastalData: CoastalData = {
        shoreline: {
          erosionRate: Math.abs(data.shorelineRetreatRate),
          beachWidth: 50 - Math.abs(data.shorelineRetreatRate) * 10, // Inverse relationship
          shorelineRetreat: Math.abs(data.shorelineRetreatRate) * 5,
        },
        hydrodynamics: {
          waveEnergy: data.waveEnergy,
          waveHeight: data.waveEnergy / 20, // Convert energy to height
        },
        protection: {
          naturalBarriers: {
            vegetation: Math.max(0, 1 - (Math.abs(data.shorelineRetreatRate) / 5)), // Less erosion = more vegetation
          },
          artificialStructures: {
            effectivenessRating: 0.7, // Static for now
          },
        },
        riskFactors: {
          erosionSeverity: Math.abs(data.shorelineRetreatRate) > 3 ? "HIGH_EROSION" : Math.abs(data.shorelineRetreatRate) > 1 ? "MODERATE_EROSION" : "LOW_EROSION",
          urgencyLevel: data.erosionHazardIndex > 70 ? "HIGH" : data.erosionHazardIndex > 40 ? "MODERATE" : "LOW",
        },
      }
      setCoastalData(newCoastalData)
      setHistory(prev => ({
        ...prev,
        coastal: [...prev.coastal, newCoastalData].slice(-60)
      }))

      // Check for high coastal erosion risk and create alert
      const erosionRateRisk = newCoastalData.shoreline.erosionRate > 2;
      const beachWidthRisk = newCoastalData.shoreline.beachWidth < 20;
      const waveEnergyRisk = newCoastalData.hydrodynamics.waveEnergy > 50;
      const urgencyRisk = newCoastalData.riskFactors.urgencyLevel === "HIGH";

      if (erosionRateRisk || beachWidthRisk || waveEnergyRisk || urgencyRisk) {
        const severity = newCoastalData.riskFactors.urgencyLevel === "HIGH" ? "HIGH" :
          newCoastalData.riskFactors.urgencyLevel === "MODERATE" ? "MODERATE" : "LOW";
        const mlConfidence = Math.min(0.95, Math.max(0.5, data.erosionHazardIndex / 100));

        // Only create alert if ML confidence is above 70%
        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "COASTAL_EROSION",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Coastal Erosion Alert`,
            description: `Significant coastal erosion detected. Erosion rate: ${newCoastalData.shoreline.erosionRate.toFixed(2)} m/year, beach width: ${newCoastalData.shoreline.beachWidth.toFixed(1)}m, wave energy: ${newCoastalData.hydrodynamics.waveEnergy.toFixed(1)} kW/m, urgency level: ${newCoastalData.riskFactors.urgencyLevel}.`,
            region: data.region || "Coastal Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newCoastalData,
              riskFactors: {
                erosionRateRisk,
                beachWidthRisk,
                waveEnergyRisk,
                urgencyRisk,
                erosionHazardIndex: data.erosionHazardIndex,
                vegetationCover: newCoastalData.protection.naturalBarriers.vegetation
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || 22.0,
              lng: data.lng || 72.0,
            }
          });
        }
      }
    },
    onError: (err: any) => console.error('Coastal subscription error:', err),
  })

  // Create spark chart data
  const cycloneSpark = history.cyclone.map((d, i) => ({ x: i, y: d?.speed || 0 }))
  const pollutionSpark = history.pollution.map((d, i) => ({ x: i, y: d?.waterQuality?.turbidity || 0 }))
  const stormSpark = history.storm.map((d, i) => ({ x: i, y: d?.waterLevel?.currentLevel || 0 }))
  const coastalSpark = history.coastal.map((d, i) => ({ x: i, y: d?.shoreline?.erosionRate || 0 }))

  // Show loading state while waiting for subscription data
  if (!cycloneData || !pollutionData || !stormData || !coastalData) {
    return <LoadingDashboard />
  }

  const cyclone = cycloneData
  const pollution = pollutionData
  const storm = stormData
  const coastal = coastalData




  return (
    <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
      {/* Coastal gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-cyan-500/20 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 30, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-teal-400/15 to-blue-500/8 rounded-full blur-2xl"
          animate={{
            x: [0, 40, -40, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        {/* Floating coastal particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <motion.div
              className="text-2xl font-bold text-blue-400 relative flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowLeft className="h-6 w-6" />
             Dashboard
              <motion.div
                className="absolute -inset-2 bg-blue-400/15 rounded-lg blur-sm -z-10"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2 text-blue-400"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm">System Online</span>
            </motion.div>

            <ClientTimeDisplay />

            {!isLoading && isAuthenticated && <ProfileDropdown />}
          </div>
        </nav>
      </motion.header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">


        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-blue-400/10 backdrop-blur-xl border border-blue-400/20 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white text-blue-400 transition-all duration-300"
              >
                <Activity className="h-4 w-4 mr-2" />
                Live Overview
              </TabsTrigger>
              <TabsTrigger
                value="generated-alerts"
                className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white text-blue-400 transition-all duration-300"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generated Alerts
              </TabsTrigger>
              <TabsTrigger
                value="approved-alerts"
                className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white text-blue-400 transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved Alerts
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white text-blue-400 transition-all duration-300"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alert Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real-time Monitoring Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {/* Cyclone Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Card className="bg-gradient-to-br from-blue-400/15 to-cyan-400/8 backdrop-blur-xl border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-blue-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <Wind className="w-5 h-5 text-blue-400" />
                          </motion.div>
                          Cyclone Monitor
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (cyclone?.ml_pred?.val || 0) > 0.7 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                        )}>
                          {cyclone?.ml_pred?.val ? `${Math.round((cyclone.ml_pred.val as number) * 100)}% risk` : "Live"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={cycloneSpark} />
                      </div>

                      <Separator className="bg-blue-400/20" />

                      <div className="space-y-3">
                        <Stat label="Wind Speed" value={cyclone?.speed || 0} suffix="km/h" />
                        <Stat label="Central Pressure" value={cyclone?.centralPressure || 0} suffix="hPa" good={false} />
                        <Stat label="Humidity" value={cyclone?.humidity || 0} suffix="%" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Risk Level</span>
                          <span>{Math.round(((cyclone?.speed || 0) / 180) * 100)}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, ((cyclone?.speed || 0) / 180) * 100)}
                          className="h-2 bg-blue-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Storm Surge Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Card className="bg-gradient-to-br from-cyan-400/15 to-blue-500/8 backdrop-blur-xl border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Waves className="w-5 h-5 text-cyan-400" />
                          </motion.div>
                          Storm Surge
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (storm?.waterLevel?.currentLevel || 0) > 4 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        )}>
                          {storm?.impact?.infrastructureRisk || "UNKNOWN"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={stormSpark} />
                      </div>

                      <Separator className="bg-cyan-400/20" />

                      <div className="space-y-3">
                        <Stat label="Water Level" value={storm?.waterLevel?.currentLevel || 0} suffix="m" />
                        <Stat
                          label="Rate of Rise"
                          value={storm?.waterLevel?.rateOfRise || 0}
                          suffix="m/h"
                          good={(storm?.waterLevel?.rateOfRise || 0) === 0}
                        />
                        <Stat label="Wind Speed" value={storm?.meteorology?.windSpeed || 0} suffix="km/h" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Flood Risk</span>
                          <span>{Math.round(((storm?.waterLevel?.currentLevel || 0) / 6) * 100)}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, ((storm?.waterLevel?.currentLevel || 0) / 6) * 100)}
                          className="h-2 bg-cyan-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Coastal Erosion Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <Card className="bg-gradient-to-br from-emerald-400/15 to-teal-500/8 backdrop-blur-xl border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-emerald-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <MapPin className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                          Coastal Erosion
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (coastal?.shoreline?.erosionRate || 0) > 2 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        )}>
                          {coastal?.riskFactors?.urgencyLevel || "UNKNOWN"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={coastalSpark} />
                      </div>

                      <Separator className="bg-emerald-400/20" />

                      <div className="space-y-3">
                        <Stat label="Erosion Rate" value={coastal?.shoreline?.erosionRate || 0} suffix="m/yr" good={false} />
                        <Stat label="Beach Width" value={coastal?.shoreline?.beachWidth || 0} suffix="m" good />
                        <Stat label="Wave Height" value={coastal?.hydrodynamics?.waveHeight || 0} suffix="m" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Erosion Risk</span>
                          <span>{Math.min(100, Math.round((coastal?.shoreline?.erosionRate || 0) * 30))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, (coastal?.shoreline?.erosionRate || 0) * 30)}
                          className="h-2 bg-emerald-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Water Quality Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <Card className="bg-gradient-to-br from-purple-400/15 to-indigo-500/8 backdrop-blur-xl border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-purple-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          >
                            <Shield className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          Water Quality
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (pollution?.waterQuality?.turbidity || 0) > 15 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-green-500/20 text-green-300 border-green-400/30"
                        )}>
                          {pollution?.riskFactors?.overallPollutionLevel?.replace('_', ' ') || "UNKNOWN"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={pollutionSpark} />
                      </div>

                      <Separator className="bg-purple-400/20" />

                      <div className="space-y-3">
                        <Stat label="pH Level" value={pollution?.waterQuality?.pH || 0} />
                        <Stat label="Dissolved O₂" value={pollution?.waterQuality?.dissolvedOxygen || 0} suffix="mg/L" good />
                        <Stat label="Turbidity" value={pollution?.waterQuality?.turbidity || 0} suffix="NTU" good={false} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Quality Index</span>
                          <span>{Math.min(100, Math.round(((pollution?.waterQuality?.turbidity || 0) / 50) * 100))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, ((pollution?.waterQuality?.turbidity || 0) / 50) * 100)}
                          className="h-2 bg-purple-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Detailed Analysis Section */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                {/* Environmental Details */}
                <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-blue-400/5"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-blue-400" />
                      Environmental Analysis
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-blue-300 mb-3">Atmospheric Conditions</h3>
                      <Stat label="Sea Surface Temp" value={cyclone?.seaSurfaceTemp || 0} suffix="°C" />
                      <Stat label="Cloud Top Temp" value={cyclone?.cloudTopTemp || 0} suffix="°C" good />
                      <Stat label="Precipitation" value={cyclone?.precipitation || 0} suffix="mm" />
                      <Stat label="Humidity" value={cyclone?.humidity || 0} suffix="%" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-cyan-300 mb-3">Marine Conditions</h3>
                      <Stat label="Wave Period" value={storm?.waves?.period || 0} suffix="s" />
                      <Stat label="Water Temperature" value={pollution?.waterQuality?.temperature || 0} suffix="°C" />
                      <Stat label="Wave Energy" value={coastal?.hydrodynamics?.waveEnergy || 0} suffix="kW/m" />
                      <Stat label="Conductivity" value={pollution?.waterQuality?.conductivity || 0} suffix="µS/cm" />
                    </div>
                  </CardContent>
                </Card>

                {/* Protection Status */}
                <Card className="bg-gradient-to-br from-emerald-400/10 to-teal-400/5 backdrop-blur-xl border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-emerald-400/5"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      Ecosystem Protection
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-emerald-300 mb-3">Natural Barriers</h3>
                      <Stat
                        label="Vegetation Cover"
                        value={Math.round((coastal?.protection?.naturalBarriers?.vegetation || 0) * 100)}
                        suffix="%"
                        good
                      />
                      <Stat
                        label="Biodiversity Index"
                        value={Math.round((pollution?.biological?.biodiversityIndex || 0) * 100)}
                        suffix="%"
                        good
                      />
                      <Stat label="Beach Stability" value="Good" good />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-teal-300 mb-3">Infrastructure</h3>
                      <Stat
                        label="Protection Efficiency"
                        value={Math.round((coastal?.protection?.artificialStructures?.effectivenessRating || 0) * 100)}
                        suffix="%"
                      />
                      <Stat label="Early Warning" value="Active" good />
                      <Stat label="Response Ready" value="Yes" good />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="generated-alerts">
              <GeneratedAlertsSection />
            </TabsContent>

            <TabsContent value="approved-alerts">
              <ApprovedAlertsSection />
            </TabsContent>

            <TabsContent value="subscriptions">
              <StateSubscriptions />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Map Section - Show approved alerts on map */}
        <div className="mt-8">
          {mapData.isLoading ? (
            <p>Loading...</p>
          ) : (
            <DynamicAlertsMap markers={
              mapData.data?.alerts.map((a) => ({
                id: a.id,
                lat: (a.coordinates as any).lat ?? 0,
                lng: (a.coordinates as any).lng ?? 0,
                title: a.title,
                severity: a.severity,
                region: a.region,
                state: a.state,
              }))
              ??
              []} />
          )}
        </div>
      </main>
    </div>
  )
}

function GeneratedAlertsSection() {
  const trpc = useTRPC()
  const [filters, setFilters] = React.useState({
    type: undefined as 'CYCLONE' | 'STORM_SURGE' | 'COASTAL_EROSION' | 'WATER_POLLUTION' | undefined,
    severity: undefined as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | undefined,
    state: undefined as string | undefined,
    region: undefined as string | undefined,
  })

  // Fetch generated alerts with auto-refresh every 3 seconds
  const alertsQuery = useQuery({
    ...trpc.alerts.getGeneratedAlerts.queryOptions({
      limit: 50,
      ...filters,
    }),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
  })

  // Fetch alert stats with auto-refresh
  const statsQuery = useQuery({
    ...trpc.alerts.getAlertStats.queryOptions(),
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date())

  // Extract data from queries
  const alertsData = alertsQuery.data
  const alertsLoading = alertsQuery.isLoading
  const stats = statsQuery.data
  const statsLoading = statsQuery.isLoading

  // Update last refresh time when data changes
  React.useEffect(() => {
    if (alertsData || stats) {
      setLastRefresh(new Date())
    }
  }, [alertsData, stats])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: undefined,
      severity: undefined,
      state: undefined,
      region: undefined,
    })
  }

  const alerts = alertsData?.alerts || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Auto-refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Generated Alerts</h2>
          <motion.div
            className="flex items-center gap-2 text-blue-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Auto-refresh: 3s</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
            AI Generated • Pending Review
          </Badge>
          <div className="text-xs text-white/60">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-white font-medium">Filters:</h3>
            <button
              onClick={clearFilters}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Alert Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="CYCLONE">Cyclone</option>
                <option value="STORM_SURGE">Storm Surge</option>
                <option value="COASTAL_EROSION">Coastal Erosion</option>
                <option value="WATER_POLLUTION">Water Pollution</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Severity</label>
              <select
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">State</label>
              <select
                value={filters.state || 'all'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Region</label>
              <input
                type="text"
                placeholder="Filter by region..."
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/50 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-8 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-400/15 to-orange-400/8 backdrop-blur-xl border-yellow-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300">Generated Today</p>
                  <p className="text-2xl font-bold text-white">{stats.last24Hours || 0}</p>
                </div>
                <Brain className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400/15 to-red-400/8 backdrop-blur-xl border-orange-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">Pending Approval</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingApproval || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/15 to-cyan-400/8 backdrop-blur-xl border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total Generated</p>
                  <p className="text-2xl font-bold text-white">{stats.totalGenerated || 0}</p>
                </div>
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400/15 to-emerald-400/8 backdrop-blur-xl border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Approved</p>
                  <p className="text-2xl font-bold text-white">{stats.totalApproved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Generated Alerts List */}
      <div className="space-y-4">
        {alertsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div>
                          <div className="h-5 bg-white/10 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-white/10 rounded w-20"></div>
                        <div className="h-6 bg-white/10 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Generated Alerts</h3>
              <p className="text-white/60">
                {Object.values(filters).some(f => f)
                  ? "No alerts match your current filters. Try adjusting the filter criteria."
                  : "AI monitoring is active. Alerts will appear when risk thresholds are exceeded."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any, index: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AlertCard alert={alert} isGenerated={true} />
            </motion.div>
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {alertsData?.hasMore && (
        <div className="text-center">
          <button
            onClick={() => {/* Implement load more functionality */ }}
            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 transition-colors"
          >
            Load More Alerts
          </button>
        </div>
      )}
    </motion.div>
  )
}

function ApprovedAlertsSection() {
  const trpc = useTRPC()
  const [filters, setFilters] = React.useState({
    type: undefined as 'CYCLONE' | 'STORM_SURGE' | 'COASTAL_EROSION' | 'WATER_POLLUTION' | undefined,
    severity: undefined as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | undefined,
    state: undefined as string | undefined,
    region: undefined as string | undefined,
  })

  // Fetch approved alerts with auto-refresh every 3 seconds
  const alertsQuery = useQuery({
    ...trpc.alerts.getApprovedAlerts.queryOptions({
      limit: 50,
      ...filters,
    }),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
  })

  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date())

  // Extract data from queries
  const alertsData = alertsQuery.data
  const alertsLoading = alertsQuery.isLoading

  // Update last refresh time when data changes
  React.useEffect(() => {
    if (alertsData) {
      setLastRefresh(new Date())
    }
  }, [alertsData])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: undefined,
      severity: undefined,
      state: undefined,
      region: undefined,
    })
  }

  const alerts = alertsData?.alerts || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Auto-refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Approved Alerts</h2>
          <motion.div
            className="flex items-center gap-2 text-green-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Auto-refresh: 3s</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
            <CheckCircle className="h-4 w-4 mr-1" />
            Trusted & Verified
          </Badge>
          <div className="text-xs text-white/60">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-white font-medium">Filters:</h3>
            <button
              onClick={clearFilters}
              className="text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Alert Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="CYCLONE">Cyclone</option>
                <option value="STORM_SURGE">Storm Surge</option>
                <option value="COASTAL_EROSION">Coastal Erosion</option>
                <option value="WATER_POLLUTION">Water Pollution</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Severity</label>
              <select
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">State</label>
              <select
                value={filters.state || 'all'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Region</label>
              <input
                type="text"
                placeholder="Filter by region..."
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/50 focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Alerts List */}
      <div className="space-y-4">
        {alertsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div>
                          <div className="h-5 bg-white/10 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-white/10 rounded w-20"></div>
                        <div className="h-6 bg-white/10 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Approved Alerts</h3>
              <p className="text-white/60">
                {Object.values(filters).some(f => f)
                  ? "No alerts match your current filters. Try adjusting the filter criteria."
                  : "Approved alerts from admin review will appear here."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any, index: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AlertCard alert={alert} isGenerated={false} />
            </motion.div>
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {alertsData?.hasMore && (
        <div className="text-center">
          <button
            onClick={() => {/* Implement load more functionality */ }}
            className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-300 transition-colors"
          >
            Load More Alerts
          </button>
        </div>
      )}
    </motion.div>
  )
}

function AlertCard({ alert, isGenerated }: { alert: any; isGenerated: boolean }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CYCLONE': return <Wind className="h-5 w-5" />
      case 'STORM_SURGE': return <Waves className="h-5 w-5" />
      case 'COASTAL_EROSION': return <MapPin className="h-5 w-5" />
      case 'WATER_POLLUTION': return <Shield className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME': return 'from-red-500/20 to-red-600/10 border-red-400/30'
      case 'HIGH': return 'from-orange-500/20 to-orange-600/10 border-orange-400/30'
      case 'MODERATE': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-400/30'
      case 'LOW': return 'from-blue-500/20 to-blue-600/10 border-blue-400/30'
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-400/30'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'EXTREME': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'MODERATE': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'LOW': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  return (
    <Card className={`bg-gradient-to-br ${getSeverityColor(alert.severity)} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-white">
              {getAlertIcon(alert.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{alert.title}</h3>
              <p className="text-sm text-white/60">
                {alert.region} • {alert.state}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityBadge(alert.severity)}>
              {alert.severity}
            </Badge>
            {isGenerated && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                AI Generated
              </Badge>
            )}
            {!isGenerated && (
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}
          </div>
        </div>

        <p className="text-white/80 mb-4">{alert.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="text-white/60">
                ML Confidence: {Math.round((alert.mlPrediction || 0) * 100)}%
              </span>
            </div>
            {alert.coordinates && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-white/60">
                  {alert.coordinates.lat?.toFixed(2)}, {alert.coordinates.lng?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="text-white/50">
            {new Date(alert.createdAt).toLocaleString()}
          </div>
        </div>

        {alert.reviewedBy && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-white/60">
                Reviewed by {alert.reviewedBy.firstName} {alert.reviewedBy.lastName}
              </span>
              {alert.approvedAt && (
                <span className="text-white/50">
                  on {new Date(alert.approvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {alert.reviewNotes && (
              <p className="text-white/70 text-sm mt-2">{alert.reviewNotes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StateSubscriptions() {
  const trpc = useTRPC()
  const { isAuthenticated } = useKindeBrowserClient()

  // Mapping between display names and actual region data names
  const stateMapping = {
    "Gujarat": "gujarat",
    "Maharashtra": "maharashtra",
    "Goa": "goa",
    "Tamil Nadu": "tamil_nadu",
    "Kerala": "kerala",
    "Andhra Pradesh": "andhra_pradesh",
    "Odisha": "odisha",
    "West Bengal": "west_bengal",
  }

  const [states] = React.useState<string[]>([
    "Gujarat",
    "Maharashtra",
    "Goa",
    "Tamil Nadu",
    "Kerala",
    "Andhra Pradesh",
    "Odisha",
    "West Bengal",
  ])

  const [loadingState, setLoadingState] = React.useState<string | null>(null)

  // Get user subscriptions
  const subscriptionsQuery = useQuery({
    ...trpc.subscription.getUserSubscriptions.queryOptions(),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!isAuthenticated, // Only fetch if authenticated
  })

  // Create subscription mutation
  const subscribeToStateMutation = useMutation({
    ...trpc.subscription.subscribeToState.mutationOptions(),
    onSuccess: () => {
      subscriptionsQuery.refetch()
    },
    onError: (error) => {
      console.error("Failed to subscribe to state:", error)
    }
  })

  // Unsubscribe mutation  
  const unsubscribeFromStateMutation = useMutation({
    ...trpc.subscription.unsubscribeFromState.mutationOptions(),
    onSuccess: () => {
      subscriptionsQuery.refetch()
    },
    onError: (error) => {
      console.error("Failed to unsubscribe from state:", error)
    }
  })

  // Get user's current state subscriptions and map them back to display names
  const userSubscriptions = subscriptionsQuery.data?.subscriptions || []
  const subscribedStates = new Set(
    userSubscriptions
      .filter((sub: any) => sub.active)
      .map((sub: any) => {
        // Convert from database format back to display format
        const displayName = Object.keys(stateMapping).find(
          key => stateMapping[key as keyof typeof stateMapping] === sub.state
        )
        return displayName || sub.state
      })
  )

  // Real subscription management connected to database
  const toggle = async (displayState: string, next: boolean) => {
    if (!isAuthenticated) {
      console.error("User must be authenticated to manage subscriptions")
      return
    }

    setLoadingState(displayState)
    try {
      // Convert display name to database format
      const dbState = stateMapping[displayState as keyof typeof stateMapping]
      if (!dbState) {
        throw new Error(`Invalid state: ${displayState}`)
      }

      if (next) {
        await subscribeToStateMutation.mutateAsync({ state: dbState })
      } else {
        await unsubscribeFromStateMutation.mutateAsync({ state: dbState })
      }
    } catch (e) {
      console.error("Failed to toggle subscription:", e)
    } finally {
      setLoadingState(null)
    }
  }

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <SectionHeader title="State Alerts Subscriptions" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Subscribe to alerts per state. Requires authentication for server-backed subscriptions.
        </p>

        {!isAuthenticated ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please log in to manage your state alert subscriptions.
            </p>
          </div>
        ) : subscriptionsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {states.map((s) => (
              <div
                key={s}
                className="rounded-md border border-blue-100 px-3 py-2 text-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{s}</span>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {states.map((s) => {
              const active = subscribedStates.has(s)
              return (
                <button
                  key={s}
                  disabled={!!loadingState || subscriptionsQuery.isLoading}
                  onClick={() => toggle(s, !active)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm text-left transition",
                    active ? "border-blue-600 bg-blue-50 text-blue-900" : "border-blue-100 hover:bg-blue-50/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{s}</span>
                    <Badge
                      className={cn(
                        active ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                      )}
                    >
                      {loadingState === s ? "..." : active ? "Subscribed" : "Subscribe"}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Subscription Stats */}
        {!subscriptionsQuery.isLoading && userSubscriptions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Active Subscriptions:</strong> {subscribedStates.size} states
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Total regions covered: {userSubscriptions.filter((sub: any) => sub.active).length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
