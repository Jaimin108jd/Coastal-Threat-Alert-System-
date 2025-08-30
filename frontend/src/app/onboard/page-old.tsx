"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, X } from "lucide-react"
import ProfileImagePicker from "@/components/auth/ProfileImagePicker"
import { useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";

interface FormState {
    photoUrl: string | null
    firstName: string
    lastName: string
    day: string
    month: string
    year: string
    gender: string
    role: string
}

const INITIAL_FORM_STATE: FormState = {
    photoUrl: null,
    firstName: "",
    lastName: "",
    day: "",
    month: "",
    year: "",
    gender: "",
    role: "",
}

// Separate component for Step 1
const StepOne = React.memo(({ onPhotoChange }: { onPhotoChange: (file: File | null, url?: string) => void }) => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-medium text-white mb-2">Hello!</h1>
            <p className="text-white/80 text-lg leading-relaxed">
                There are only a few steps left to become
                <br />a part of the <span className="font-medium">Friendsee community</span> 😊
            </p>
        </div>

        <div className="space-y-4">
            <p className="text-white/70 text-sm leading-relaxed">
                Upload a photo of yourself and let us know a little more about
                <br />
                you so that you can get to know other members more easily.
            </p>

            <ProfileImagePicker onImageChange={onPhotoChange} />
        </div>
    </div>
))

// Separate component for Step 2
const StepTwo = React.memo(({
    firstName,
    lastName,
    onFirstNameChange,
    onLastNameChange
}: {
    firstName: string
    lastName: string
    onFirstNameChange: (value: string) => void
    onLastNameChange: (value: string) => void
}) => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-medium text-white mb-4">What's your name?</h1>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
                Please tell us your first and last name so we can
                <br />
                personalize your experience on our platform.
            </p>
        </div>

        <div className="space-y-4">
            <div>
                <Label htmlFor="firstName" className="text-white/80 text-sm">
                    First Name
                </Label>
                <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    placeholder="Enter your first name"
                />
            </div>
            <div>
                <Label htmlFor="lastName" className="text-white/80 text-sm">
                    Last Name
                </Label>
                <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    placeholder="Enter your last name"
                />
            </div>
        </div>
    </div>
))

// Separate component for Step 3
const StepThree = React.memo(({
    day,
    month,
    year,
    onDayChange,
    onMonthChange,
    onYearChange
}: {
    day: string
    month: string
    year: string
    onDayChange: (value: string) => void
    onMonthChange: (value: string) => void
    onYearChange: (value: string) => void
}) => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-medium text-white mb-4">Are you already 18? 🔞</h1>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
                Please select your date of birth. This information will help us to
                <br />
                provide you with the best possible experience on our website.
            </p>
        </div>

        <div className="flex gap-4">
            <Select value={day} onValueChange={onDayChange}>
                <SelectTrigger className="bg-transparent border-white/20 text-white">
                    <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={month} onValueChange={onMonthChange}>
                <SelectTrigger className="bg-transparent border-white/20 text-white">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                    ].map((monthName, i) => (
                        <SelectItem key={monthName} value={String(i + 1)}>
                            {monthName}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={year} onValueChange={onYearChange}>
                <SelectTrigger className="bg-transparent border-white/20 text-white">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 80 }, (_, i) => {
                        const yearValue = new Date().getFullYear() - i
                        return (
                            <SelectItem key={yearValue} value={String(yearValue)}>
                                {yearValue}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    </div>
))

// Separate component for Step 4
const StepFour = React.memo(({
    role,
    onRoleChange
}: {
    role: string
    onRoleChange: (value: string) => void
}) => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-medium text-white mb-4">Choose your role</h1>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
                We want to give you the best possible experience on our website.
                <br />
                To do this, please select your role. This information will help
                <br />
                us better understand your needs and provide a personalised
                <br />
                service.
            </p>
        </div>

        <div className="space-y-4">
            <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className="bg-transparent border-white/20 text-white">
                    <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
))

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE)
    const totalSteps = 4;
    const router = useRouter();
    const trpc = useTRPC();
    const updateProfileMutation = useMutation(
        {
            ...trpc.user.updateUserProfile.mutationOptions(),
            onSuccess: () => {
                console.log("Profile updated successfully");
            },
            onError: (error) => {
                console.error("Error updating profile:", error);
            }
        }
    );
    const onBoardUser = useMutation(
        {
            ...trpc.user.markOnboarded.mutationOptions(),
            onSuccess: () => {
                console.log("User Onboarded");
            },
            onError: (error) => {
                console.error("Error onboarding user:", error);
            }
        }
    );
    // Update functions
    const updatePhoto = (photo: File | null, url?: string) => {
        setFormData(prev => ({ ...prev, photo, photoUrl: url || null }))
    }

    const updateFirstName = (firstName: string) => {
        setFormData(prev => ({ ...prev, firstName }))
    }

    const updateLastName = (lastName: string) => {
        setFormData(prev => ({ ...prev, lastName }))
    }

    const updateDay = (day: string) => {
        setFormData(prev => ({ ...prev, day }))
    }

    const updateMonth = (month: string) => {
        setFormData(prev => ({ ...prev, month }))
    }

    const updateYear = (year: string) => {
        setFormData(prev => ({ ...prev, year }))
    }

    const updateRole = (role: string) => {
        setFormData(prev => ({ ...prev, role }))
    }

    // Navigation
    const goNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }
    const onSubmit = () => {
        console.log("Form Submitted", formData);
        updateProfileMutation.mutateAsync({
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: "user",

        });
        onBoardUser.mutateAsync();

        // console.log(result);
    }
    // Progress Bar
    const ProgressBar = ({ step }: { step: number }) => (
        <div className="flex gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-white" : "bg-white/20"}`} />
            ))}
        </div>
    )

    // Render current step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne onPhotoChange={updatePhoto} />
            case 2:
                return (
                    <StepTwo
                        firstName={formData.firstName}
                        lastName={formData.lastName}
                        onFirstNameChange={updateFirstName}
                        onLastNameChange={updateLastName}
                    />
                )
            case 3:
                return (
                    <StepThree
                        day={formData.day}
                        month={formData.month}
                        year={formData.year}
                        onDayChange={updateDay}
                        onMonthChange={updateMonth}
                        onYearChange={updateYear}
                    />
                )
            case 4:
                return <StepFour role={formData.role} onRoleChange={updateRole} />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-800/10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

            {/* Main content container */}
            <div className="relative z-10 min-h-screen w-full justify-start flex items-center p-6">
                <div className="w-full max-w-xl md:mx-40">
                    {/* Close button */}
                    <div className="fixed top-6 right-6 flex justify-end mb-8">
                        <Button variant="ghost" size="icon" className="text-white/60 scale-125 rounded-full hover:text-white hover:bg-white/5"
                            onClick={() => {
                                router.replace("/");
                            }}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-8">
                        <p className="text-white/50 text-sm mb-4">Question {currentStep}/4</p>
                        <ProgressBar step={currentStep} />
                    </div>

                    {/* Form content */}
                    <div className="mb-12">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderCurrentStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-4">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                onClick={goBack}
                                variant="ghost"
                                className="text-white/60 hover:text-white hover:bg-white/5 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200"
                            >
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                Back
                            </Button>
                        )}

                        <Button
                            type="button"
                            onClick={currentStep === totalSteps ? onSubmit : goNext}
                            className="bg-gradient-to-r w-[150px] from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-0.5 py-3 rounded-2xl flex items-center gap-8 justify-start transition-all duration-200 shadow-lg shadow-green-500/25"

                        >
                            <div className="w-8 h-8 bg-black         rounded-full flex items-center justify-center">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            {
                                currentStep === totalSteps ? "Finish" : "Continue"
                            }
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
