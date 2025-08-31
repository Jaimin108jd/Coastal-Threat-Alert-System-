import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generateCoastalErosionData(region: { region: string; state: string; lat: number; long: number }) {
    return {
        shorelineRetreatRate: -2 + Math.random() * 5, // m/yr (-2 retreat to +3 accretion)
        erosionHazardIndex: Math.round(10 + Math.random() * 90), // 10..100
        sedimentBudget: -5000 + Math.random() * 10000, // m3/yr
        waveEnergy: 5 + Math.random() * 40, // kW/m proxy
        seaLevelRiseRate: 2 + Math.random() * 6, // mm/yr
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
    }
}

export const coastalErosionRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generateCoastalErosionData(region)
                    emit.next({ data: { ...payload, loc: region } })
                    await new Promise((r) => setTimeout(r, 10000))
                }
            }

            loop()
            return () => {
                isActive = false
            }
        })
    }),
})
