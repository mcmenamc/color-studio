export interface ColorData {
  hex: string
  rgb: string
  isValid: boolean
  error?: string
}

// Función para convertir HEX a RGB
export const hexToRgb = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)

  return `rgb(${r}, ${g}, ${b})`
}

// Función para convertir RGB a HEX
export const rgbToHex = (rgb: string): string | null => {
  const result = rgb.match(/\d+/g)
  if (!result || result.length !== 3) return null

  const r = Number.parseInt(result[0])
  const g = Number.parseInt(result[1])
  const b = Number.parseInt(result[2])

  if (r > 255 || g > 255 || b > 255) return null

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Validar formato HEX
export const isValidHex = (hex: string): boolean => {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

// Validar formato RGB
export const isValidRgb = (rgb: string): boolean => {
  const rgbRegex = /^rgb$$\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$$$/
  const match = rgb.match(rgbRegex)
  if (!match) return false

  const [, r, g, b] = match
  return Number.parseInt(r) <= 255 && Number.parseInt(g) <= 255 && Number.parseInt(b) <= 255
}

// Detectar formato de color
export const detectColorFormat = (color: string): "hex" | "rgb" | "invalid" => {
  const trimmedColor = color.trim()
  if (isValidHex(trimmedColor)) return "hex"
  if (isValidRgb(trimmedColor)) return "rgb"
  return "invalid"
}

// Procesar color ingresado
export const processColor = (color: string): ColorData => {
  const trimmedColor = color.trim()
  const format = detectColorFormat(trimmedColor)

  if (format === "invalid") {
    return {
      hex: "",
      rgb: "",
      isValid: false,
      error: "Formato de color inválido. Use #RRGGBB o rgb(r, g, b)",
    }
  }

  if (format === "hex") {
    const normalizedHex = trimmedColor.startsWith("#") ? trimmedColor : `#${trimmedColor}`
    const rgbValue = hexToRgb(normalizedHex)

    if (!rgbValue) {
      return {
        hex: "",
        rgb: "",
        isValid: false,
        error: "Color hexadecimal inválido",
      }
    }

    return {
      hex: normalizedHex.toUpperCase(),
      rgb: rgbValue,
      isValid: true,
    }
  } else {
    const hexValue = rgbToHex(trimmedColor)

    if (!hexValue) {
      return {
        hex: "",
        rgb: "",
        isValid: false,
        error: "Color RGB inválido",
      }
    }

    return {
      hex: hexValue.toUpperCase(),
      rgb: trimmedColor,
      isValid: true,
    }
  }
}

// Generar color aleatorio
export const generateRandomColor = (): string => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  )
}

// Función para copiar al portapapeles
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    return false
  }
}
