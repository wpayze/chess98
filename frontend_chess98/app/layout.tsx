import type React from "react";
import "./globals.css";

export const metadata = {
  title: "Chess98 - Patichess",
  description: "La plataforma definitiva para ajedrecistas patos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
