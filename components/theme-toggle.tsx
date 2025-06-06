"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-colors"
      title={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      )}
    </Button>
  )
}
