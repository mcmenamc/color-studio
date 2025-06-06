"use client"

import { useState, useEffect } from "react"
import { Palette } from "lucide-react"
import { type ColorData, processColor } from "@/lib/color-utils"
import { ColorInput } from "@/components/color-input"
import { ColorDisplay } from "@/components/color-display"
import { ColorHistory } from "@/components/color-history"
import { ColorPalettes } from "@/components/color-palettes"
import { ColorPicker } from "@/components/color-picker"
import { ContrastChecker } from "@/components/contrast-checker"
import { StandaloneColorAnalysis } from "@/components/standalone-color-analysis"
import { StandaloneGradientGenerator } from "@/components/standalone-gradient-generator"
import { Navigation } from "@/components/navigation"
import { SectionWrapper } from "@/components/section-wrapper"

export default function ColorConverter() {
  const [inputColor, setInputColor] = useState("#3b82f6")
  const [colorData, setColorData] = useState<ColorData>({
    hex: "#3b82f6",
    rgb: "rgb(59, 130, 246)",
    isValid: true,
  })
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [extractedColors, setExtractedColors] = useState<string[]>([])

  // Agregar al historial
  const addToHistory = (color: string) => {
    setColorHistory((prev) => {
      const newHistory = [color, ...prev.filter((c) => c !== color)]
      return newHistory.slice(0, 10) // Mantener solo los últimos 10
    })
  }

  // Efecto para procesar el color cuando cambia el input
  useEffect(() => {
    if (inputColor.trim()) {
      const processed = processColor(inputColor)
      setColorData(processed)

      if (processed.isValid) {
        addToHistory(processed.hex)
      }
    }
  }, [inputColor])

  // Handle colors extracted from image analysis
  const handleColorsExtracted = (colors: string[]) => {
    setExtractedColors(colors)
    if (colors.length > 0) {
      setInputColor(colors[0]) // Set first extracted color as current
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <Navigation />

    

      {/* Main Content */}
      <div className="pt-4">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
          {/* Home Section */}
          <SectionWrapper
            id="home"
            title="Color Converter & Tools"
            description="Professional color conversion between HEX and RGB formats with advanced tools for designers and developers"
          >
            <div className="space-y-8">
              <ColorInput
                inputColor={inputColor}
                onColorChange={setInputColor}
                error={!colorData.isValid ? colorData.error : undefined}
              />

              <ColorDisplay colorData={colorData} />
            </div>
          </SectionWrapper>

          {/* Color Picker Section */}
          <SectionWrapper
            id="color-picker"
            title="Visual Color Picker"
            description="Use the native browser color picker for intuitive color selection"
          >
            <ColorPicker colorData={colorData} onColorChange={setInputColor} />
          </SectionWrapper>

          {/* Color Analysis Section */}
          <SectionWrapper
            id="color-analysis"
            title="Advanced Color Analysis"
            description="Extract dominant colors from images and generate professional color palettes using advanced algorithms"
          >
            <StandaloneColorAnalysis onColorsExtracted={handleColorsExtracted} onColorSelect={setInputColor} />
          </SectionWrapper>

          {/* Gradient Generator Section */}
          <SectionWrapper
            id="gradient-generator"
            title="Gradient Generator"
            description="Create stunning gradients with multiple algorithms and export ready-to-use CSS code"
          >
            <StandaloneGradientGenerator
              initialColors={extractedColors.length > 0 ? extractedColors : ["#3B82F6", "#8B5CF6", "#EC4899"]}
              onGradientSelect={(gradient) => {
                console.log("Selected gradient:", gradient)
              }}
            />
          </SectionWrapper>

          {/* Contrast Checker Section */}
          <SectionWrapper
            id="contrast-checker"
            title="Accessibility Contrast Checker"
            description="Verify color combinations meet WCAG accessibility standards for optimal readability"
          >
            <ContrastChecker initialColor={colorData.isValid ? colorData.hex : "#3b82f6"} />
          </SectionWrapper>

          {/* Color History Section */}
          <SectionWrapper
            id="color-history"
            title="Color History"
            description="Quick access to recently used colors for efficient workflow management"
          >
            <ColorHistory colorHistory={colorHistory} onColorSelect={setInputColor} />
          </SectionWrapper>

          {/* Color Palettes Section */}
          <SectionWrapper
            id="color-palettes"
            title="Professional Color Palettes"
            description="Explore curated color palettes from popular design systems and frameworks"
          >
            <ColorPalettes onColorSelect={setInputColor} />
          </SectionWrapper>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-4">
             
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                A comprehensive suite of professional color tools for designers and developers. Extract colors from
                images, generate gradients, check accessibility, and manage your color workflow efficiently.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span>Built with Next.js</span>
                <span>•</span>
                <span>Tailwind CSS</span>
                <span>•</span>
                <span>TypeScript</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

    </div>
  )
}
