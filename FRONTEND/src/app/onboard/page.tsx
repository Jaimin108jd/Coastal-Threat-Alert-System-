import { Suspense } from 'react'
import StaticLayout from './components/StaticLayout'
import OnboardingForm from './components/OnboardingForm'
import { Card } from '@/components/ui/card'
import db from '@/lib/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

// List of coastal states in India
const COASTAL_STATES = [
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'goa', label: 'Goa' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
    { value: 'odisha', label: 'Odisha' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'andaman_nicobar', label: 'Andaman & Nicobar Islands' },
    { value: 'lakshadweep', label: 'Lakshadweep' },
]

// Cities for each state
const COASTAL_CITIES = [
    // Gujarat
    { value: 'porbandar', label: 'Porbandar', stateValue: 'gujarat' },
    { value: 'dwarka', label: 'Dwarka', stateValue: 'gujarat' },
    { value: 'jamnagar', label: 'Jamnagar', stateValue: 'gujarat' },
    { value: 'okha', label: 'Okha', stateValue: 'gujarat' },
    { value: 'bhavnagar', label: 'Bhavnagar', stateValue: 'gujarat' },
    { value: 'diu', label: 'Diu', stateValue: 'gujarat' },
    { value: 'veraval', label: 'Veraval', stateValue: 'gujarat' },

    // Maharashtra
    { value: 'mumbai', label: 'Mumbai', stateValue: 'maharashtra' },
    { value: 'ratnagiri', label: 'Ratnagiri', stateValue: 'maharashtra' },
    { value: 'alibag', label: 'Alibag', stateValue: 'maharashtra' },
    { value: 'murud', label: 'Murud', stateValue: 'maharashtra' },
    { value: 'harihareshwar', label: 'Harihareshwar', stateValue: 'maharashtra' },
    { value: 'ganapatipule', label: 'Ganapatipule', stateValue: 'maharashtra' },

    // Goa
    { value: 'panaji', label: 'Panaji', stateValue: 'goa' },
    { value: 'vasco_da_gama', label: 'Vasco da Gama', stateValue: 'goa' },
    { value: 'margao', label: 'Margao', stateValue: 'goa' },
    { value: 'calangute', label: 'Calangute', stateValue: 'goa' },
    { value: 'anjuna', label: 'Anjuna', stateValue: 'goa' },

    // Karnataka
    { value: 'mangalore', label: 'Mangalore', stateValue: 'karnataka' },
    { value: 'udupi', label: 'Udupi', stateValue: 'karnataka' },
    { value: 'karwar', label: 'Karwar', stateValue: 'karnataka' },
    { value: 'malpe', label: 'Malpe', stateValue: 'karnataka' },
    { value: 'gokarna', label: 'Gokarna', stateValue: 'karnataka' },

    // Kerala
    { value: 'kochi', label: 'Kochi', stateValue: 'kerala' },
    { value: 'kozhikode', label: 'Kozhikode', stateValue: 'kerala' },
    { value: 'trivandrum', label: 'Thiruvananthapuram', stateValue: 'kerala' },
    { value: 'alappuzha', label: 'Alappuzha', stateValue: 'kerala' },
    { value: 'kollam', label: 'Kollam', stateValue: 'kerala' },
    { value: 'kannur', label: 'Kannur', stateValue: 'kerala' },

    // Tamil Nadu
    { value: 'chennai', label: 'Chennai', stateValue: 'tamil_nadu' },
    { value: 'pondicherry', label: 'Pondicherry', stateValue: 'tamil_nadu' },
    { value: 'tuticorin', label: 'Tuticorin', stateValue: 'tamil_nadu' },
    { value: 'rameswaram', label: 'Rameswaram', stateValue: 'tamil_nadu' },
    { value: 'kanyakumari', label: 'Kanyakumari', stateValue: 'tamil_nadu' },
    { value: 'mahabalipuram', label: 'Mahabalipuram', stateValue: 'tamil_nadu' },

    // Andhra Pradesh
    { value: 'vishakhapatnam', label: 'Vishakhapatnam', stateValue: 'andhra_pradesh' },
    { value: 'kakinada', label: 'Kakinada', stateValue: 'andhra_pradesh' },
    { value: 'machilipatnam', label: 'Machilipatnam', stateValue: 'andhra_pradesh' },
    { value: 'nellore', label: 'Nellore', stateValue: 'andhra_pradesh' },
    { value: 'ongole', label: 'Ongole', stateValue: 'andhra_pradesh' },

    // Odisha
    { value: 'puri', label: 'Puri', stateValue: 'odisha' },
    { value: 'bhubaneswar', label: 'Bhubaneswar', stateValue: 'odisha' },
    { value: 'cuttack', label: 'Cuttack', stateValue: 'odisha' },
    { value: 'konark', label: 'Konark', stateValue: 'odisha' },
    { value: 'gopalpur', label: 'Gopalpur', stateValue: 'odisha' },
    { value: 'chilika', label: 'Chilika', stateValue: 'odisha' },

    // West Bengal
    { value: 'kolkata', label: 'Kolkata', stateValue: 'west_bengal' },
    { value: 'digha', label: 'Digha', stateValue: 'west_bengal' },
    { value: 'sundarbans', label: 'Sundarbans', stateValue: 'west_bengal' },
    { value: 'haldia', label: 'Haldia', stateValue: 'west_bengal' },
    { value: 'bakkhali', label: 'Bakkhali', stateValue: 'west_bengal' },

    // Andaman & Nicobar
    { value: 'port_blair', label: 'Port Blair', stateValue: 'andaman_nicobar' },
    { value: 'havelock', label: 'Havelock Island', stateValue: 'andaman_nicobar' },
    { value: 'neil_island', label: 'Neil Island', stateValue: 'andaman_nicobar' },
    { value: 'diglipur', label: 'Diglipur', stateValue: 'andaman_nicobar' },

    // Lakshadweep
    { value: 'kavaratti', label: 'Kavaratti', stateValue: 'lakshadweep' },
    { value: 'agatti', label: 'Agatti', stateValue: 'lakshadweep' },
    { value: 'minicoy', label: 'Minicoy', stateValue: 'lakshadweep' },
    { value: 'kalpeni', label: 'Kalpeni', stateValue: 'lakshadweep' }
]

// Static parts that can be pre-rendered at build time
export function StaticOnboardingContent() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Complete Your Profile
            </h1>
            <p className="text-white/70">
                Tell us a bit about yourself so we can provide personalized coastal threat alerts and insights for your area.
            </p>
        </div>
    )
}

// Loading UI
function FormSkeleton() {
    return (
        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm animate-pulse">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-white/10 rounded"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                </div>
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded mt-4"></div>
            </div>
        </Card>
    )
}

async function OnboardingPage() {
    // Check if user is authenticated and redirect if already onboarded
    const { getUser } = getKindeServerSession()
    const user = await getUser()

      if (!user || !user.id) {
        redirect('/auth/login')
      }

    // Check if user is already onboarded
      const dbUser = await db.user.findUnique({
        where: { kindeId: user.id },
        select: { isOnBoarded: true }
      })

      if (dbUser?.isOnBoarded) {
        redirect('/dashboard')
      }

    return (
        <StaticLayout>
            <div className="space-y-8">
                <StaticOnboardingContent />

                {/* Dynamic part with Suspense boundary for loading state */}
                <Suspense fallback={<FormSkeleton />}>
                    <OnboardingForm states={COASTAL_STATES} cities={COASTAL_CITIES} />
                </Suspense>
            </div>
        </StaticLayout>
    )
}

export default OnboardingPage