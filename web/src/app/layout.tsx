import type { Metadata } from "next";
import Footer from "../components/home/footer/footer";
import { cn } from "../lib/utils";
import { ThemeProvider } from "../providers/theme";
import "./globals.css";
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
