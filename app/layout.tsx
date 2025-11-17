import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Square Noise",
  description: "Shuffle photos or your live camera feed into glitchy grids"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
