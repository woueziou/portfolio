import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, DM_Mono, Inter } from "next/font/google";
import localFont from "next/font/local"
import "./globals.css";
import { ThemeProvider } from "../providers/theme";
import { cn } from "../lib/utils";
import BackgroundNoise from "@/public/noise-bg.png"
import Footer from "../components/home/footer/footer";
// const baufra = localFont({
//   src: [
//     { path: "../baufra/Baufra-Bold.woff2",weight:"" },

//   ]
// })
const inter = Inter({ subsets: ['latin'] })
const dm = DM_Sans({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: "T.E Software Developer",
  description: "Software developer | LLM Software developer | Next.JS | HONO",
  creator: "Taas S. Ekpaye",
  // icons:"/public/"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={cn(
          "antialiased",
          "bg-[url('/noise-bg.png')]",
          // dm.className
          "font-baufra"
        )}
      >
        <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>

        <Footer />
      </body>
    </html>
  );
}
