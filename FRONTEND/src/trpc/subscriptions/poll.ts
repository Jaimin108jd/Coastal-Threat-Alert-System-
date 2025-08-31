import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generatePollutionData(region: { region: string; state: string; lat: number; long: number }) {
    const pm25 = 5 + Math.random() * 75 // μg/m3
    const pm10 = 10 + Math.random() * 120
    const no2 = 5 + Math.random() * 80
    const so2 = 2 + Math.random() * 30
    const o3 = 20 + Math.random() * 120
    const co = 0.2 + Math.random() * 3
    const aqi = Math.round(Math.max(pm25 / 0.5, pm10 / 1, no2 / 0.8, o3 / 1.2, so2 / 0.3, co / 0.03))
    return {
        aqi,
        pm25,
        pm10,
        no2,
        so2,
        o3,
        co,
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
    }
}

export const pollutionRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generatePollutionData(region)
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
