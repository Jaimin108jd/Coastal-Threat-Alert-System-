"use client"

import React, { useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import Plasma from '@/components/utils/plasma';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Anti-flicker cursor follower with direct DOM manipulation
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                // Use requestAnimationFrame for smooth performance
                requestAnimationFrame(() => {
                    if (cursorRef.current) {
                        cursorRef.current.style.transform = `translate3d(${e.clientX - 100}px, ${e.clientY - 100}px, 0)`
                    }
                })
            }
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true })

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#020E0E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Anti-flicker cursor follower */}
            <div
                ref={cursorRef}
                className="fixed w-48 h-48 pointer-events-none z-[10000] will-change-transform"
                style={{
                    left: 0,
                    top: 0,
                    transform: 'translate3d(-100px, -100px, 0)',
                    isolation: 'isolate',
                }}
            >
                <div
                    className="w-full h-full rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(16, 69, 138, 0.15) 50%, transparent 70%)',
                        animation: 'cursor-pulse 3s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute inset-8 rounded-full blur-2xl opacity-25"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 60%)',
                        animation: 'cursor-pulse 3s ease-in-out infinite 0.5s'
                    }}
                />

                <style jsx>{`
                    @keyframes cursor-pulse {
                        0%, 100% { transform: scale(1); opacity: 0.15; }
                        50% { transform: scale(1.1); opacity: 0.3; }
                    }
                `}</style>
            </div>

            {/* Calm animated gradient background */}
            <div
                className="fixed inset-0"

            >
                <Plasma
                    color="#3b82f6"
                    speed={0.6}
                    direction="forward"
                    scale={1.3}
                    opacity={0.25}
                    mouseInteractive={false}
                />

            </div>
            {/* Animated background orbs for depth
            <div className="absolute inset-0 overflow-hidden">
                {/* Top-right animated orb */}
            <motion.div
                className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#3b82f6]/10 to-[#1e40af]/5 blur-3xl"
                animate={{
                    // x: [0, 50, -25, 0],
                    // y: [0, -30, 20, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Bottom-left animated orb */}
            <motion.div
                className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-[#1e40af]/10 to-[#3b82f6]/5 blur-3xl"
                animate={{
                    //     x: [0, -60, 30, 0],
                    //     y: [0, 40, -20, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Center animated orb */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-[#3b82f6]/8 to-transparent blur-2xl"
                animate={{
                    x: [0, 40, -40, 0],
                    y: [0, -25, 25, 0],
                    scale: [1, 1.3, 0.8, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4,
                }}
            />
            {/* </div> */}

            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    );
}
