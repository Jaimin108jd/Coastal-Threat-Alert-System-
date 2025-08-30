import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const subscriptionRouter = createTRPCRouter({
    // Get all subscriptions for a user
    getUserSubscriptions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });
        }

        try {
            // First, find the user by kindeId
            const user = await ctx.db.user.findUnique({
                where: { kindeId: userId },
                select: { id: true }
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
            }

            // Get all subscriptions for the user
            const subscriptions = await ctx.db.subscription.findMany({
                where: { userId: user.id }
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

    // Subscribe to a state
    subscribeToState: protectedProcedure
        .input(z.object({
            state: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });
            }

            try {
                // First, find the user by kindeId
                const user = await ctx.db.user.findUnique({
                    where: { kindeId: userId },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Create subscription (or activate if it already exists)
                const subscription = await ctx.db.subscription.upsert({
                    where: {
                        userId_state: {
                            userId: user.id,
                            state: input.state
                        }
                    },
                    update: { active: true },
                    create: {
                        userId: user.id,
                        state: input.state,
                        active: true
                    }
                });

                return {
                    success: true,
                    message: "Successfully subscribed to state alerts",
                    subscription
                };
            } catch (error) {
                console.error("Error subscribing to state:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to subscribe to state"
                });
            }
        }),

    // Unsubscribe from a state
    unsubscribeFromState: protectedProcedure
        .input(z.object({
            state: z.string().min(2)
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });
            }

            try {
                // First, find the user by kindeId
                const user = await ctx.db.user.findUnique({
                    where: { kindeId: userId },
                    select: { id: true }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found in database" });
                }

                // Update subscription to inactive
                const subscription = await ctx.db.subscription.update({
                    where: {
                        userId_state: {
                            userId: user.id,
                            state: input.state
                        }
                    },
                    data: { active: false }
                });

                return {
                    success: true,
                    message: "Successfully unsubscribed from state alerts",
                    subscription
                };
            } catch (error) {
                console.error("Error unsubscribing from state:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to unsubscribe from state"
                });
            }
        })
});
