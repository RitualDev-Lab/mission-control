import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RitualDev Lab — Mission Control",
  description: "Executive Multi-Repo Operations & Ecosystem Telemetry Cockpit",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <div className="fixed inset-0 bg-grid-cyber pointer-events-none z-0" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
