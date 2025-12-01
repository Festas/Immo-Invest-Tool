import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmoCalc Pro - Immobilienrechner",
  description: "Professionelle Immobilienkalkulation für Investoren. Berechne Rendite, Cashflow und Finanzierung nach deutschem Standard.",
  keywords: ["Immobilien", "Kalkulation", "Rendite", "Cashflow", "Investment", "Finanzierung"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased bg-gray-50 dark:bg-gray-950 font-sans">
        {children}
      </body>
    </html>
  );
}
