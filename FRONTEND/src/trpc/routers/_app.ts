import { z } from 'zod';
import { createTRPCRouter } from '../init';
import { userRouter } from './user';
import { cycloneRouter } from './cyclone';
import { stormSurgeRouter } from './storm-surge';
import { pollutionRouter } from './pollution';
import { coastalErosionRouter } from './coastal-erosion';
import { subscriptionRouter } from './subscription';
import { cycloneRouterSubscription } from '../subscriptions/cyclone';

export const appRouter = createTRPCRouter({
    user: userRouter,
    cyclone: cycloneRouter,
    stormSurge: stormSurgeRouter,
    pollution: pollutionRouter,
    coastalErosion: coastalErosionRouter,
    subscription: subscriptionRouter,
    cysub: cycloneRouterSubscription,
});

// export type definition of API
export type AppRouter = typeof appRouter;