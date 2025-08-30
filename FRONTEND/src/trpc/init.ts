import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PrismaClient } from "@/generated/prisma"
import { headers } from "next/headers"

const prisma = new PrismaClient()
export const createTRPCContext = async (opts: { headers: Headers }) => {
    // console.log("User:", user);
    return {
        db: prisma,
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson
})

const isAuthed = t.middleware(async ({ next, ctx }) => {
    const { isAuthenticated, getUser } = getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        })
    }
    return next({
        ctx: {
            ...ctx,
            user,
            isAuthed,
        },
    })
})
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);