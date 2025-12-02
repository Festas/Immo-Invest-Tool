import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";

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
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('immocalc-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add(
                      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    );
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
