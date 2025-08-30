"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, Mail, Camera, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import ProfileImagePicker from "@/components/auth/ProfileImagePicker"
import { Toaster, toast } from "sonner"

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

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function ProfilePage() {
    const router = useRouter()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [isFormChanged, setIsFormChanged] = useState(false)

    // tRPC setup
    const trpc = useTRPC()

    // Queries and mutations
    const { data: currentUser, isLoading: userLoading, refetch } = useQuery({
        ...trpc.user.getCurrentUser.queryOptions(),
    })

    const updateProfile = useMutation({
        ...trpc.user.updateUserProfile.mutationOptions(),
        onSuccess: () => {
            toast.success("Profile updated successfully!")
            setIsFormChanged(false)
            refetch()
        },
        onError: (error: any) => {
            toast.error(`Failed to update profile: ${error.message}`)
        }
    })

    // Initialize form with current user data
    useEffect(() => {
        if (currentUser) {
            setFirstName(currentUser.firstName || "")
            setLastName(currentUser.lastName || "")
            setProfileImage(currentUser.picture || null)
        }
    }, [currentUser])

    // Track form changes
    useEffect(() => {
        if (currentUser) {
            const hasChanges =
                firstName !== (currentUser.firstName || "") ||
                lastName !== (currentUser.lastName || "") ||
                profileImage !== (currentUser.picture || null)
            setIsFormChanged(hasChanges)
        }
    }, [firstName, lastName, profileImage, currentUser])

    const handleImageChange = (file: File | null, url?: string) => {
        if (url) {
            setProfileImage(url)
        } else {
            setProfileImage(null)
        }
    }

    const handleSaveProfile = async () => {
        if (!isFormChanged) return

        try {
            await updateProfile.mutateAsync({
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                image_url: profileImage || undefined,
            })
        } catch (error) {
            console.error("Error updating profile:", error)
        }
    }

    const handleBack = () => {
        if (isFormChanged) {
            const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?")
            if (!confirmLeave) return
        }
        router.back()
    }

    if (userLoading) {
        return (
            <div className="min-h-screen bg-[#020E0E] flex items-center justify-center">
                <motion.div
                    className="flex items-center gap-3 text-[#01DE82]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Loading profile...</span>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
            <Toaster position="top-right" />
            {/* Background with animated orbs */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />

                {/* Background orbs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-[#01DE82]/15 to-[#05614B]/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, -15, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-3/4 right-1/4 w-[250px] h-[250px] bg-gradient-to-l from-[#05614B]/15 to-[#01DE82]/8 rounded-full blur-3xl"
                    animate={{
                        x: [0, -40, 20, 0],
                        scale: [1, 0.8, 1.2, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
                {/* Header with back button */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white/80 hover:text-[#01DE82] transition-colors duration-200 mb-6 group"
                        whileHover={{ x: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:text-[#01DE82] transition-colors" />
                        <span>Back</span>
                    </motion.button>

                    <div className="text-center">
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold text-white mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Edit <span className="text-[#01DE82]">Profile</span>
                        </motion.h1>
                        <motion.p
                            className="text-white/70 text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Update your personal information
                        </motion.p>
                    </div>
                </motion.div>

                {/* Profile Form */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Profile Image Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-8 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-[#01DE82]/5"
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                            <div className="relative z-10">
                                <ProfileImagePicker
                                    onImageChange={handleImageChange}
                                    initialPreview={profileImage || undefined}
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Personal Information */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-8 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-[#01DE82]/5"
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                            />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#01DE82]/20 rounded-lg">
                                        <User className="h-5 w-5 text-[#01DE82]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-white text-sm font-medium">
                                            First Name
                                        </Label>
                                        <motion.div
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Enter your first name"
                                                className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20 backdrop-blur-sm"
                                            />
                                        </motion.div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-white text-sm font-medium">
                                            Last Name
                                        </Label>
                                        <motion.div
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Enter your last name"
                                                className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20 backdrop-blur-sm"
                                            />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white text-sm font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <Input
                                            id="email"
                                            value={currentUser?.email || ""}
                                            disabled
                                            className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/70 pl-10 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-white/50 text-xs">Email cannot be changed</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex gap-4 justify-end"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="border-[#01DE82]/30 text-white hover:bg-[#01DE82]/10 bg-transparent backdrop-blur-sm px-6"
                            >
                                Cancel
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: isFormChanged ? 1.05 : 1 }}
                            whileTap={{ scale: isFormChanged ? 0.95 : 1 }}
                        >
                            <Button
                                onClick={handleSaveProfile}
                                disabled={!isFormChanged || updateProfile.isPending}
                                className="bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] disabled:opacity-50 disabled:cursor-not-allowed px-6 font-semibold"
                            >
                                {updateProfile.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Save Indicator */}
                    {isFormChanged && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-2 text-[#01DE82]/80 text-sm"
                        >
                            <motion.div
                                className="w-2 h-2 bg-[#01DE82] rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span>You have unsaved changes</span>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
