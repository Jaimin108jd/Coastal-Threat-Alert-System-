"use client"

import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
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
import { useRef, useEffect, useState, useMemo, useCallback } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import ProfileDropdown from "@/components/auth/ProfileDropdown"


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


export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  // Optimized parallax transforms with reduced calculations
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])

  // Reduce spring stiffness for better performance
  const springY1 = useSpring(y1, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY2 = useSpring(y2, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY3 = useSpring(y3, { stiffness: 50, damping: 20, restDelta: 0.01 })

  // Memoize background orbs with coastal theme
  const memoizedBackgroundOrbs = useMemo(() => (
    <>
      {/* Primary animated orb - Ocean Blue */}
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

      {/* Secondary animated orb - Deep Ocean */}
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

      {/* Tertiary animated orb - Coastal Teal */}
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
      {/* Coastal gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />
        {memoizedBackgroundOrbs}

        {/* Floating coastal particles */}
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

      {/* Optimized Header with reduced micro-interactions */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <motion.div
            className="text-2xl font-bold text-blue-400 relative"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Coastal Threat Alert
            <motion.div
              className="absolute -inset-2 bg-blue-400/15 rounded-lg blur-sm -z-10"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

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

          {!isLoading && !isAuthenticated && (<div className="flex gap-2">
            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 cursor-pointer bg-transparent backdrop-blur-sm relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-400/15"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10">Login</span>
                </Button>
              </motion.div>
            </Link>
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 cursor-pointer bg-transparent backdrop-blur-sm relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-400/15"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10">Register</span>
                </Button>
              </motion.div>
            </Link>

          </div>)}
          {isLoading && <p>Loading...</p>}
          {!isLoading && isAuthenticated && (<ProfileDropdown />)}
        </nav>
      </motion.header>

      {/* Enhanced Hero Section with advanced animations */}
      <motion.section
        className="relative z-10 px-6 py-20 text-center max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Badge className="mb-6 bg-blue-400/10 text-blue-400 border-blue-400/30 hover:bg-blue-400/20 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                AI-powered coastal protection
              </span>
            </Badge>
          </motion.div>

          {/* Title for Coastal Threat Alert System */}
          <div className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            {["Coastal", "Threat", "Alert"].map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                className="inline-block mr-4 text-white"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: wordIndex * 0.08, duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_100%]"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            >
              System
            </motion.span>
          </div>

          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Protecting Communities and Blue Carbon Habitats in Real Time with AI-powered platform providing early warnings for storms, cyclones, floods, and coastal hazards.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-cyan-500 hover:to-blue-500 text-lg px-8 py-4 font-semibold shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    View Dashboard
                    <Activity className="h-5 w-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 text-lg px-8 py-4 bg-transparent backdrop-blur-sm relative overflow-hidden group"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <motion.div
                  className="absolute inset-0 bg-blue-400/5"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Learn More
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Coastal Monitoring Visual */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -5 }}
        >
          <div className="bg-blue-400/5 backdrop-blur-xl rounded-3xl p-8 border border-blue-400/20 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400/8 to-transparent"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/8 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="text-blue-400 text-lg font-semibold relative z-10 text-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                Real-Time Coastal Monitoring
              </motion.div>

              {/* Floating coastal monitoring elements */}
              {[Waves, Wind, AlertTriangle].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute text-blue-400/30"
                  style={{
                    left: `${30 + index * 25}%`,
                    top: `${40 + index * 10}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2 + index * 0.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Our{" "}
            <span className="text-blue-400">System</span> Matters
          </motion.h2>
          <motion.p
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Advanced AI-powered monitoring for coastal communities and marine ecosystems
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Activity className="h-8 w-8" />,
              title: "Real-Time Monitoring",
              description:
                "Integrates data from tide gauges, weather stations, and satellites to detect anomalies as they happen.",
              color: "from-blue-400/20 to-cyan-400/10",
              iconColor: "text-blue-400"
            },
            {
              icon: <Brain className="h-8 w-8" />,
              title: "Predictive Alerts",
              description:
                "Our AI/ML models analyze trends and predict storm surges, cyclones, flooding, and coastal pollution events.",
              color: "from-cyan-400/20 to-blue-400/10",
              iconColor: "text-cyan-400"
            },
            {
              icon: <Bell className="h-8 w-8" />,
              title: "Multi-Channel Notifications",
              description:
                "Alerts are sent via SMS, mobile app push notifications, and web dashboards to the right authorities and communities.",
              color: "from-blue-500/20 to-cyan-500/10",
              iconColor: "text-blue-500"
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Community Protection",
              description:
                "Supports disaster management, local governments, NGOs, and fisherfolk in timely decision-making and evacuation planning.",
              color: "from-cyan-500/20 to-blue-500/10",
              iconColor: "text-cyan-500"
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -10,
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-gradient-to-br ${feature.color} backdrop-blur-xl border-blue-400/20 p-8 h-full hover:border-blue-400/40 transition-all duration-300 relative overflow-hidden group`}>
                <motion.div
                  className="absolute inset-0 bg-blue-400/5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className={`${feature.iconColor} mb-4 relative z-10`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-4 relative z-10">{feature.title}</h3>
                <p className="text-white/80 relative z-10">{feature.description}</p>

                {/* Floating particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-blue-400/60 rounded-full"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Impact Section */}
      <motion.section
        id="impact"
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.p
            className="text-white/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Mission:{" "}
            <motion.span
              className="text-blue-400 font-semibold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Safety, Sustainability, Resilience
            </motion.span>
          </motion.p>

          {/* Mission Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Protect Lives",
                description: "Early warnings enable quick response, reducing casualties and economic losses in vulnerable coastal communities.",
                color: "text-blue-400"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Preserve Ecosystems",
                description: "Safeguards essential blue carbon habitats from avoidable degradation and pollution.",
                color: "text-cyan-400"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Enable Informed Management",
                description: "Provides actionable insights for authorities and NGOs, supporting sustainable coastal management and long-term community resilience.",
                color: "text-blue-500"
              }
            ].map((mission, index) => (
              <motion.div
                key={mission.title}
                className="text-center relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`${mission.color} mb-4 mx-auto w-fit`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  {mission.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">{mission.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{mission.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20 p-8 max-w-2xl mx-auto relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-blue-400/5"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className="flex justify-center mb-4 relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <Star className="h-5 w-5 text-blue-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>

              <blockquote className="text-xl text-white mb-6 italic relative z-10">
                "This coastal alert system saved our fishing community during Cyclone Tauktae. The{" "}
                <span className="text-blue-400 font-semibold">early warning</span> gave us enough time to{" "}
                <span className="text-blue-400 font-semibold">evacuate safely</span>. It's absolutely life-changing."
              </blockquote>

              <div className="text-white/80 relative z-10">
                <div className="font-semibold text-blue-400">Ramesh Patel</div>
                <div className="text-sm">Fisherman, Porbandar</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            From Data to <span className="text-blue-400">Action</span>
          </motion.h2>
          <motion.p
            className="text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Four steps to comprehensive coastal protection
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              icon: <Satellite className="h-8 w-8" />,
              title: "Data Collection",
              description: "Tide gauges, weather stations, satellites, and historical records feed the system continuously.",
              color: "text-blue-400"
            },
            {
              step: "02",
              icon: <Brain className="h-8 w-8" />,
              title: "AI & ML Analysis",
              description: "Anomaly detection and predictive models analyze environmental trends, identifying potential threats before they escalate.",
              color: "text-blue-400"
            },
            {
              step: "03",
              icon: <Bell className="h-8 w-8" />,
              title: "Alert Dissemination",
              description: "Automated alerts reach authorities and communities through SMS, mobile apps, and web dashboards.",
              color: "text-blue-500"
            },
            {
              step: "04",
              icon: <BarChart3 className="h-8 w-8" />,
              title: "Dashboard & Visualization",
              description: "Interactive maps and graphs provide real-time situational awareness, enabling fast, informed decisions.",
              color: "text-blue-500"
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <motion.div
                className={`text-6xl font-bold ${step.color} mb-4 relative`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              >
                {step.step}
                <motion.div
                  className={`absolute inset-0 ${step.color}/10 blur-2xl`}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
              </motion.div>

              <motion.div
                className={`${step.color} mb-4 mx-auto w-fit`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
              >
                {step.icon}
              </motion.div>

              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{step.description}</p>

              {/* Connection line to next step */}
              {index < 3 && (
                <motion.div
                  className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  viewport={{ once: true }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        className="relative z-10 px-6 py-20 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20 p-12 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Floating coastal elements */}
            {[Waves, Wind, AlertTriangle].map((Icon, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}

            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Stay Ahead of{" "}
              <motion.span
                className="text-blue-400"
                animate={{ textShadow: ["0 0 10px #60A5FA", "0 0 20px #60A5FA", "0 0 10px #60A5FA"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Coastal Threats
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-xl text-white/80 mb-8 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Protect your community and environment with real-time alerts and insights.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-cyan-500 hover:to-blue-500 text-lg px-8 py-4 font-semibold shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Access Dashboard</span>
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 text-lg px-8 py-4 bg-transparent backdrop-blur-sm relative overflow-hidden"
                  onClick={() => alert('Alert subscription feature coming soon!')}
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-400/5"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Subscribe to Alerts
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-white/60 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                "Real-time monitoring",
                "AI-powered predictions",
                "Community alerts"
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <Check className="h-4 w-4 text-blue-400" />
                  </motion.div>
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 px-6 py-12 border-t border-blue-400/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="text-2xl font-bold text-blue-400 mb-8 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Coastal Threat Alert System
            <motion.div
              className="absolute -inset-2 bg-blue-400/10 rounded-lg blur-sm -z-10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 text-white/60 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {["Privacy Policy", "Terms of Service", "Contact", "Support"].map((link, index) => (
              <motion.a
                key={link}
                href="#"
                className="hover:text-blue-400 transition-colors relative group"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {link}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full"
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </motion.div>

          <motion.p
            className="text-white/40 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Made with � for coastal communities worldwide.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}
