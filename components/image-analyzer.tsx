"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Upload, ImageIcon, Palette, Download, Copy, Check, AlertCircle, Loader2, Eye, Zap } from "lucide-react"
import {
  analyzeImage,
  validateImageFile,
  generateComplementaryPalette,
  type ImageAnalysisResult,
  type ExtractedColor,
} from "@/lib/image-analysis"
import { GradientGenerator } from "@/components/gradient-generator"
import { copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"

interface ImageAnalyzerProps {
  onColorSelect: (color: string) => void
}

export function ImageAnalyzer({ onColorSelect }: ImageAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null)
      setAnalysisResult(null)

      // Validar archivo
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        setError(validation.error || "Archivo no válido")
        return
      }

      setIsAnalyzing(true)

      try {
        // Crear URL para vista previa
        const imageUrl = URL.createObjectURL(file)
        setUploadedImage(imageUrl)

        // Analizar imagen
        const result = await analyzeImage(file)
        setAnalysisResult(result)

        toast({
          title: "¡Análisis completado!",
          description: `Se extrajeron ${result.dominantColors.length} colores dominantes`,
        })
      } catch (err) {
        setError("Error al analizar la imagen. Intente con otra imagen.")
        console.error("Error analyzing image:", err)
      } finally {
        setIsAnalyzing(false)
      }
    },
    [toast],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleCopyColor = async (color: string, name: string) => {
    const success = await copyToClipboard(color)
    if (success) {
      setCopiedColor(color)
      toast({
        title: "¡Copiado!",
        description: `${name} (${color}) copiado al portapapeles`,
      })
      setTimeout(() => setCopiedColor(null), 2000)
    }
  }

  const exportPalette = () => {
    if (!analysisResult) return

    const paletteData = {
      dominantColors: analysisResult.dominantColors,
      averageColor: analysisResult.averageColor,
      palette: analysisResult.palette,
      extractedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "color-palette.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const ColorCard = ({
    color,
    name,
    showPercentage = false,
  }: { color: ExtractedColor; name: string; showPercentage?: boolean }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-sm"
        style={{ backgroundColor: color.hex }}
        onClick={() => onColorSelect(color.hex)}
        title={`Seleccionar ${name}: ${color.hex}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{color.hex}</span>
          {showPercentage && (
            <Badge variant="secondary" className="text-xs">
              {color.percentage.toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{name}</div>
        {showPercentage && <Progress value={color.percentage} className="h-1 mt-1" />}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopyColor(color.hex, name)}
        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {copiedColor === color.hex ? (
          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        )}
      </Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Analizador de Imágenes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Extrae y analiza colores dominantes de cualquier imagen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zona de carga */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <input id="image-upload" type="file" accept="image/*" onChange={handleFileInput} className="hidden" />

            {isAnalyzing ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Analizando imagen...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Haz clic para subir o arrastra una imagen aquí
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF o WebP (máx. 10MB)</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Vista previa de imagen */}
          {uploadedImage && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Imagen cargada</h3>
              <div className="relative">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Imagen cargada"
                  className="w-full max-h-48 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          )}

          {/* Resultados del análisis */}
          {analysisResult && (
            <div className="space-y-6">
              <Separator />

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Análisis de Colores</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPalette}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              </div>

              <Tabs defaultValue="dominant" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dominant" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Dominantes
                  </TabsTrigger>
                  <TabsTrigger value="palette" className="flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    Paleta
                  </TabsTrigger>
                  <TabsTrigger value="complementary" className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Complementarios
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dominant" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Colores más frecuentes en la imagen (ordenados por frecuencia)
                    </p>

                    {/* Color promedio */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Color promedio</h4>
                      <ColorCard color={analysisResult.averageColor} name="Promedio general" />
                    </div>

                    {/* Colores dominantes */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Colores dominantes ({analysisResult.dominantColors.length})
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.dominantColors.map((color, index) => (
                          <ColorCard key={index} color={color} name={`Dominante ${index + 1}`} showPercentage={true} />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="palette" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Paleta balanceada con colores diversos extraídos de la imagen
                    </p>
                    <div className="space-y-2">
                      {analysisResult.palette.map((color, index) => (
                        <ColorCard key={index} color={color} name={`Paleta ${index + 1}`} showPercentage={true} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="complementary" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Colores complementarios generados a partir de los dominantes
                    </p>
                    <div className="space-y-2">
                      {generateComplementaryPalette(analysisResult.dominantColors).map((color, index) => (
                        <ColorCard key={index} color={color} name={`Complementario ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {analysisResult.totalPixels.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Píxeles analizados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {analysisResult.dominantColors.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Colores únicos</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generador de Gradientes */}
      {analysisResult && <GradientGenerator colors={analysisResult.dominantColors} onColorSelect={onColorSelect} />}
    </div>
  )
}
