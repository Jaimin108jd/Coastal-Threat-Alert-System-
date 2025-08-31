import { observable } from "@trpc/server/observable";
import { createTRPCRouter, publicProcedure } from "../init";
import { regions } from "@/lib/regions";

function getRandomLocation() {
    const idx = Math.floor(Math.random() * regions.length);
    return regions[idx];
}

function generateCycloneData(region: { region: string; state: string; lat: number; long: number }) {
    return {
        centralPressure: 980 + (Math.random() - 0.5) * 10,
        speed: 100 + Math.random() * 60,
        verticalShear: 10 + Math.random() * 10,
        seaSurfaceTemp: 28 + Math.random() * 3,
        cloudTopTemp: -60 - Math.random() * 10,
        vorticity: 0.001 + Math.random() * 0.002,
        convectiveActivity: 0.5 + Math.random() * 0.5,
        humidity: 70 + Math.random() * 15,
        precipitation: 40 + Math.random() * 20,
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
    };
}

export const cycloneRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true;

            const loop = async () => {
                while (isActive) {
                    console.log("📡 Request triggered");

                    const input = getRandomLocation();
                    const fakeData = generateCycloneData(input);

                    let finalData: any = null;

                    try {
                        const res = await fetch("https://scx7v12m-8000.inc1.devtunnels.ms/predict", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({
                                central_pressure: fakeData.centralPressure,
                                wind_speed: fakeData.speed,
                                wind_shear: fakeData.verticalShear,
                                sea_surface_temp: fakeData.seaSurfaceTemp,
                                cloud_top_temp: fakeData.cloudTopTemp,
                                vorticity: fakeData.vorticity,
                                convective_activity: fakeData.convectiveActivity,
                                humidity: fakeData.humidity,
                                precipitation: fakeData.precipitation,
                            }),
                        });

                        if (res.ok) {
                            try {
                                finalData = await res.json();
                            } catch (err) {
                                console.warn("⚠️ Could not parse JSON:", err);
                            }
                        } else {
                            console.warn("⚠️ API returned non-OK status:", res.status);
                        }
                    } catch (err) {
                        console.error("❌ Fetch failed:", err);
                    }

                    emit.next({
                        data: {
                            ...fakeData,
                            loc: input,
                            ml_pred: {
                                val: finalData?.cyclone_formation_probability ?? null,
                            },
                        },
                    });

                    // ⏳ wait 2s before looping again
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            };

            loop();

            return () => {
                isActive = false;
            };
        });
    }),
});
