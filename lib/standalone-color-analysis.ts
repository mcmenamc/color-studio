// Standalone Color Analysis Module
// Independent module for extracting and analyzing colors from images

export interface AnalyzedColor {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  percentage: number
  count: number
  name?: string
}

export interface ColorPalette {
  id: string
  name: string
  description: string
  colors: AnalyzedColor[]
  type: "monochromatic" | "analogous" | "complementary" | "triadic" | "tetradic" | "split-complementary" | "dominant"
}

export interface ColorAnalysisResult {
  dominantColors: AnalyzedColor[]
  totalPixels: number
  averageColor: AnalyzedColor
  palettes: ColorPalette[]
  metadata: {
    imageSize: { width: number; height: number }
    analysisTime: number
    colorCount: number
    extractedAt: string
  }
}

// Utility functions for color conversion and manipulation
export class ColorUtils {
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = l - c / 2

    let r = 0
    let g = 0
    let b = 0

    if (0 <= h && h < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (1 / 6 <= h && h < 2 / 6) {
      r = x
      g = c
      b = 0
    } else if (2 / 6 <= h && h < 3 / 6) {
      r = 0
      g = c
      b = x
    } else if (3 / 6 <= h && h < 4 / 6) {
      r = 0
      g = x
      b = c
    } else if (4 / 6 <= h && h < 5 / 6) {
      r = x
      g = 0
      b = c
    } else if (5 / 6 <= h && h < 1) {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  static colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
    return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2))
  }

  static getColorName(hex: string): string {
    // Basic color naming - can be extended with a comprehensive color name database
    const colorNames: { [key: string]: string } = {
      "#FF0000": "Red",
      "#00FF00": "Green",
      "#0000FF": "Blue",
      "#FFFF00": "Yellow",
      "#FF00FF": "Magenta",
      "#00FFFF": "Cyan",
      "#000000": "Black",
      "#FFFFFF": "White",
      "#808080": "Gray",
      "#FFA500": "Orange",
      "#800080": "Purple",
      "#FFC0CB": "Pink",
      "#A52A2A": "Brown",
    }

    // Find closest color name
    const rgb = ColorUtils.hexToRgb(hex)
    if (!rgb) return "Unknown"

    let closestColor = "#000000"
    let minDistance = Number.MAX_VALUE

    for (const [colorHex, name] of Object.entries(colorNames)) {
      const colorRgb = ColorUtils.hexToRgb(colorHex)
      if (colorRgb) {
        const distance = ColorUtils.colorDistance(rgb, colorRgb)
        if (distance < minDistance) {
          minDistance = distance
          closestColor = colorHex
        }
      }
    }

    return colorNames[closestColor] || "Unknown"
  }
}

// Main Color Analysis Engine
export class ColorAnalysisEngine {
  private static groupSimilarColors(colors: Map<string, number>, threshold = 25): AnalyzedColor[] {
    const colorArray = Array.from(colors.entries()).map(([hex, count]) => {
      const rgb = ColorUtils.hexToRgb(hex)!
      const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b)
      return { hex, rgb, hsl, count, percentage: 0 }
    })

    const groups: AnalyzedColor[] = []

    for (const color of colorArray) {
      let addedToGroup = false

      for (const group of groups) {
        if (ColorUtils.colorDistance(color.rgb, group.rgb) < threshold) {
          group.count += color.count
          addedToGroup = true
          break
        }
      }

      if (!addedToGroup) {
        groups.push({
          ...color,
          name: ColorUtils.getColorName(color.hex),
        })
      }
    }

    return groups
  }

  static async analyzeImage(
    file: File,
    options: {
      maxColors?: number
      minPercentage?: number
      groupingThreshold?: number
      maxImageSize?: number
    } = {},
  ): Promise<ColorAnalysisResult> {
    const { maxColors = 10, minPercentage = 1, groupingThreshold = 25, maxImageSize = 300 } = options

    const startTime = performance.now()

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        try {
          // Optimize image size for performance
          const scale = Math.min(maxImageSize / img.width, maxImageSize / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          // Draw and analyze image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          const totalPixels = canvas.width * canvas.height

          // Count colors
          const colorCounts = new Map<string, number>()
          let totalR = 0,
            totalG = 0,
            totalB = 0
          let validPixels = 0

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const alpha = data[i + 3]

            // Skip transparent pixels
            if (alpha < 128) continue

            validPixels++
            totalR += r
            totalG += g
            totalB += b

            const hex = ColorUtils.rgbToHex(r, g, b)
            colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
          }

          // Group similar colors
          const groupedColors = this.groupSimilarColors(colorCounts, groupingThreshold)

          // Calculate percentages and filter by minimum percentage
          groupedColors.forEach((color) => {
            color.percentage = (color.count / validPixels) * 100
          })

          const filteredColors = groupedColors
            .filter((color) => color.percentage >= minPercentage)
            .sort((a, b) => b.count - a.count)
            .slice(0, maxColors)

          // Calculate average color
          const avgR = Math.round(totalR / validPixels)
          const avgG = Math.round(totalG / validPixels)
          const avgB = Math.round(totalB / validPixels)
          const avgHsl = ColorUtils.rgbToHsl(avgR, avgG, avgB)

          const averageColor: AnalyzedColor = {
            hex: ColorUtils.rgbToHex(avgR, avgG, avgB),
            rgb: { r: avgR, g: avgG, b: avgB },
            hsl: avgHsl,
            percentage: 0,
            count: 0,
            name: ColorUtils.getColorName(ColorUtils.rgbToHex(avgR, avgG, avgB)),
          }

          // Generate color palettes
          const palettes = this.generateColorPalettes(filteredColors)

          const endTime = performance.now()

          resolve({
            dominantColors: filteredColors,
            totalPixels: validPixels,
            averageColor,
            palettes,
            metadata: {
              imageSize: { width: img.width, height: img.height },
              analysisTime: endTime - startTime,
              colorCount: filteredColors.length,
              extractedAt: new Date().toISOString(),
            },
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static generateColorPalettes(dominantColors: AnalyzedColor[]): ColorPalette[] {
    const palettes: ColorPalette[] = []

    // 1. Dominant Colors Palette
    palettes.push({
      id: "dominant",
      name: "Dominant Colors",
      description: "Most frequent colors found in the image",
      colors: dominantColors.slice(0, 5),
      type: "dominant",
    })

    if (dominantColors.length > 0) {
      const baseColor = dominantColors[0]

      // 2. Monochromatic Palette
      palettes.push({
        id: "monochromatic",
        name: "Monochromatic",
        description: "Different shades and tints of the dominant color",
        colors: this.generateMonochromaticPalette(baseColor),
        type: "monochromatic",
      })

      // 3. Complementary Palette
      palettes.push({
        id: "complementary",
        name: "Complementary",
        description: "Colors opposite on the color wheel",
        colors: this.generateComplementaryPalette(baseColor),
        type: "complementary",
      })

      // 4. Analogous Palette
      palettes.push({
        id: "analogous",
        name: "Analogous",
        description: "Colors adjacent on the color wheel",
        colors: this.generateAnalogousPalette(baseColor),
        type: "analogous",
      })

      // 5. Triadic Palette
      palettes.push({
        id: "triadic",
        name: "Triadic",
        description: "Three colors evenly spaced on the color wheel",
        colors: this.generateTriadicPalette(baseColor),
        type: "triadic",
      })

      // 6. Split Complementary Palette
      palettes.push({
        id: "split-complementary",
        name: "Split Complementary",
        description: "Base color plus two colors adjacent to its complement",
        colors: this.generateSplitComplementaryPalette(baseColor),
        type: "split-complementary",
      })
    }

    return palettes
  }

  private static generateMonochromaticPalette(baseColor: AnalyzedColor): AnalyzedColor[] {
    const palette: AnalyzedColor[] = []
    const { h, s } = baseColor.hsl

    // Generate different lightness values
    const lightnessValues = [20, 40, 60, 80, 95]

    lightnessValues.forEach((l, index) => {
      const rgb = ColorUtils.hslToRgb(h, s, l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: { h, s, l },
        percentage: 0,
        count: 0,
        name: `${baseColor.name} ${index + 1}`,
      })
    })

    return palette
  }

  private static generateComplementaryPalette(baseColor: AnalyzedColor): AnalyzedColor[] {
    const palette: AnalyzedColor[] = [baseColor]
    const { h, s, l } = baseColor.hsl

    // Complementary color (180 degrees opposite)
    const compH = (h + 180) % 360
    const compRgb = ColorUtils.hslToRgb(compH, s, l)
    const compHex = ColorUtils.rgbToHex(compRgb.r, compRgb.g, compRgb.b)

    palette.push({
      hex: compHex,
      rgb: compRgb,
      hsl: { h: compH, s, l },
      percentage: 0,
      count: 0,
      name: `Complementary ${ColorUtils.getColorName(compHex)}`,
    })

    // Add variations
    const variations = [
      { h, s: Math.max(s - 20, 0), l: Math.min(l + 20, 100) },
      { h: compH, s: Math.max(s - 20, 0), l: Math.min(l + 20, 100) },
      { h, s: Math.min(s + 20, 100), l: Math.max(l - 20, 0) },
    ]

    variations.forEach((variation, index) => {
      const rgb = ColorUtils.hslToRgb(variation.h, variation.s, variation.l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: variation,
        percentage: 0,
        count: 0,
        name: `Variation ${index + 1}`,
      })
    })

    return palette
  }

  private static generateAnalogousPalette(baseColor: AnalyzedColor): AnalyzedColor[] {
    const palette: AnalyzedColor[] = [baseColor]
    const { h, s, l } = baseColor.hsl

    // Analogous colors (±30 degrees)
    const analogousHues = [h - 30, h + 30].map((hue) => (hue + 360) % 360)

    analogousHues.forEach((hue, index) => {
      const rgb = ColorUtils.hslToRgb(hue, s, l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: { h: hue, s, l },
        percentage: 0,
        count: 0,
        name: `Analogous ${index + 1}`,
      })
    })

    // Add lighter and darker variations
    const variations = [
      { h, s, l: Math.min(l + 30, 100) },
      { h, s, l: Math.max(l - 30, 0) },
    ]

    variations.forEach((variation, index) => {
      const rgb = ColorUtils.hslToRgb(variation.h, variation.s, variation.l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: variation,
        percentage: 0,
        count: 0,
        name: `Tint ${index + 1}`,
      })
    })

    return palette
  }

  private static generateTriadicPalette(baseColor: AnalyzedColor): AnalyzedColor[] {
    const palette: AnalyzedColor[] = [baseColor]
    const { h, s, l } = baseColor.hsl

    // Triadic colors (120 degrees apart)
    const triadicHues = [h + 120, h + 240].map((hue) => hue % 360)

    triadicHues.forEach((hue, index) => {
      const rgb = ColorUtils.hslToRgb(hue, s, l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: { h: hue, s, l },
        percentage: 0,
        count: 0,
        name: `Triadic ${index + 1}`,
      })
    })

    return palette
  }

  private static generateSplitComplementaryPalette(baseColor: AnalyzedColor): AnalyzedColor[] {
    const palette: AnalyzedColor[] = [baseColor]
    const { h, s, l } = baseColor.hsl

    // Split complementary colors (complement ±30 degrees)
    const complementH = (h + 180) % 360
    const splitHues = [complementH - 30, complementH + 30].map((hue) => (hue + 360) % 360)

    splitHues.forEach((hue, index) => {
      const rgb = ColorUtils.hslToRgb(hue, s, l)
      const hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b)
      palette.push({
        hex,
        rgb,
        hsl: { h: hue, s, l },
        percentage: 0,
        count: 0,
        name: `Split Comp ${index + 1}`,
      })
    })

    return palette
  }

  // Validation methods
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"]
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file format. Please use JPG, PNG, GIF, WebP, or BMP.",
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File too large. Maximum size is 50MB.",
      }
    }

    return { isValid: true }
  }

  // Export methods
  static exportAnalysisAsJSON(result: ColorAnalysisResult): string {
    return JSON.stringify(result, null, 2)
  }

  static exportAnalysisAsCSS(result: ColorAnalysisResult, prefix = "extracted"): string {
    let css = `/* Color Analysis Results - Generated ${result.metadata.extractedAt} */\n\n`

    css += `:root {\n`
    result.dominantColors.forEach((color, index) => {
      css += `  --${prefix}-color-${index + 1}: ${color.hex};\n`
    })
    css += `  --${prefix}-average: ${result.averageColor.hex};\n`
    css += `}\n\n`

    result.dominantColors.forEach((color, index) => {
      css += `.${prefix}-bg-${index + 1} { background-color: ${color.hex}; }\n`
      css += `.${prefix}-text-${index + 1} { color: ${color.hex}; }\n`
      css += `.${prefix}-border-${index + 1} { border-color: ${color.hex}; }\n\n`
    })

    return css
  }
}
