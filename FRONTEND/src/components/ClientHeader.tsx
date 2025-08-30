"use client"

import { motion } from "framer-motion"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import ProfileDropdown from "@/components/auth/ProfileDropdown"
import { Button } from "@/components/ui/button"
import { Waves, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ClientHeader() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()

  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-gray-950/90 backdrop-blur-sm border-b border-blue-500/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative">
            <Waves className="h-8 w-8 text-cyan-400" />
            <motion.div
              className="absolute inset-0 h-8 w-8 text-blue-400"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Waves className="h-8 w-8" />
            </motion.div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Coastal Alert
          </span>
        </motion.div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-800 animate-pulse rounded" />
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                >
                  Dashboard
                </Button>
              </Link>
              <ProfileDropdown />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-900 font-medium">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
