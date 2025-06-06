"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, Download, Palette, Code, Eye, Layers, RefreshCw, Settings } from "lucide-react"
import {
  generateGradients,
  generateGradientVariations,
  exportGradientsAsCSS,
  generateCustomCSS,
  GRADIENT_DIRECTIONS,
  type Gradient,
} from "@/lib/gradient-utils"
import type { ExtractedColor } from "@/lib/image-analysis"
import { copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"

interface GradientGeneratorProps {
  colors: ExtractedColor[]
  onColorSelect: (color: string) => void
}

export function GradientGenerator({ colors, onColorSelect }: GradientGeneratorProps) {
  const [gradients, setGradients] = useState<Gradient[]>([])
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(null)
  const [customDirection, setCustomDirection] = useState("to right")
  const [customClassName, setCustomClassName] = useState("my-gradient")
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [showVariations, setShowVariations] = useState(false)
  const { toast } = useToast()

  // Generar gradientes cuando cambian los colores
  useEffect(() => {
    if (colors.length >= 2) {
      const newGradients = generateGradients(colors)
      setGradients(newGradients)
      setSelectedGradient(newGradients[0])
    } else {
      setGradients([])
      setSelectedGradient(null)
    }
  }, [colors])

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedItem(text)
      toast({
        title: "¡Copiado!",
        description: `${label} copiado al portapapeles`,
      })
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  const handleExportCSS = () => {
    const css = exportGradientsAsCSS(gradients)
    const blob = new Blob([css], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gradients.css"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRegenerateGradients = () => {
    if (colors.length >= 2) {
      const newGradients = generateGradients(colors)
      setGradients(newGradients)
      setSelectedGradient(newGradients[0])
      toast({
        title: "Gradientes regenerados",
        description: `Se crearon ${newGradients.length} nuevos gradientes`,
      })
    }
  }

  const updateGradientDirection = (gradient: Gradient, newDirection: string) => {
    const updatedGradient: Gradient = {
      ...gradient,
      direction: newDirection,
      css: `linear-gradient(${newDirection}, ${gradient.stops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`,
      preview: `linear-gradient(${newDirection}, ${gradient.stops.map((stop) => stop.color).join(", ")})`,
    }
    setSelectedGradient(updatedGradient)
  }

  const GradientCard = ({ gradient, isSelected = false }: { gradient: Gradient; isSelected?: boolean }) => (
    <div
      className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-gray-900 dark:border-gray-100 shadow-lg"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
      onClick={() => setSelectedGradient(gradient)}
    >
      <div className="h-24 rounded-t-md" style={{ background: gradient.preview }} />
      <div className="p-3 bg-white dark:bg-gray-900 rounded-b-md">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{gradient.name}</h4>
            <Badge variant="secondary" className="text-xs mt-1">
              {gradient.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy(gradient.css, gradient.name)
            }}
            className="h-8 w-8 p-0"
          >
            {copiedItem === gradient.css ? (
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  if (colors.length < 2) {
    return (
      <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Generador de Gradientes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Crea gradientes automáticos basados en los colores extraídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Palette className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Necesitas al menos 2 colores para generar gradientes.
              <br />
              Sube una imagen o selecciona colores de las paletas.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Generador de Gradientes
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Gradientes automáticos basados en {colors.length} colores extraídos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateGradients}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVariations(!showVariations)}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="w-4 h-4 mr-1" />
              {showVariations ? "Ocultar" : "Mostrar"} variaciones
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSS}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-1" />
            Exportar CSS
          </Button>
        </div>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery" className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Galería
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              Código
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradients.map((gradient) => (
                <GradientCard key={gradient.id} gradient={gradient} isSelected={selectedGradient?.id === gradient.id} />
              ))}
            </div>

            {/* Variaciones */}
            {showVariations && selectedGradient && selectedGradient.type === "linear" && (
              <div className="space-y-3">
                <Separator />
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Variaciones de "{selectedGradient.name}"
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generateGradientVariations(selectedGradient).map((variation) => (
                    <GradientCard key={variation.id} gradient={variation} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            {selectedGradient && (
              <div className="space-y-4">
                <div
                  className="h-32 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ background: selectedGradient.preview }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Dirección</Label>
                    <Select
                      value={selectedGradient.direction}
                      onValueChange={(value) => updateGradientDirection(selectedGradient, value)}
                      disabled={selectedGradient.type !== "linear"}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_DIRECTIONS.map((direction) => (
                          <SelectItem key={direction.value} value={direction.value}>
                            {direction.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Tipo</Label>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      {selectedGradient.type}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Colores del gradiente</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedGradient.stops.map((stop, index) => (
                      <button
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => onColorSelect(stop.color)}
                      >
                        <div
                          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: stop.color }}
                        />
                        <div className="text-left">
                          <div className="text-xs font-mono text-gray-900 dark:text-gray-100">{stop.color}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stop.position.toFixed(0)}%</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            {selectedGradient && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Nombre de clase CSS</Label>
                  <Input
                    value={customClassName}
                    onChange={(e) => setCustomClassName(e.target.value)}
                    placeholder="mi-gradiente"
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">CSS Generado</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generateCustomCSS(selectedGradient, customClassName), "CSS")}
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copiedItem === generateCustomCSS(selectedGradient, customClassName) ? (
                        <Check className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      Copiar
                    </Button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm overflow-x-auto">
                    <code className="text-gray-900 dark:text-gray-100">
                      {generateCustomCSS(selectedGradient, customClassName)}
                    </code>
                  </pre>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">CSS Inline</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(selectedGradient.css, "CSS inline")}
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copiedItem === selectedGradient.css ? (
                        <Check className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      Copiar
                    </Button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm overflow-x-auto">
                    <code className="text-gray-900 dark:text-gray-100">{selectedGradient.css}</code>
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
