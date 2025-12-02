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
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolvedTheme;
                  
                  if (theme === 'dark') {
                    resolvedTheme = 'dark';
                  } else if (theme === 'light') {
                    resolvedTheme = 'light';
                  } else {
                    // 'system' theme or no theme stored - use system preference
                    resolvedTheme = prefersDark ? 'dark' : 'light';
                  }
                  
                  document.documentElement.classList.add(resolvedTheme);
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
