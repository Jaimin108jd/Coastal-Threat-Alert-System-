import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import CursorFollower from "@/components/utils/cursor";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nextjs Auth Template Created By BuddyCodez",
  description: "A template for Next.js applications with authentication",
  other: {
    'ethereum-provider': 'none', // Prevent MetaMask auto-detection
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <AuthProvider>
        <html lang="en">
          <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Suppress MetaMask connection errors
                  window.addEventListener('error', function(e) {
                    if (e.message && e.message.includes('MetaMask')) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  });
                  
                  window.addEventListener('unhandledrejection', function(e) {
                    if (e.reason && e.reason.message && e.reason.message.includes('MetaMask')) {
                      e.preventDefault();
                      return false;
                    }
                  });
                `,
              }}
            />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <CursorFollower />
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
          </body>
        </html>
      </AuthProvider>
    </TRPCReactProvider>
  );
}
