import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FURFIELD HRMS",
  description: "Human Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-transparent">
        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
