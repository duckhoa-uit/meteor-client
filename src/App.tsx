import LayoutSPA from "./components/layout";
import { Menu } from "./components/menu"
import { TailwindIndicator } from "./components/tailwind-indicator"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { cn } from "./lib/utils"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen overflow-clip">
        {/* <Menu /> */}
        <div
          className={cn(
            "overflow-auto bg-background"
            // "scrollbar-none"
            // "scrollbar scrollbar-track-transparent scrollbar-thumb-accent scrollbar-thumb-rounded-md"
          )}
        >
          <LayoutSPA />
        </div>
      </div>
      <TailwindIndicator />

      <Toaster />
    </ThemeProvider>
  )
}

export default App