"use client";
import { useTRPC } from '@/trpc/client'
import React from 'react'
import { useSubscription } from '@trpc/tanstack-react-query';
const page = () => {
    const trpc = useTRPC();
    const sub = useSubscription({
        ...trpc.cysub.onLiveData.subscriptionOptions(),
        onData: (data) => {
            console.log("Data", data)
        }
    })
    return (
        <div>page</div>
    )
}

export default page