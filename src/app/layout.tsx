import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { GuardianProvider } from "@/lib/store/demo-context";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "GuardianAI — Predictive AI Safety Intelligence",
  description: "A proactive safety net application combining journey context, route anomaly detection, community reports, and Google Gemini AI to predict and respond to safety risks early.",
  keywords: ["Safety AI", "Predictive Risk Detection", "Personal Safety", "Journey Safety Net", "Gemini AI", "GuardianAI"],
  authors: [{ name: "GuardianAI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased`}>
        <AuthProvider>
          <GuardianProvider>
            {children}
          </GuardianProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
