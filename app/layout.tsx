import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Horizon Drift -- 3D Website Blueprint Prototype",
  description:
    "A single-scene visual prototype built from the 3D Website Creation Blueprint: React Three Fiber, a custom shader hero object, a GSAP-ready camera rig, and full HTML-layer accessibility.",
  metadataBase: new URL("https://example.com")
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
