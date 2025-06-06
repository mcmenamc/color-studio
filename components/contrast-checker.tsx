"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Eye, Lightbulb, RefreshCw } from "lucide-react"
import { getContrastRatio, evaluateContrast, suggestBetterContrast, type ContrastResult } from "@/lib/contrast-utils"
import { processColor } from "@/lib/color-utils"

interface ContrastCheckerProps {
  initialColor?: string
}

export function ContrastChecker({ initialColor = "#3b82f6" }: ContrastCheckerProps) {
  const [foregroundColor, setForegroundColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState(initialColor)
  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(null)
  const [suggestions, setSuggestions] = useState<{ color: string; ratio: number }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Actualizar cuando cambia el color inicial
  useEffect(() => {
    if (initialColor) {
      setBackgroundColor(initialColor)
    }
  }, [initialColor])

  // Calcular contraste cuando cambian los colores
  useEffect(() => {
    const ratio = getContrastRatio(foregroundColor, backgroundColor)
    if (ratio) {
      const result = evaluateContrast(ratio)
      setContrastResult(result)
    } else {
      setContrastResult(null)
    }
  }, [foregroundColor, backgroundColor])

  const handleSuggestColors = () => {
    const newSuggestions = suggestBetterContrast(backgroundColor, 4.5)
    setSuggestions(newSuggestions)
    setShowSuggestions(true)
  }

  const handleSwapColors = () => {
    const temp = foregroundColor
    setForegroundColor(backgroundColor)
    setBackgroundColor(temp)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "AAA":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "AA":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "AA Large":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Fail":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "AAA":
      case "AA":
        return <CheckCircle className="w-4 h-4" />
      case "AA Large":
        return <Eye className="w-4 h-4" />
      case "Fail":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Verificador de Contraste
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Verifica la accesibilidad del contraste entre colores según las pautas WCAG
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs de colores */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foreground" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Color de texto (primer plano)
            </Label>
            <div className="flex gap-2">
              <Input
                id="foreground"
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="color"
                value={processColor(foregroundColor).isValid ? processColor(foregroundColor).hex : "#000000"}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-12 h-10 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Color de fondo
            </Label>
            <div className="flex gap-2">
              <Input
                id="background"
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="color"
                value={processColor(backgroundColor).isValid ? processColor(backgroundColor).hex : "#ffffff"}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapColors}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Intercambiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestColors}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Sugerir colores
          </Button>
        </div>

        {/* Vista previa */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Vista previa</h3>
          <div
            className="p-6 rounded-lg border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: processColor(backgroundColor).isValid ? backgroundColor : "#ffffff" }}
          >
            <div
              className="space-y-2"
              style={{ color: processColor(foregroundColor).isValid ? foregroundColor : "#000000" }}
            >
              <h4 className="text-lg font-semibold">Texto normal (16px)</h4>
              <p className="text-sm">Texto pequeño (14px) - Requiere mayor contraste</p>
              <p className="text-xl font-bold">Texto grande (18px+) - Menor contraste requerido</p>
              <button className="px-3 py-1 border rounded text-sm">Componente UI</button>
            </div>
          </div>
        </div>

        {/* Resultado del contraste */}
        {contrastResult && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Resultado de accesibilidad</h3>

              <div className="flex items-center gap-3">
                <Badge className={getLevelColor(contrastResult.level)}>
                  {getLevelIcon(contrastResult.level)}
                  <span className="ml-1">{contrastResult.level}</span>
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ratio: <span className="font-mono font-semibold">{contrastResult.ratio.toFixed(2)}:1</span>
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">{contrastResult.description}</p>

              {/* Detalles de cumplimiento */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${contrastResult.normalText ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {contrastResult.normalText ? "✓" : "✗"} Texto normal
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">16px regular</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${contrastResult.largeText ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {contrastResult.largeText ? "✓" : "✗"} Texto grande
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">18px+ o 14px bold</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${contrastResult.uiComponents ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {contrastResult.uiComponents ? "✓" : "✗"} Componentes UI
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Botones, bordes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Colores sugeridos para mejor contraste
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setForegroundColor(suggestion.color)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: suggestion.color }}
                    />
                    <div className="text-left">
                      <div className="text-xs font-mono text-gray-900 dark:text-gray-100">{suggestion.color}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.ratio.toFixed(2)}:1</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
