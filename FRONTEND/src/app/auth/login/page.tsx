"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
export default function LoginPage() {
    const [email, setEmail] = useState('');

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, }}
            animate={{ opacity: 1, }}
            transition={{ duration: 0.6, damping: 20 }}
        >
            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card className="border-[#3b82f6]/20 shadow-2xl bg-[#3b82f6]/5 backdrop-blur-3xl relative overflow-hidden group">


                    <CardContent className="p-8 space-y-4 relative z-10">
                        <motion.h1
                            className="text-3xl text-center font-bold bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Welcome Back Friend!
                        </motion.h1>
                        {/* Social Login Buttons */}
                        <div className="flex gap-3 justify-center">
                            <LoginLink authUrlParams={{ connection_id: "conn_0195607bb367ae39156fd585d8c1624f" }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button variant="outline" size="icon" className="rounded-full cursor-pointer border-[#3b82f6]/30 text-white hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 transition-all duration-200 bg-transparent backdrop-blur-sm">
                                        <FcGoogle />
                                    </Button>
                                </motion.div>
                            </LoginLink>

                            <LoginLink authUrlParams={{ connection_id: "conn_0195607bb367b20086ead26f7533dcf8" }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button size="icon" variant="outline" className="rounded-full cursor-pointer border-[#3b82f6]/30  hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 transition-all duration-200 bg-transparent backdrop-blur-sm">
                                        <FaGithub color='white' />
                                    </Button>
                                </motion.div>
                            </LoginLink>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#3b82f6]/20" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#020E0E] px-4 text-white/60 font-medium rounded-md">or continue with email</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <Label htmlFor="email" className="text-white font-medium">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 border-[#3b82f6]/30 bg-[#3b82f6]/5 text-white placeholder:text-white/40 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 backdrop-blur-sm"
                            />
                        </motion.div>



                        {/* Sign In Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LoginLink
                                authUrlParams={{
                                    login_hint: email
                                }}
                            >
                                <Button className="w-full h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#1e40af] hover:to-[#3b82f6] text-white font-semibold shadow-2xl shadow-[#3b82f6]/20 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-white/15"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <span className="relative z-10">Sign in to your account</span>
                                </Button>
                            </LoginLink>
                        </motion.div>
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1 }}
                        >
                            <span className="text-white/60">Don't have an account? </span>
                            <Link
                                href="/auth/register"
                                className="text-[#3b82f6] hover:text-[#3b82f6]/80 font-semibold transition-colors"
                            >
                                Create one now
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sign Up Link */}

        </motion.div>
    );
}
