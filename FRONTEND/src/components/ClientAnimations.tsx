"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"

interface ClientAnimationsProps {
  children: React.ReactNode
}

export default function ClientAnimations({ children }: ClientAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])

  // Spring physics for smoother animations
  const springY1 = useSpring(y1, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY2 = useSpring(y2, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY3 = useSpring(y3, { stiffness: 50, damping: 20, restDelta: 0.01 })

  return (
    <div ref={containerRef}>
      {/* Background Animations */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: springY1 }}
      >
        <motion.div
          className="absolute top-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: springY2 }}
      >
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: springY3 }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-3xl"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      </motion.div>

      {children}
    </div>
  )
}
