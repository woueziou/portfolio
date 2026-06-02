import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { initAuth } from '@/stores/auth.store'
import { ThemeProvider } from '@/providers/theme'
import Footer from '@/components/home/footer/footer'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  useEffect(() => {
    initAuth()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="antialiased bg-[url('/noise-bg.png')] font-baufra min-h-screen flex flex-col justify-between">
        <div className="flex-grow">
          <Outlet />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
