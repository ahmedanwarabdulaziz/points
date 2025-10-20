import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
// Footer removed per request
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cadeala - Rewards & Gift Cards",
  description: "Earn points, redeem rewards, and enjoy gift cards with Cadeala",
  keywords: "rewards, points, gift cards, loyalty program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            {/* Footer removed */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
