import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Delay Checker",
  description: "See the chance a flight arrives ≥ 15 minutes late based on 2013 US data.",
};

// Inline script applied before React hydrates to avoid flash of wrong theme.
// Only the exact value 'dark' triggers any DOM mutation — no unsanitized value
// is ever written to the DOM.
const themeScript = `
(function(){
  try {
    var m = document.cookie.split('; ').find(function(r){ return r.startsWith('theme='); });
    var v = m && m.split('=')[1];
    if (v === 'dark') document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
