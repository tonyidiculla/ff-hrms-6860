import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FURFIELD HRMS",
  description: "Human Resource Management System - Comprehensive HR solutions for veterinary practices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full m-0 p-0 overflow-hidden" style={{ background: 'transparent' }}>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
