import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Motor de Análise de Crédito | Super Admin",
  description:
    "Sistema interno de análise de crédito baseado nos 6 Cs — Caráter, Capacidade, Capital, Colateral, Condições, Compliance.",
  robots: "noindex, nofollow",
};

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin-token")?.value;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {authenticated ? (
          <div className="app-layout">
            <Sidebar />
            <div className="main-area">
              <Header />
              <main className="main-content">{children}</main>
            </div>
          </div>
        ) : (
          <div className="auth-layout">{children}</div>
        )}
      </body>
    </html>
  );
}
