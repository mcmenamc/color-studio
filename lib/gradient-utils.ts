import type { ExtractedColor } from "./image-analysis"

export interface GradientStop {
  color: string
  position: number
}

export interface Gradient {
  id: string
  name: string
  type: "linear" | "radial" | "conic"
  direction: string
  stops: GradientStop[]
  css: string
  preview: string
}

// Función para convertir HEX a HSL
export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// Función para convertir HSL a HEX
export const hslToHex = (h: number, s: number, l: number): string => {
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0
  let g = 0
  let b = 0

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

// Función para ordenar colores por tono
export const sortColorsByHue = (colors: ExtractedColor[]): ExtractedColor[] => {
  return [...colors].sort((a, b) => {
    const hslA = hexToHsl(a.hex)
    const hslB = hexToHsl(b.hex)
    return hslA.h - hslB.h
  })
}

// Función para ordenar colores por luminosidad
export const sortColorsByLightness = (colors: ExtractedColor[]): ExtractedColor[] => {
  return [...colors].sort((a, b) => {
    const hslA = hexToHsl(a.hex)
    const hslB = hexToHsl(b.hex)
    return hslA.l - hslB.l
  })
}

// Función para crear gradiente suave entre colores
export const createSmoothGradient = (colors: ExtractedColor[], steps = 5): string[] => {
  if (colors.length < 2) return colors.map((c) => c.hex)

  const result: string[] = []
  const sortedColors = sortColorsByHue(colors)

  for (let i = 0; i < sortedColors.length - 1; i++) {
    const startColor = hexToHsl(sortedColors[i].hex)
    const endColor = hexToHsl(sortedColors[i + 1].hex)

    for (let j = 0; j < steps; j++) {
      const ratio = j / (steps - 1)

      // Interpolación circular para el tono
      let hDiff = endColor.h - startColor.h
      if (Math.abs(hDiff) > 180) {
        if (hDiff > 0) {
          hDiff -= 360
        } else {
          hDiff += 360
        }
      }

      const h = (startColor.h + hDiff * ratio + 360) % 360
      const s = startColor.s + (endColor.s - startColor.s) * ratio
      const l = startColor.l + (endColor.l - startColor.l) * ratio

      result.push(hslToHex(h, s, l))
    }
  }

  return result
}

// Direcciones de gradiente predefinidas
export const GRADIENT_DIRECTIONS = [
  { name: "Arriba a abajo", value: "to bottom", angle: "180deg" },
  { name: "Izquierda a derecha", value: "to right", angle: "90deg" },
  { name: "Diagonal ↘", value: "to bottom right", angle: "135deg" },
  { name: "Diagonal ↙", value: "to bottom left", angle: "225deg" },
  { name: "Diagonal ↗", value: "to top right", angle: "45deg" },
  { name: "Diagonal ↖", value: "to top left", angle: "315deg" },
  { name: "Abajo a arriba", value: "to top", angle: "0deg" },
  { name: "Derecha a izquierda", value: "to left", angle: "270deg" },
]

// Función principal para generar gradientes automáticos
export const generateGradients = (colors: ExtractedColor[]): Gradient[] => {
  if (colors.length < 2) return []

  const gradients: Gradient[] = []

  // 1. Gradiente de colores dominantes (por frecuencia)
  const dominantColors = colors.slice(0, 3)
  const dominantStops = dominantColors.map((color, index) => ({
    color: color.hex,
    position: (index / (dominantColors.length - 1)) * 100,
  }))

  gradients.push({
    id: "dominant",
    name: "Colores Dominantes",
    type: "linear",
    direction: "to right",
    stops: dominantStops,
    css: `linear-gradient(to right, ${dominantStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
    preview: `linear-gradient(to right, ${dominantStops.map((stop) => stop.color).join(", ")})`,
  })

  // 2. Gradiente por tono (rainbow)
  const hueColors = sortColorsByHue(colors.slice(0, 5))
  const hueStops = hueColors.map((color, index) => ({
    color: color.hex,
    position: (index / (hueColors.length - 1)) * 100,
  }))

  gradients.push({
    id: "hue",
    name: "Arcoíris de Tonos",
    type: "linear",
    direction: "45deg",
    stops: hueStops,
    css: `linear-gradient(45deg, ${hueStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
    preview: `linear-gradient(45deg, ${hueStops.map((stop) => stop.color).join(", ")})`,
  })

  // 3. Gradiente por luminosidad (claro a oscuro)
  const lightnessColors = sortColorsByLightness(colors.slice(0, 4))
  const lightnessStops = lightnessColors.map((color, index) => ({
    color: color.hex,
    position: (index / (lightnessColors.length - 1)) * 100,
  }))

  gradients.push({
    id: "lightness",
    name: "Claro a Oscuro",
    type: "linear",
    direction: "to bottom",
    stops: lightnessStops,
    css: `linear-gradient(to bottom, ${lightnessStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
    preview: `linear-gradient(to bottom, ${lightnessStops.map((stop) => stop.color).join(", ")})`,
  })

  // 4. Gradiente suave (interpolado)
  const smoothColors = createSmoothGradient(colors.slice(0, 3), 4)
  const smoothStops = smoothColors.map((color, index) => ({
    color,
    position: (index / (smoothColors.length - 1)) * 100,
  }))

  gradients.push({
    id: "smooth",
    name: "Transición Suave",
    type: "linear",
    direction: "135deg",
    stops: smoothStops,
    css: `linear-gradient(135deg, ${smoothStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
    preview: `linear-gradient(135deg, ${smoothStops.map((stop) => stop.color).join(", ")})`,
  })

  // 5. Gradiente radial
  const radialColors = colors.slice(0, 3)
  const radialStops = radialColors.map((color, index) => ({
    color: color.hex,
    position: (index / (radialColors.length - 1)) * 100,
  }))

  gradients.push({
    id: "radial",
    name: "Radial Central",
    type: "radial",
    direction: "circle at center",
    stops: radialStops,
    css: `radial-gradient(circle at center, ${radialStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
    preview: `radial-gradient(circle at center, ${radialStops.map((stop) => stop.color).join(", ")})`,
  })

  // 6. Gradiente cónico
  const conicColors = sortColorsByHue(colors.slice(0, 4))
  const conicStops = conicColors.map((color, index) => ({
    color: color.hex,
    position: (index / conicColors.length) * 360,
  }))

  gradients.push({
    id: "conic",
    name: "Cónico Circular",
    type: "conic",
    direction: "from 0deg at center",
    stops: conicStops,
    css: `conic-gradient(from 0deg at center, ${conicStops.map((stop) => `${stop.color} ${stop.position}deg`).join(", ")})`,
    preview: `conic-gradient(from 0deg at center, ${conicStops.map((stop) => stop.color).join(", ")})`,
  })

  return gradients
}

// Función para generar variaciones de un gradiente
export const generateGradientVariations = (gradient: Gradient): Gradient[] => {
  const variations: Gradient[] = []

  // Solo para gradientes lineales
  if (gradient.type === "linear") {
    GRADIENT_DIRECTIONS.forEach((direction) => {
      if (direction.value !== gradient.direction) {
        variations.push({
          ...gradient,
          id: `${gradient.id}-${direction.value.replace(/\s+/g, "-")}`,
          name: `${gradient.name} (${direction.name})`,
          direction: direction.value,
          css: `linear-gradient(${direction.value}, ${gradient.stops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
          preview: `linear-gradient(${direction.value}, ${gradient.stops.map((stop) => stop.color).join(", ")})`,
        })
      }
    })
  }

  return variations.slice(0, 3) // Limitar a 3 variaciones
}

// Función para exportar gradientes como CSS
export const exportGradientsAsCSS = (gradients: Gradient[]): string => {
  let css = "/* Gradientes generados automáticamente */\n\n"

  gradients.forEach((gradient, index) => {
    css += `.gradient-${gradient.id} {\n`
    css += `  background: ${gradient.css};\n`
    css += `}\n\n`
  })

  return css
}

// Función para generar código CSS personalizado
export const generateCustomCSS = (gradient: Gradient, className = "custom-gradient"): string => {
  return `.${className} {
  background: ${gradient.css};
  /* Fallback para navegadores antiguos */
  background: ${gradient.stops[0].color};
}`
}
