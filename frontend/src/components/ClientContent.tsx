"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Star,
  Play,
  Shield,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  Waves,
  Wind,
  AlertTriangle,
  Satellite,
  Brain,
  Users,
  Globe,
  Activity,
  MapPin,
  Smartphone,
  Bell,
  Eye,
  TrendingUp,
  BarChart3
} from "lucide-react"
import Link from "next/link"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
}

interface StaticData {
  features: Array<{
    icon: string
    title: string
    description: string
    color: string
    iconColor: string
  }>
  missions: Array<{
    icon: string
    title: string
    description: string
    color: string
  }>
  steps: Array<{
    step: string
    icon: string
    title: string
    description: string
    color: string
  }>
}

export default function ClientContent({ data }: { data: StaticData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Optimized parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])

  const springY1 = useSpring(y1, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY2 = useSpring(y2, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY3 = useSpring(y3, { stiffness: 50, damping: 20, restDelta: 0.01 })

  const iconMap: { [key: string]: any } = {
    Activity,
    Brain,
    Bell,
    Users,
    Shield,
    Globe,
    TrendingUp,
    Satellite,
    BarChart3,
    Waves,
    Wind,
    AlertTriangle,
    MapPin,
    Smartphone,
    Check,
    Star
  }

  // Memoized background orbs
  const memoizedBackgroundOrbs = useMemo(() => (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-cyan-500/15 rounded-full blur-3xl"
        style={{ y: springY1 }}
        animate={{
          x: [0, 50, -25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-cyan-500/20 to-blue-600/10 rounded-full blur-3xl"
        style={{ y: springY2 }}
        animate={{
          x: [0, -60, 30, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-teal-400/15 to-blue-500/8 rounded-full blur-2xl"
        style={{ y: springY3 }}
        animate={{
          x: [0, 40, -40, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </>
  ), [springY1, springY2, springY3])

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-[#020E0E]">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />
        {memoizedBackgroundOrbs}

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
            style={{
              left: `${25 + i * 25}%`,
              top: `${35 + i * 15}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.div
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="hidden md:flex space-x-8">
            {["Features", "Impact", "How It Works"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-white/80 hover:text-blue-400 transition-colors duration-200 relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -1 }}
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full"
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>
        </nav>
      </motion.div>

      {/* Hero Section */}
      <motion.main className="relative z-10 pt-16 pb-32">
        <motion.div
          className="max-w-7xl mx-auto px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-6 py-2 bg-blue-500/20 border-blue-500/50 text-blue-400">
              <Sparkles className="w-4 h-4 mr-2" />
              Early Warning System
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Coastal Threat
            </span>
            <br />
            <span className="text-white">Alert System</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Protecting Communities and Blue Carbon Habitats in Real Time.
            AI-powered platform providing early warnings for storms, cyclones, floods, and coastal hazards.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-900 font-medium px-8 py-4 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Features Section */}
      <motion.section
        id="features"
        className="relative z-10 py-32 bg-gradient-to-b from-transparent to-blue-900/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-20" variants={staggerContainer}>
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Advanced Features
            </motion.h2>
            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Cutting-edge technology for comprehensive coastal protection and environmental monitoring
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {data.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full bg-gradient-to-br from-gray-900/50 to-blue-900/20 border-blue-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 group">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <IconComponent className={`h-7 w-7 ${feature.iconColor}`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        id="impact"
        className="relative z-10 py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-20" variants={staggerContainer}>
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Our Mission
            </motion.h2>
            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Dedicated to protecting coastal communities and preserving marine ecosystems through innovative technology
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {data.missions.map((mission, index) => {
              const IconComponent = iconMap[mission.icon]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full bg-gradient-to-br from-gray-900/30 to-blue-900/10 border-blue-500/20 backdrop-blur-sm text-center group hover:border-cyan-400/40 transition-all duration-300">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 mb-6 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 10 }}
                    >
                      <IconComponent className={`h-8 w-8 ${mission.color}`} />
                    </motion.div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{mission.title}</h3>
                    <p className="text-white/70 leading-relaxed">{mission.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        className="relative z-10 py-32 bg-gradient-to-b from-blue-900/5 to-transparent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-20" variants={staggerContainer}>
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              A comprehensive four-step process ensuring rapid threat detection and community protection
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {data.steps.map((step, index) => {
              const IconComponent = iconMap[step.icon]
              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full bg-gradient-to-br from-gray-900/40 to-blue-900/10 border-blue-500/30 backdrop-blur-sm text-center group hover:border-cyan-400/50 transition-all duration-300">
                    <motion.div
                      className="text-6xl font-black text-blue-400/20 mb-4"
                      whileHover={{ scale: 1.1 }}
                    >
                      {step.step}
                    </motion.div>
                    <motion.div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 mb-6 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <IconComponent className={`h-7 w-7 ${step.color}`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                    <p className="text-white/70 leading-relaxed">{step.description}</p>
                  </Card>
                  {index < data.steps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={staggerContainer}>
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-8 text-white"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Protect Your Coast?
            </motion.h2>
            <motion.p
              className="text-xl text-white/70 mb-12"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Join thousands of communities already using our advanced early warning system
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-900 font-medium px-12 py-4 text-lg">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
