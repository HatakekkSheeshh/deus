import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "German Master Application Tracker",
  description: "Track German Master's applications, documents, costs, deadlines, scholarships, and sharing."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="warm" data-corners="soft" data-type="serif-led">
      <body>{children}</body>
    </html>
  );
}
