import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { GuardianProvider } from "@/lib/store/demo-context";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('guardianai-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || (!stored && prefersDark) || (stored === 'system' && prefersDark);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <GuardianProvider>
              {children}
            </GuardianProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
