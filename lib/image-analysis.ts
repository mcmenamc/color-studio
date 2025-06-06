// Función para extraer colores dominantes de una imagen
export interface ExtractedColor {
  hex: string
  rgb: { r: number; g: number; b: number }
  percentage: number
  count: number
}

export interface ImageAnalysisResult {
  dominantColors: ExtractedColor[]
  totalPixels: number
  averageColor: ExtractedColor
  palette: ExtractedColor[]
}

// Función para convertir RGB a HEX
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

// Función para calcular distancia entre colores
const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number => {
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2))
}

// Función para agrupar colores similares
const groupSimilarColors = (colors: Map<string, number>, threshold = 30): ExtractedColor[] => {
  const colorArray = Array.from(colors.entries()).map(([hex, count]) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return { hex, rgb: { r, g, b }, count }
  })

  const groups: ExtractedColor[] = []

  for (const color of colorArray) {
    let addedToGroup = false

    for (const group of groups) {
      if (colorDistance(color.rgb, group.rgb) < threshold) {
        group.count += color.count
        addedToGroup = true
        break
      }
    }

    if (!addedToGroup) {
      groups.push({
        hex: color.hex,
        rgb: color.rgb,
        count: color.count,
        percentage: 0, // Se calculará después
      })
    }
  }

  return groups
}

// Función principal para analizar imagen
export const analyzeImage = (file: File): Promise<ImageAnalysisResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Redimensionar imagen para mejor rendimiento
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"))
          return
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const totalPixels = canvas.width * canvas.height

        // Contar colores
        const colorCounts = new Map<string, number>()
        let totalR = 0,
          totalG = 0,
          totalB = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]

          // Ignorar píxeles transparentes
          if (alpha < 128) continue

          totalR += r
          totalG += g
          totalB += b

          const hex = rgbToHex(r, g, b)
          colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
        }

        // Agrupar colores similares
        const groupedColors = groupSimilarColors(colorCounts, 25)

        // Calcular porcentajes
        const validPixels = Array.from(colorCounts.values()).reduce((sum, count) => sum + count, 0)
        groupedColors.forEach((color) => {
          color.percentage = (color.count / validPixels) * 100
        })

        // Ordenar por frecuencia
        groupedColors.sort((a, b) => b.count - a.count)

        // Obtener colores dominantes (top 10)
        const dominantColors = groupedColors.slice(0, 10)

        // Calcular color promedio
        const avgR = Math.round(totalR / validPixels)
        const avgG = Math.round(totalG / validPixels)
        const avgB = Math.round(totalB / validPixels)
        const averageColor: ExtractedColor = {
          hex: rgbToHex(avgR, avgG, avgB),
          rgb: { r: avgR, g: avgG, b: avgB },
          percentage: 0,
          count: 0,
        }

        // Crear paleta balanceada (colores más diversos)
        const palette = createBalancedPalette(groupedColors)

        resolve({
          dominantColors,
          totalPixels: validPixels,
          averageColor,
          palette,
        })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"))
    }

    // Configurar CORS para evitar problemas
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

// Función para crear una paleta balanceada
const createBalancedPalette = (colors: ExtractedColor[]): ExtractedColor[] => {
  const palette: ExtractedColor[] = []
  const minDistance = 50 // Distancia mínima entre colores en la paleta

  for (const color of colors) {
    if (palette.length >= 8) break

    const isTooSimilar = palette.some((paletteColor) => colorDistance(color.rgb, paletteColor.rgb) < minDistance)

    if (!isTooSimilar) {
      palette.push(color)
    }
  }

  return palette
}

// Función para validar archivo de imagen
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato de archivo no válido. Use JPG, PNG, GIF o WebP.",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 10MB.",
    }
  }

  return { isValid: true }
}

// Función para generar paleta complementaria
export const generateComplementaryPalette = (baseColors: ExtractedColor[]): ExtractedColor[] => {
  const complementary: ExtractedColor[] = []

  baseColors.slice(0, 5).forEach((color) => {
    // Calcular color complementario
    const compR = 255 - color.rgb.r
    const compG = 255 - color.rgb.g
    const compB = 255 - color.rgb.b

    complementary.push({
      hex: rgbToHex(compR, compG, compB),
      rgb: { r: compR, g: compG, b: compB },
      percentage: 0,
      count: 0,
    })
  })

  return complementary
}
