// Standalone Gradient Generator Module
// Independent module for creating various types of gradients

export interface GradientStop {
  color: string
  position: number
  opacity?: number
}

export interface GradientConfig {
  id: string
  name: string
  description: string
  type: "linear" | "radial" | "conic"
  direction?: string
  stops: GradientStop[]
  css: string
  preview: string
  tags: string[]
}

export interface GradientCollection {
  id: string
  name: string
  description: string
  gradients: GradientConfig[]
  metadata: {
    createdAt: string
    colorCount: number
    gradientCount: number
  }
}

export interface DesignExample {
  element: string
  description: string
  css: string
  htmlExample: string
  useCase: string[]
}

// Gradient Generation Engine
export class GradientGenerator {
  private static readonly DIRECTIONS = [
    { name: "Top to Bottom", value: "to bottom", angle: "180deg" },
    { name: "Left to Right", value: "to right", angle: "90deg" },
    { name: "Diagonal ↘", value: "to bottom right", angle: "135deg" },
    { name: "Diagonal ↙", value: "to bottom left", angle: "225deg" },
    { name: "Diagonal ↗", value: "to top right", angle: "45deg" },
    { name: "Diagonal ↖", value: "to top left", angle: "315deg" },
    { name: "Bottom to Top", value: "to top", angle: "0deg" },
    { name: "Right to Left", value: "to left", angle: "270deg" },
  ]

  private static readonly RADIAL_SHAPES = [
    "circle at center",
    "ellipse at center",
    "circle at top left",
    "circle at top right",
    "circle at bottom left",
    "circle at bottom right",
    "ellipse at top",
    "ellipse at bottom",
  ]

  // Color utility methods
  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  private static hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360
    const sNorm = s / 100
    const lNorm = l / 100

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
    const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1))
    const m = lNorm - c / 2

    let r = 0,
      g = 0,
      b = 0

    if (0 <= hNorm && hNorm < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (1 / 6 <= hNorm && hNorm < 2 / 6) {
      r = x
      g = c
      b = 0
    } else if (2 / 6 <= hNorm && hNorm < 3 / 6) {
      r = 0
      g = c
      b = x
    } else if (3 / 6 <= hNorm && hNorm < 4 / 6) {
      r = 0
      g = x
      b = c
    } else if (4 / 6 <= hNorm && hNorm < 5 / 6) {
      r = x
      g = 0
      b = c
    } else if (5 / 6 <= hNorm && hNorm < 1) {
      r = c
      g = 0
      b = x
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, "0")
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, "0")
    const bHex = Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, "0")

    return `#${rHex}${gHex}${bHex}`.toUpperCase()
  }

  private static sortColorsByHue(colors: string[]): string[] {
    return [...colors].sort((a, b) => {
      const hslA = this.hexToHsl(a)
      const hslB = this.hexToHsl(b)
      return hslA.h - hslB.h
    })
  }

  private static sortColorsByLightness(colors: string[]): string[] {
    return [...colors].sort((a, b) => {
      const hslA = this.hexToHsl(a)
      const hslB = this.hexToHsl(b)
      return hslA.l - hslB.l
    })
  }

  private static interpolateColors(color1: string, color2: string, steps: number): string[] {
    const hsl1 = this.hexToHsl(color1)
    const hsl2 = this.hexToHsl(color2)
    const result: string[] = []

    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1)

      // Handle hue interpolation (circular)
      let hDiff = hsl2.h - hsl1.h
      if (Math.abs(hDiff) > 180) {
        hDiff = hDiff > 0 ? hDiff - 360 : hDiff + 360
      }

      const h = (hsl1.h + hDiff * ratio + 360) % 360
      const s = hsl1.s + (hsl2.s - hsl1.s) * ratio
      const l = hsl1.l + (hsl2.l - hsl1.l) * ratio

      result.push(this.hslToHex(h, s, l))
    }

    return result
  }

  // Main gradient generation methods
  static generateGradientCollection(
    colors: string[],
    options: {
      includeVariations?: boolean
      maxGradients?: number
      customName?: string
    } = {},
  ): GradientCollection {
    const { includeVariations = true, maxGradients = 20, customName = "Generated Collection" } = options

    if (colors.length < 2) {
      throw new Error("At least 2 colors are required to generate gradients")
    }

    const gradients: GradientConfig[] = []

    // 1. Basic gradients
    gradients.push(...this.generateBasicGradients(colors))

    // 2. Sorted gradients
    gradients.push(...this.generateSortedGradients(colors))

    // 3. Interpolated gradients
    gradients.push(...this.generateInterpolatedGradients(colors))

    // 4. Radial gradients
    gradients.push(...this.generateRadialGradients(colors))

    // 5. Conic gradients
    gradients.push(...this.generateConicGradients(colors))

    // 6. Advanced patterns
    gradients.push(...this.generateAdvancedPatterns(colors))

    // Add variations if requested
    if (includeVariations) {
      const variations = this.generateVariations(gradients.slice(0, 5))
      gradients.push(...variations)
    }

    // Limit number of gradients
    const finalGradients = gradients.slice(0, maxGradients)

    return {
      id: `collection-${Date.now()}`,
      name: customName,
      description: `Generated from ${colors.length} colors`,
      gradients: finalGradients,
      metadata: {
        createdAt: new Date().toISOString(),
        colorCount: colors.length,
        gradientCount: finalGradients.length,
      },
    }
  }

  private static generateBasicGradients(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    // Two-color gradients
    for (let i = 0; i < colors.length - 1; i++) {
      const color1 = colors[i]
      const color2 = colors[i + 1]

      gradients.push({
        id: `basic-${i}`,
        name: `${color1} to ${color2}`,
        description: "Simple two-color gradient",
        type: "linear",
        direction: "to right",
        stops: [
          { color: color1, position: 0 },
          { color: color2, position: 100 },
        ],
        css: `linear-gradient(to right, ${color1} 0%, ${color2} 100%)`,
        preview: `linear-gradient(to right, ${color1}, ${color2})`,
        tags: ["basic", "two-color"],
      })
    }

    // Multi-color gradient
    if (colors.length >= 3) {
      const stops = colors.map((color, index) => ({
        color,
        position: (index / (colors.length - 1)) * 100,
      }))

      gradients.push({
        id: "multi-color",
        name: "Multi-Color Spectrum",
        description: "Gradient using all provided colors",
        type: "linear",
        direction: "to right",
        stops,
        css: `linear-gradient(to right, ${stops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
        preview: `linear-gradient(to right, ${colors.join(", ")})`,
        tags: ["multi-color", "spectrum"],
      })
    }

    return gradients
  }

  private static generateSortedGradients(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    // Hue-sorted gradient
    const hueSorted = this.sortColorsByHue(colors)
    const hueStops = hueSorted.map((color, index) => ({
      color,
      position: (index / (hueSorted.length - 1)) * 100,
    }))

    gradients.push({
      id: "hue-sorted",
      name: "Rainbow Spectrum",
      description: "Colors sorted by hue for natural rainbow effect",
      type: "linear",
      direction: "45deg",
      stops: hueStops,
      css: `linear-gradient(45deg, ${hueStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
      preview: `linear-gradient(45deg, ${hueSorted.join(", ")})`,
      tags: ["rainbow", "hue-sorted", "natural"],
    })

    // Lightness-sorted gradient
    const lightnessSorted = this.sortColorsByLightness(colors)
    const lightnessStops = lightnessSorted.map((color, index) => ({
      color,
      position: (index / (lightnessSorted.length - 1)) * 100,
    }))

    gradients.push({
      id: "lightness-sorted",
      name: "Light to Dark",
      description: "Colors sorted by lightness",
      type: "linear",
      direction: "to bottom",
      stops: lightnessStops,
      css: `linear-gradient(to bottom, ${lightnessStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
      preview: `linear-gradient(to bottom, ${lightnessSorted.join(", ")})`,
      tags: ["lightness", "sorted", "depth"],
    })

    return gradients
  }

  private static generateInterpolatedGradients(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    if (colors.length >= 2) {
      // Smooth interpolation between first and last color
      const interpolated = this.interpolateColors(colors[0], colors[colors.length - 1], 5)
      const interpolatedStops = interpolated.map((color, index) => ({
        color,
        position: (index / (interpolated.length - 1)) * 100,
      }))

      gradients.push({
        id: "smooth-interpolated",
        name: "Smooth Transition",
        description: "Smooth interpolation between extreme colors",
        type: "linear",
        direction: "135deg",
        stops: interpolatedStops,
        css: `linear-gradient(135deg, ${interpolatedStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
        preview: `linear-gradient(135deg, ${interpolated.join(", ")})`,
        tags: ["smooth", "interpolated", "transition"],
      })
    }

    return gradients
  }

  private static generateRadialGradients(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    // Center radial
    const centerStops = colors.slice(0, 3).map((color, index) => ({
      color,
      position: (index / (Math.min(colors.length, 3) - 1)) * 100,
    }))

    gradients.push({
      id: "radial-center",
      name: "Radial Center",
      description: "Radial gradient from center",
      type: "radial",
      direction: "circle at center",
      stops: centerStops,
      css: `radial-gradient(circle at center, ${centerStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
      preview: `radial-gradient(circle at center, ${colors.slice(0, 3).join(", ")})`,
      tags: ["radial", "center", "circular"],
    })

    // Corner radial
    gradients.push({
      id: "radial-corner",
      name: "Radial Corner",
      description: "Radial gradient from corner",
      type: "radial",
      direction: "circle at top left",
      stops: centerStops,
      css: `radial-gradient(circle at top left, ${centerStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
      preview: `radial-gradient(circle at top left, ${colors.slice(0, 3).join(", ")})`,
      tags: ["radial", "corner", "dramatic"],
    })

    return gradients
  }

  private static generateConicGradients(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    if (colors.length >= 3) {
      const conicStops = colors.map((color, index) => ({
        color,
        position: (index / colors.length) * 360,
      }))

      gradients.push({
        id: "conic-wheel",
        name: "Color Wheel",
        description: "Conic gradient creating a color wheel effect",
        type: "conic",
        direction: "from 0deg at center",
        stops: conicStops,
        css: `conic-gradient(from 0deg at center, ${conicStops.map((stop) => `${stop.color} ${stop.position}deg`).join(", ")})`,
        preview: `conic-gradient(from 0deg at center, ${colors.join(", ")})`,
        tags: ["conic", "wheel", "circular"],
      })
    }

    return gradients
  }

  private static generateAdvancedPatterns(colors: string[]): GradientConfig[] {
    const gradients: GradientConfig[] = []

    if (colors.length >= 2) {
      // Striped pattern
      const stripeStops: GradientStop[] = []
      colors.forEach((color, index) => {
        const start = (index / colors.length) * 100
        const end = ((index + 1) / colors.length) * 100
        stripeStops.push({ color, position: start }, { color, position: end })
      })

      gradients.push({
        id: "striped",
        name: "Color Stripes",
        description: "Hard-edged color stripes",
        type: "linear",
        direction: "to right",
        stops: stripeStops,
        css: `linear-gradient(to right, ${stripeStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
        preview: `linear-gradient(to right, ${colors.join(", ")})`,
        tags: ["stripes", "hard-edge", "pattern"],
      })

      // Fade pattern
      const fadeStops: GradientStop[] = []
      colors.forEach((color, index) => {
        fadeStops.push({ color, position: index * 25, opacity: 1 })
        fadeStops.push({ color, position: index * 25 + 12.5, opacity: 0.5 })
      })

      gradients.push({
        id: "fade-pattern",
        name: "Fade Pattern",
        description: "Fading color pattern with opacity",
        type: "linear",
        direction: "to bottom",
        stops: fadeStops,
        css: `linear-gradient(to bottom, ${fadeStops
          .map(
            (stop) =>
              `${stop.color}${
                stop.opacity
                  ? Math.round(stop.opacity * 255)
                      .toString(16)
                      .padStart(2, "0")
                  : ""
              } ${stop.position}%`,
          )
          .join(", ")})`,
        preview: `linear-gradient(to bottom, ${colors.join(", ")})`,
        tags: ["fade", "opacity", "pattern"],
      })
    }

    return gradients
  }

  private static generateVariations(baseGradients: GradientConfig[]): GradientConfig[] {
    const variations: GradientConfig[] = []

    baseGradients.forEach((gradient) => {
      if (gradient.type === "linear") {
        // Create directional variations
        this.DIRECTIONS.slice(0, 3).forEach((direction) => {
          if (direction.value !== gradient.direction) {
            variations.push({
              ...gradient,
              id: `${gradient.id}-${direction.value.replace(/\s+/g, "-")}`,
              name: `${gradient.name} (${direction.name})`,
              direction: direction.value,
              css: gradient.css.replace(/to \w+( \w+)?/, direction.value),
              tags: [...gradient.tags, "variation"],
            })
          }
        })
      }
    })

    return variations.slice(0, 10) // Limit variations
  }

  // Design examples generator
  static generateDesignExamples(gradient: GradientConfig): DesignExample[] {
    const examples: DesignExample[] = []

    // Background example
    examples.push({
      element: "Background",
      description: "Full page or section background",
      css: `
.hero-section {
  background: ${gradient.css};
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
      htmlExample: '<div class="hero-section"><h1>Welcome</h1></div>',
      useCase: ["hero sections", "landing pages", "full-screen backgrounds"],
    })

    // Button example
    examples.push({
      element: "Button",
      description: "Gradient button with hover effects",
      css: `
.gradient-button {
  background: ${gradient.css};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}`,
      htmlExample: '<button class="gradient-button">Click Me</button>',
      useCase: ["call-to-action buttons", "primary buttons", "interactive elements"],
    })

    // Card example
    examples.push({
      element: "Card",
      description: "Card with gradient background or border",
      css: `
.gradient-card {
  background: ${gradient.css};
  border-radius: 12px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.gradient-border-card {
  background: white;
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.gradient-border-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 3px;
  background: ${gradient.css};
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}`,
      htmlExample: '<div class="gradient-card"><h3>Card Title</h3><p>Card content</p></div>',
      useCase: ["product cards", "feature highlights", "content sections"],
    })

    // Text example
    examples.push({
      element: "Text",
      description: "Gradient text effect",
      css: `
.gradient-text {
  background: ${gradient.css};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
}`,
      htmlExample: '<h1 class="gradient-text">Gradient Text</h1>',
      useCase: ["headings", "logos", "decorative text"],
    })

    // Progress bar example
    examples.push({
      element: "Progress Bar",
      description: "Animated progress bar with gradient",
      css: `
.progress-container {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: ${gradient.css};
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}`,
      htmlExample: '<div class="progress-container"><div class="progress-bar" style="width: 75%"></div></div>',
      useCase: ["loading indicators", "skill bars", "completion status"],
    })

    return examples
  }

  // Export methods
  static exportCollectionAsCSS(collection: GradientCollection, prefix = "gradient"): string {
    let css = `/* Gradient Collection: ${collection.name} */\n`
    css += `/* Generated: ${collection.metadata.createdAt} */\n`
    css += `/* Colors: ${collection.metadata.colorCount}, Gradients: ${collection.metadata.gradientCount} */\n\n`

    css += `:root {\n`
    collection.gradients.forEach((gradient, index) => {
      css += `  --${prefix}-${gradient.id}: ${gradient.css};\n`
    })
    css += `}\n\n`

    collection.gradients.forEach((gradient) => {
      css += `.${prefix}-${gradient.id} {\n`
      css += `  background: ${gradient.css};\n`
      css += `}\n\n`
    })

    return css
  }

  static exportCollectionAsJSON(collection: GradientCollection): string {
    return JSON.stringify(collection, null, 2)
  }

  static exportCollectionAsSCSS(collection: GradientCollection, prefix = "gradient"): string {
    let scss = `// Gradient Collection: ${collection.name}\n`
    scss += `// Generated: ${collection.metadata.createdAt}\n\n`

    scss += `$gradients: (\n`
    collection.gradients.forEach((gradient, index) => {
      scss += `  "${gradient.id}": ${gradient.css}`
      scss += index < collection.gradients.length - 1 ? ",\n" : "\n"
    })
    scss += `);\n\n`

    scss += `@each $name, $gradient in $gradients {\n`
    scss += `  .${prefix}-#{$name} {\n`
    scss += `    background: $gradient;\n`
    scss += `  }\n`
    scss += `}\n`

    return scss
  }

  // Utility methods
  static validateColors(colors: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (colors.length < 2) {
      errors.push("At least 2 colors are required")
    }

    colors.forEach((color, index) => {
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        errors.push(`Invalid color format at index ${index}: ${color}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static getGradientPreview(gradient: GradientConfig, size = { width: 200, height: 100 }): string {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            ${gradient.stops
              .map(
                (stop) =>
                  `<stop offset="${stop.position}%" style="stop-color:${stop.color};stop-opacity:${stop.opacity || 1}" />`,
              )
              .join("")}
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `)}`
  }
}
