import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { regions } from "../../lib/regions";

export const subscriptionRouter = createTRPCRouter({
    // Get all subscriptions for a user
    getUserSubscriptions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user?.id ?? "";
        console.log("Fetching subscriptions for userId:", userId);

        try {
            // First, find the user by email
            const user = await ctx.db.user.findUnique({
                where: { email: ctx.user?.email ?? "" },
                select: { id: true }
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
            }

            // Get all subscriptions for the user
            const subscriptions = await ctx.db.subscription.findMany({
                where: { userId: user.id, active: true }
            });

            return {
                success: true,
                subscriptions
            };
        } catch (error) {
            console.error("Error fetching user subscriptions:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch subscriptions"
            });
        }
    }),

    // Get all available regions with states
    getAvailableRegions: protectedProcedure.query(async () => {
        try {
            // Group regions by state
            const stateGroups = regions.reduce((acc, region) => {
                if (!acc[region.state]) {
                    acc[region.state] = [];
                }
                acc[region.state].push({
                    region: region.region,
                    lat: region.lat,
                    long: region.long
                });
                return acc;
            }, {} as Record<string, { region: string; lat: number; long: number }[]>);

            return {
                success: true,
                states: Object.keys(stateGroups),
                stateGroups,
                allRegions: regions
            };
        } catch (error) {
            console.error("Error fetching regions:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch regions"
            });
        }
    }),

    // Subscribe to a specific city/region
    subscribeToCity: protectedProcedure
        .input(z.object({
            state: z.string().min(2),
            city: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            

            try {
                // Validate that the region exists
                const regionExists = regions.find(r =>
                    r.state === input.state && r.region === input.city
                );

                if (!regionExists) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid region/state combination"
                    });
                }

                // First, find the user by kindeId
                const user = await ctx.db.user.findUnique({
                    where: { email: ctx.user?.email ?? "" },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Check if subscription already exists
                const existing = await ctx.db.subscription.findFirst({
                    where: {
                        userId: user.id,
                        state: input.state,
                        city: input.city
                    }
                });

                if (existing) {
                    // Update to active if exists
                    const subscription = await ctx.db.subscription.update({
                        where: { id: existing.id },
                        data: { active: true }
                    });

                    return {
                        success: true,
                        message: `Successfully subscribed to ${input.city}, ${input.state} alerts`,
                        subscription
                    };
                } else {
                    // Create new subscription
                    const subscription = await ctx.db.subscription.create({
                        data: {
                            userId: user.id,
                            state: input.state,
                            city: input.city,
                            active: true
                        }
                    });

                    return {
                        success: true,
                        message: `Successfully subscribed to ${input.city}, ${input.state} alerts`,
                        subscription
                    };
                }
            } catch (error) {
                console.error("Error subscribing to city:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to subscribe to city"
                });
            }
        }),

    // Subscribe to entire state (all cities in that state)
    subscribeToState: protectedProcedure
        .input(z.object({
            state: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            

            try {
                // Get all cities in the state
                const stateCities = regions.filter(r => r.state === input.state);

                if (stateCities.length === 0) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid state"
                    });
                }

                // First, find the user by kindeId
                const user = await ctx.db.user.findUnique({
                    where: { email: ctx.user?.email ?? "" },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Create subscriptions for all cities in the state
                let created = 0;
                for (const city of stateCities) {
                    const existing = await ctx.db.subscription.findFirst({
                        where: {
                            userId: user.id,
                            state: input.state,
                            city: city.region
                        }
                    });

                    if (existing) {
                        await ctx.db.subscription.update({
                            where: { id: existing.id },
                            data: { active: true }
                        });
                    } else {
                        await ctx.db.subscription.create({
                            data: {
                                userId: user.id,
                                state: input.state,
                                city: city.region,
                                active: true
                            }
                        });
                    }
                    created++;
                }

                return {
                    success: true,
                    message: `Successfully subscribed to all cities in ${input.state}`,
                    created
                };
            } catch (error) {
                console.error("Error subscribing to state:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to subscribe to state"
                });
            }
        }),

    // Unsubscribe from a city
    unsubscribeFromCity: protectedProcedure
        .input(z.object({
            state: z.string().min(2),
            city: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            

            try {
                // First, find the user by kindeId
                const user = await ctx.db.user.findUnique({
                    where: { email: ctx.user?.email ?? "" },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Update subscription to inactive
                await ctx.db.subscription.updateMany({
                    where: {
                        userId: user.id,
                        state: input.state,
                        city: input.city
                    },
                    data: { active: false }
                });

                return {
                    success: true,
                    message: `Successfully unsubscribed from ${input.city}, ${input.state} alerts`
                };
            } catch (error) {
                console.error("Error unsubscribing from city:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to unsubscribe from city"
                });
            }
        }),

    // Unsubscribe from entire state
    unsubscribeFromState: protectedProcedure
        .input(z.object({
            state: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            

            try {
                // First, find the user by email
                const user = await ctx.db.user.findUnique({
                    where: { email: ctx.user?.email ?? "" },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Update all state subscriptions to inactive
                const result = await ctx.db.subscription.updateMany({
                    where: {
                        userId: user.id,
                        state: input.state
                    },
                    data: { active: false }
                });

                return {
                    success: true,
                    message: `Successfully unsubscribed from all alerts in ${input.state}`,
                    count: result.count
                };
            } catch (error) {
                console.error("Error unsubscribing from state:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to unsubscribe from state"
                });
            }
        }),

    // Get subscription stats
    getSubscriptionStats: protectedProcedure.query(async ({ ctx }) => {
        


        try {
            // First, find the user by email
            const user = await ctx.db.user.findUnique({
                where: { email: ctx.user?.email ?? "" },
                select: { id: true }
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
            }

            // Get subscription stats
            const totalSubscriptions = await ctx.db.subscription.count({
                where: { userId: user.id, active: true }
            });

            const byState = await ctx.db.subscription.groupBy({
                by: ['state'],
                where: { userId: user.id, active: true },
                _count: { state: true }
            });

            return {
                success: true,
                totalSubscriptions,
                byState: byState.map(stat => ({
                    state: stat.state,
                    count: stat._count.state || 0
                }))
            };
        } catch (error) {
            console.error("Error fetching subscription stats:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch subscription stats"
            });
        }
    })
});
