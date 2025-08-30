"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ArrowRight, X, MapPin, Phone, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"

interface FormData {
    firstName: string
    lastName: string
    phone: string
    city: string
    state: string
}

interface State {
    value: string
    label: string
}

interface City {
    value: string
    label: string
    stateValue: string
}

interface OnboardingFormProps {
    states: State[]
    cities: City[]
}

export default function OnboardingForm({ states, cities }: OnboardingFormProps) {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        state: ''
    })

    const [filteredCities, setFilteredCities] = useState<City[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const trpc = useTRPC()

    // Filter cities based on selected state
    useEffect(() => {
        if (formData.state) {
            const citiesInState = cities.filter(city => city.stateValue === formData.state)
            setFilteredCities(citiesInState)

            // Reset city if current city is not in the selected state
            if (formData.city && !citiesInState.some(city => city.value === formData.city)) {
                setFormData(prev => ({ ...prev, city: '' }))
            }
        } else {
            setFilteredCities([])
            // Reset city when no state is selected
            if (formData.city) {
                setFormData(prev => ({ ...prev, city: '' }))
            }
        }
    }, [formData.state, cities])

    // tRPC mutations
    const updateProfileMutation = useMutation({
        ...trpc.user.updateUserProfile.mutationOptions(),
        onSuccess: () => {
            console.log("Profile updated successfully")
        },
        onError: (error) => {
            console.error("Error updating profile:", error)
            setIsSubmitting(false)
        }
    })

    const markOnboardedMutation = useMutation({
        ...trpc.user.markOnboarded.mutationOptions(),
        onSuccess: () => {
            console.log("User marked as onboarded")
            setIsSubmitting(false)
            router.push('/dashboard')
        },
        onError: (error) => {
            console.error("Error marking user as onboarded:", error)
            setIsSubmitting(false)
        }
    })

    const handleInputChange = (field: keyof FormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim() || !formData.city || !formData.state) {
            alert('Please fill in all fields')
            return
        }

        setIsSubmitting(true)

        try {
            // Update profile
            await updateProfileMutation.mutateAsync({
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                phone: formData.phone.trim(),
                city: formData.city,
                state: formData.state,
                role: "user"
            })

            // Mark as onboarded
            await markOnboardedMutation.mutateAsync()
        } catch (error) {
            console.error('Error during onboarding:', error)
            setIsSubmitting(false)
        }
    }

    const isFormValid = formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.phone.trim() &&
        formData.city &&
        formData.state

    return (
        <div className="space-y-8">
            {/* Close button */}
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white hover:bg-white/5 rounded-full"
                    onClick={() => router.push('/')}
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Form */}
            <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-white/80 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName')(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                placeholder="Enter your first name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-white/80 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName')(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                placeholder="Enter your last name"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/80 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone')(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="flex gap-4 ">
                        {/* State Field */}
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-white/80 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                State
                            </Label>
                            <Select value={formData.state} onValueChange={handleInputChange('state')}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select your state" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.value} value={state.value}>
                                            {state.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City Field */}
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-white/80 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                City
                            </Label>
                            <Select
                                value={formData.city}
                                onValueChange={handleInputChange('city')}
                                disabled={!formData.state || filteredCities.length === 0}
                            >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder={formData.state ? "Select your city" : "First select a state"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCities.map((city) => (
                                        <SelectItem key={city.value} value={city.value}>
                                            {city.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Complete Profile
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Info */}
            <div className="text-center text-white/60 text-sm">
                This information helps us provide personalized coastal threat alerts for your area.
            </div>
        </div>
    )
}
