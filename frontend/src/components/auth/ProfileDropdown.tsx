"use client"

import React from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    User,
    Settings,
    LogOut,
    Shield,
    Bell,
    CreditCard,
    HelpCircle,
    ChevronDown
} from "lucide-react"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
// import { useUser } from "@/hooks/use-user"

export default function ProfileDropdown() {
    const { getUser, isAuthenticated, isLoading } = useKindeBrowserClient();
    const user = getUser();

    if (isLoading) {
        return (
            <div className="h-12 w-12 rounded-xl bg-white/5 animate-pulse" />
        )
    }

    if (!isAuthenticated || !user) {
        return null
    }

    // Get user initials for fallback avatar
    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName?.charAt(0) || ""
        const last = lastName?.charAt(0) || ""
        return (first + last).toUpperCase()
    }

    const userInitials = getInitials(user.given_name, user.family_name)
    const displayName = `${user.given_name || ""} ${user.family_name || ""}`.trim() || user.email || "User"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-12 w-auto px-3 py-2 hover:bg-white/5 border border-white/10 rounded-xl transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-[#01DE82]/30">
                            <AvatarImage
                                src={user.picture || undefined}
                                alt={displayName}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-medium text-sm">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="hidden md:flex flex-col items-start text-left">
                            <span className="text-sm font-medium text-white truncate max-w-32">
                                {displayName}
                            </span>
                            <span className="text-xs text-white/60 truncate max-w-32">
                                {user.email}
                            </span>
                        </div>

                        <ChevronDown className="h-4 w-4 text-white/60 ml-1" />
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                align="end"
                sideOffset={8}
            >
                {/* User Info Header */}
                <DropdownMenuLabel className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-[#01DE82]/30">
                            <AvatarImage
                                src={user.picture || undefined}
                                alt={displayName}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-medium">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <span className="font-medium text-white text-sm">
                                {displayName}
                            </span>
                            <span className="text-xs text-white/60">
                                {user.email}
                            </span>

                        </div>
                    </div>
                </DropdownMenuLabel>

                {/* Profile Actions */}
                <div className="p-1">
                    <Link href="/profile">
                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                            <User className="h-4 w-4 text-[#01DE82]" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                        <Settings className="h-4 w-4 text-[#01DE82]" />
                        <span>Account Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                        <Bell className="h-4 w-4 text-[#01DE82]" />
                        <span>Notifications</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                        <CreditCard className="h-4 w-4 text-[#01DE82]" />
                        <span>Billing & Plans</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-white/10" />

                {/* Admin Section (if applicable) */}
                {user.email?.includes("admin") && (
                    <>
                        <div className="p-1">
                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                                <Shield className="h-4 w-4 text-yellow-500" />
                                <span>Admin Panel</span>
                                <Badge variant="outline" className="ml-auto text-xs border-yellow-500/30 text-yellow-500">
                                    Admin
                                </Badge>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                    </>
                )}

                {/* Help & Support */}
                <div className="p-1">
                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-[#01DE82]" />
                        <span>Help & Support</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-white/10" />

                {/* Logout */}
                <div className="p-1">
                    <LogoutLink>
                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-300">
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </LogoutLink>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
