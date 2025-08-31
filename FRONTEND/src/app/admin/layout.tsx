import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Dashboard - Coastal Threat Alert System",
    description: "Admin dashboard for managing and approving environmental threat alerts",
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
    }) {
    
    return children
}
