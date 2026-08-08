import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bodoni_Moda } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Mythletics",
  description: "Your personal bodyweight training companion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* direction: foundry-stat-sheet · seed e2dc9331
          THESIS: Training is a ledger of real numbers — every value you own set in one face.
          OWN-WORLD: A foundry stat sheet. Near-black paper, ink-grey hairlines, one gold foundry accent; hierarchy from scale alone, never color weight.
          STORY: The dashboard is the foundry sheet of your training. The top of the page sets your four true numbers — streak, total time, sessions, reps — in monumental display serif with mono-caps labels.
          FIRST VIEWPORT: Your numbers in a ruled four-cell sheet at the top, then today's trial, then recent sessions, all in the same face.
          FORM: High-contrast variable display serif; mono-caps structural labels; 1px hairline rules; sharp corners; flat fills, no shadow or gradient; gold accent only as filled shapes.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
