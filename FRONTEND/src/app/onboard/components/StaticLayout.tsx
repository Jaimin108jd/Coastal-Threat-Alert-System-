// Static layout component - Pre-rendered at build time
export default function StaticLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
            {/* Static background gradient - Generated at build time */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-800/10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

            {/* Main content container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    {children}
                </div>
            </div>
        </div>
    )
}
