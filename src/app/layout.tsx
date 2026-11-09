import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ProgressProvider } from "@/components/providers/progress-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { themeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Belajar Bahasa Jepang`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["belajar bahasa Jepang", "JLPT", "hiragana", "katakana", "kanji", "kosakata Jepang", "tata bahasa Jepang"],
  authors: [{ name: "Kotoba" }],
  creator: "Kotoba",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: `${APP_NAME} — Belajar Bahasa Jepang`,
    description: APP_TAGLINE,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#100e0c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* No remote font requests: the app stays self-contained and works offline. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <ToastProvider>
          <ProgressProvider>
            <AppShell>{children}</AppShell>
          </ProgressProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
