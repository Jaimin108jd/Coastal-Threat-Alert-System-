import { z } from 'zod';
import { createTRPCRouter } from '../init';
import { userRouter } from './user';
import { cycloneRouter } from './cyclone';
import { stormSurgeRouter } from './storm-surge';
import { pollutionRouter } from './pollution';
import { coastalErosionRouter } from './coastal-erosion';
import { subscriptionRouter } from './subscription';
import { predictionsRouter } from './predictions';
import { alertsRouter } from './alerts';
import { cycloneRouterSubscription } from '../subscriptions/cyclone';
import { pollutionRouterSubscription } from '../subscriptions/poll';
import { stormSurgeRouterSubscription } from '../subscriptions/strom';
import { coastalErosionRouterSubscription } from '../subscriptions/coastal-er';

export const appRouter = createTRPCRouter({
    user: userRouter,
    cyclone: cycloneRouter,
    stormSurge: stormSurgeRouter,
    pollution: pollutionRouter,
    coastalErosion: coastalErosionRouter,
    subscription: subscriptionRouter,
    predictions: predictionsRouter,
    alerts: alertsRouter,
    cysub: cycloneRouterSubscription,
    pollsub: pollutionRouterSubscription,
    surgesub: stormSurgeRouterSubscription,
    coastalsub: coastalErosionRouterSubscription,
});

// export type definition of API
export type AppRouter = typeof appRouter;