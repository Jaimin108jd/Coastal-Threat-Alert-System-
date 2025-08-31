import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generateStormSurgeData(region: { region: string; state: string; lat: number; long: number }) {
    return {
        tideLevel: 0.5 + Math.random() * 2.5, // m
        surgeHeight: 0.2 + Math.random() * 3.0, // m
        waveHeight: 0.5 + Math.random() * 4.0, // m
        wavePeriod: 4 + Math.random() * 10, // s
        windSpeed: 5 + Math.random() * 60, // knots
        pressure: 990 + (Math.random() - 0.5) * 20, // hPa
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
    }
}

export const stormSurgeRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generateStormSurgeData(region)
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
