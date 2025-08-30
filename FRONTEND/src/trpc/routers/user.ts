import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { fetchKindeUser, updateKindeUser, validateKindeConfig } from "@/lib/kinde-api";

export const userRouter = createTRPCRouter({
    updateUserProfile: protectedProcedure
        .input(z.object({
            first_name: z.string().min(2).max(100).optional(),
            last_name: z.string().min(2).max(100).optional(),
            phone: z.string().min(10).max(15).optional(),
            city: z.string().min(2).max(100).optional(),
            state: z.string().min(2).max(100).optional(),
            role: z.enum(["user", "admin"]).optional(),
        })).mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });
            }

            // Validate configuration
            const configValidation = validateKindeConfig();
            if (!configValidation.isValid) {
                console.error('Kinde configuration errors:', configValidation.errors);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Server configuration error"
                });
            }

            console.log(`Updating user ${userId} with data:`, input);

            try {
                // Update user in Kinde API
                const updateResult = await updateKindeUser(userId, {
                    given_name: input.first_name,
                    family_name: input.last_name,
                });

                // if (!updateResult.success) {
                //     console.error('Failed to update user in Kinde:', updateResult.error);
                //     throw new TRPCError({
                //         code: "INTERNAL_SERVER_ERROR",
                //         message: `Failed to update user profile: ${updateResult.error}`
                //     });
                // }

                console.log("User profile updated successfully:", updateResult.data);

                // Update local database if you have user data stored locally
                try {
                    if (input.first_name || input.last_name || input.phone || input.city || input.state) {
                        await ctx.db.user.upsert({
                            where: { kindeId: userId },
                            update: {
                                ...(input.first_name && { firstName: input.first_name }),
                                ...(input.last_name && { lastName: input.last_name }),
                                ...(input.phone && { phone: input.phone }),
                                ...(input.city && { city: input.city }),
                                ...(input.state && { state: input.state }),

                            },
                            create: {
                                kindeId: userId,
                                firstName: input.first_name || ctx.user?.given_name || 'Unknown',
                                lastName: input.last_name || ctx.user?.family_name || 'User',
                                phone: input.phone || '',
                                city: input.city || '',
                                state: input.state || '',
                                email: ctx.user?.email || '',
                            }
                        });
                    }
                } catch (dbError) {
                    // Log but don't fail the request if local DB update fails
                    console.warn("Failed to update local user record:", dbError);
                }

                return {
                    success: true,
                    message: "Updated User Profile",
                    data: updateResult.data
                };
            } catch (error) {
                console.error("Error updating user profile:", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unexpected error while updating user profile"
                });
            }
        }),


    markOnboarded: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });
        }

        try {
            await ctx.db.user.upsert({
                where: { kindeId: userId },
                update: { isOnBoarded: true },
                create: {
                    kindeId: userId,
                    email: ctx.user?.email || '',
                    firstName: ctx.user?.given_name || 'Unknown',
                    lastName: ctx.user?.family_name || 'User',
                    city: '',
                    state: '',
                    phone: '',
                    isOnBoarded: true,
                }
            });

            return { success: true, message: "User marked as onboarded" };
        } catch (error) {
            console.error("Error marking user as onboarded:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to mark user as onboarded"
            });
        }
    }),
});