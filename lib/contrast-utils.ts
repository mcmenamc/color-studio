// Función para convertir HEX a RGB numérico
export const hexToRgbNumbers = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  }
}

// Función para convertir RGB string a números
export const rgbStringToNumbers = (rgb: string): { r: number; g: number; b: number } | null => {
  const result = rgb.match(/\d+/g)
  if (!result || result.length !== 3) return null

  return {
    r: Number.parseInt(result[0]),
    g: Number.parseInt(result[1]),
    b: Number.parseInt(result[2]),
  }
}

// Calcular luminancia relativa según WCAG
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

// Calcular ratio de contraste
export const getContrastRatio = (color1: string, color2: string): number | null => {
  let rgb1, rgb2

  // Detectar formato y convertir a RGB
  if (color1.startsWith("#")) {
    rgb1 = hexToRgbNumbers(color1)
  } else if (color1.startsWith("rgb")) {
    rgb1 = rgbStringToNumbers(color1)
  } else {
    return null
  }

  if (color2.startsWith("#")) {
    rgb2 = hexToRgbNumbers(color2)
  } else if (color2.startsWith("rgb")) {
    rgb2 = rgbStringToNumbers(color2)
  } else {
    return null
  }

  if (!rgb1 || !rgb2) return null

  const luminance1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

// Evaluar nivel de accesibilidad WCAG
export interface ContrastResult {
  ratio: number
  level: "AAA" | "AA" | "AA Large" | "Fail"
  description: string
  normalText: boolean
  largeText: boolean
  uiComponents: boolean
}

export const evaluateContrast = (ratio: number): ContrastResult => {
  if (ratio >= 7) {
    return {
      ratio,
      level: "AAA",
      description: "Excelente contraste - Cumple AAA para todo tipo de texto",
      normalText: true,
      largeText: true,
      uiComponents: true,
    }
  } else if (ratio >= 4.5) {
    return {
      ratio,
      level: "AA",
      description: "Buen contraste - Cumple AA para texto normal y AAA para texto grande",
      normalText: true,
      largeText: true,
      uiComponents: true,
    }
  } else if (ratio >= 3) {
    return {
      ratio,
      level: "AA Large",
      description: "Contraste mínimo - Solo cumple AA para texto grande",
      normalText: false,
      largeText: true,
      uiComponents: true,
    }
  } else {
    return {
      ratio,
      level: "Fail",
      description: "Contraste insuficiente - No cumple estándares de accesibilidad",
      normalText: false,
      largeText: false,
      uiComponents: false,
    }
  }
}

// Sugerir colores con mejor contraste
export const suggestBetterContrast = (baseColor: string, targetRatio = 4.5): { color: string; ratio: number }[] => {
  const suggestions: { color: string; ratio: number }[] = []

  // Generar variaciones más claras y más oscuras
  const baseRgb = baseColor.startsWith("#") ? hexToRgbNumbers(baseColor) : rgbStringToNumbers(baseColor)
  if (!baseRgb) return suggestions

  // Sugerir blanco y negro como opciones básicas
  const whiteRatio = getContrastRatio(baseColor, "#FFFFFF")
  const blackRatio = getContrastRatio(baseColor, "#000000")

  if (whiteRatio && whiteRatio >= targetRatio) {
    suggestions.push({ color: "#FFFFFF", ratio: whiteRatio })
  }

  if (blackRatio && blackRatio >= targetRatio) {
    suggestions.push({ color: "#000000", ratio: blackRatio })
  }

  // Generar grises con buen contraste
  for (let i = 0; i <= 255; i += 17) {
    const grayHex = `#${i.toString(16).padStart(2, "0").repeat(3)}`
    const ratio = getContrastRatio(baseColor, grayHex)

    if (ratio && ratio >= targetRatio && !suggestions.find((s) => s.color === grayHex)) {
      suggestions.push({ color: grayHex, ratio })
    }
  }

  return suggestions.sort((a, b) => b.ratio - a.ratio).slice(0, 5)
}
