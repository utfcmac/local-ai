import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local AI",
  description: "Lokale KI-Services fuer macip.de",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
