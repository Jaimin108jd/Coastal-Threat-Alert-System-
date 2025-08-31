"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");

    return (
        <div className="space-y-8">
            {/* Login Card */}
            <Card className="border-[#3b82f6]/20 shadow-2xl bg-[#3b82f6]/5 backdrop-blur-3xl relative overflow-hidden group">
                <CardContent className="p-8 space-y-4 relative z-10">
                    <h1 className="text-3xl text-center font-bold bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                        Welcome Back Friend!
                    </h1>

                    {/* Social Login Buttons */}
                    <div className="flex gap-3 justify-center">
                        <LoginLink authUrlParams={{ connection_id: "conn_0195607bb367ae39156fd585d8c1624f" }}>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full cursor-pointer border-[#3b82f6]/30 text-white hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 bg-transparent backdrop-blur-sm"
                            >
                                <FcGoogle />
                            </Button>
                        </LoginLink>

                        <LoginLink authUrlParams={{ connection_id: "conn_0195607bb367b20086ead26f7533dcf8" }}>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full cursor-pointer border-[#3b82f6]/30 hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 bg-transparent backdrop-blur-sm"
                            >
                                <FaGithub color="white" />
                            </Button>
                        </LoginLink>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#3b82f6]/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-[#020E0E] px-4 text-white/60 font-medium rounded-md">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-medium">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 border-[#3b82f6]/30 bg-[#3b82f6]/5 text-white placeholder:text-white/40 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 backdrop-blur-sm"
                        />
                    </div>

                    {/* Sign In Button */}
                    <LoginLink
                        authUrlParams={{
                            login_hint: email,
                        }}
                    >
                        <Button className="w-full h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#1e40af] hover:to-[#3b82f6] text-white font-semibold shadow-2xl shadow-[#3b82f6]/20 relative overflow-hidden group">
                            <span className="relative z-10">Sign in to your account</span>
                        </Button>
                    </LoginLink>

                    {/* Register Link */}
                    <div className="text-center">
                        <span className="text-white/60">Don't have an account? </span>
                        <Link
                            href="/auth/register"
                            className="text-[#3b82f6] hover:text-[#3b82f6]/80 font-semibold transition-colors"
                        >
                            Create one now
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
