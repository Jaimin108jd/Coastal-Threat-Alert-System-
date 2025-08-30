"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { UploadDropzone } from "@/lib/uploadthing"
import { X } from "lucide-react"
import { Image } from "@heroui/image";
interface ProfileImagePickerProps {
    onImageChange: (file: File | null, url?: string) => void
    initialPreview?: string
}

export default function ProfileImagePicker({ onImageChange, initialPreview }: ProfileImagePickerProps) {
    const [profilePreview, setProfilePreview] = useState<string | null>(initialPreview || null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const removeProfilePicture = () => {
        setProfilePreview(null)
        onImageChange(null)
        setUploadError(null)
    }

    return (
        <div className="text-center">
            <Label className="text-white text-lg font-medium mb-6 block">Profile Picture (Optional)</Label>

            {profilePreview ? (
                // Preview state with uploaded image
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative group">
                        <motion.div
                            className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#01DE82]/50 shadow-2xl shadow-[#01DE82]/20"
                            whileHover={{ scale: 1.05, borderColor: "#01DE82" }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={profilePreview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        </motion.div>
                        <motion.button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="h-4 w-4" />
                        </motion.button>
                    </div>
                    <p className="text-[#01DE82]/80 text-sm">Looking great! Click the X to remove</p>
                </motion.div>
            ) : (
                // Upload state with UploadThing integration
                <div className="space-y-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <UploadDropzone
                            endpoint="imageUploader"
                            onClientUploadComplete={(res: any) => {
                                console.log("Files: ", res);
                                setProfilePreview(res[0].ufsUrl);
                                onImageChange(null, res[0].ufsUrl);
                                setUploadError(null);
                                setIsUploading(false);
                            }}
                            onUploadBegin={() => {
                                setIsUploading(true);
                                setUploadError(null);
                            }}
                            onUploadError={(error: Error) => {
                                console.error(`Upload error: ${error.message}`);
                                setUploadError(`Upload failed: ${error.message}`);
                                setIsUploading(false);
                            }}
                            className={`border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragOver
                                ? "border-[#01DE82]/60 bg-[#01DE82]/10 scale-105"
                                : "border-[#01DE82]/30 hover:border-[#01DE82]/50 hover:bg-[#01DE82]/5"
                                }`}
                            appearance={{
                                container: "bg-transparent border-none p-8",
                                uploadIcon: "text-[#01DE82]/70 w-8 h-8",
                                label: "text-white font-medium",
                                allowedContent: "text-[#01DE82]/60 text-sm",
                                button: "bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/20 text-white border border-[#01DE82]/30 hover:from-[#01DE82]/30 hover:to-[#05614B]/30 transition-all duration-200 px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-sm",
                            }}
                        />
                    </motion.div>

                    {/* Loading indicator */}
                    {isUploading && (
                        <motion.div
                            className="flex items-center justify-center gap-2 text-[#01DE82]/80"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-4 h-4 border-2 border-[#01DE82]/30 border-t-[#01DE82] rounded-full animate-spin" />
                            <span className="text-sm">Uploading...</span>
                        </motion.div>
                    )}

                    {/* Error display */}
                    {uploadError && (
                        <motion.div
                            className="flex items-center justify-center gap-2 text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <X className="h-4 w-4" />
                            <span className="text-sm">{uploadError}</span>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    )
}
