"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Palette, ImageIcon, Layers, Eye, History, SwatchBookIcon as Swatches, Pipette, Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavigationSection {
  id: string
  label: string
  shortLabel: string
  icon: React.ReactNode
}

const navigationSections: NavigationSection[] = [
  {
    id: "color-picker",
    label: "Color Picker",
    shortLabel: "Picker",
    icon: <Pipette className="w-4 h-4" />,
  },
  {
    id: "color-analysis",
    label: "Color Analysis",
    shortLabel: "Analysis",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: "gradient-generator",
    label: "Gradient Generator",
    shortLabel: "Gradients",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "contrast-checker",
    label: "Contrast Checker",
    shortLabel: "Contrast",
    icon: <Eye className="w-4 h-4" />,
  },

  {
    id: "color-history",
    label: "History",
    shortLabel: "History",
    icon: <History className="w-4 h-4" />,
  },
  {
    id: "color-palettes",
    label: "Palettes",
    shortLabel: "Palettes",
    icon: <Swatches className="w-4 h-4" />,
  },
]

export function Navigation() {
  const [activeSection, setActiveSection] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


  // Handle active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationSections.map((section) => section.id)
      const scrollPosition = window.scrollY + 100

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Account for fixed navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  const NavLink = ({
    section,
    isMobile = false,
    variant = "full",
  }: {
    section: NavigationSection
    isMobile?: boolean
    variant?: "full" | "short" | "icon"
  }) => {
    const isActive = activeSection === section.id

    const getLabel = () => {
      switch (variant) {
        case "short":
          return section.shortLabel
        case "icon":
          return ""
        default:
          return section.label
      }
    }

    return (
      <button
        onClick={() => scrollToSection(section.id)}
        className={`
          group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
          ${isMobile ? "w-full justify-start" : ""}
          ${variant === "icon" ? "px-2.5" : ""}
          ${
            isActive
              ? "scale-105"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:scale-105"
          }
        `}
      >
        <span className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          {section.icon}
        </span>
        {variant !== "icon" && (
          <span className={`whitespace-nowrap transition-all duration-300 ${isMobile ? "" : ""}`}>{getLabel()}</span>
        )}
       
      </button>
    )
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500bg-white/95 dark:bg-gray-950/95`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            {/* Enhanced Logo/Brand with better responsive design */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div className="relative group">
                <div className="p-3 bg-black-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Palette className="w-6 h-6 text-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-950 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold  bg-clip-text leading-tight">
                  Color Studio
                </h1>
              </div>
            </div>

            {/* Responsive Navigation - Multiple breakpoints for better text visibility */}

            {/* Extra Large Screens - Full labels */}
            <div className="hidden xl:flex items-center gap-1.5 mx-6 flex-1 justify-center max-w-3xl">
              {navigationSections.map((section) => (
                <NavLink key={section.id} section={section} variant="full" />
              ))}
            </div>

            {/* Large Screens - Short labels */}
            <div className="hidden lg:flex xl:hidden items-center gap-1 mx-4">
              {navigationSections.map((section) => (
                <NavLink key={section.id} section={section} variant="short" />
              ))}
            </div>

            {/* Medium Screens - Icons only */}
            <div className="hidden md:flex lg:hidden items-center gap-1 mx-4">
              {navigationSections.map((section) => (
                <NavLink key={section.id} section={section} variant="icon" />
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle />

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                      {/* Enhanced Mobile Header */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-black-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <Palette className="w-6 h-6 text-black" />
                          </div>
                         
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              Color Studio
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Navigation Links */}
                      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigationSections.map((section) => (
                          <div key={section.id} className="space-y-1">
                            <NavLink section={section} isMobile />
                         
                          </div>
                        ))}
                      </div>

                    
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
