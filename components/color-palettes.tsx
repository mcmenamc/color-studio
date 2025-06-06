"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { COLOR_PALETTES } from "@/lib/color-palettes"
import { copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"

interface ColorPalettesProps {
  onColorSelect: (color: string) => void
}

export function ColorPalettes({ onColorSelect }: ColorPalettesProps) {
  const [selectedPalette, setSelectedPalette] = useState<string>("Material Design")
  const [expandedColor, setExpandedColor] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedText(text)
      toast({
        title: "¡Copiado!",
        description: `${label} copiado al portapapeles`,
      })
      setTimeout(() => setCopiedText(null), 2000)
    } else {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  const currentPalette = COLOR_PALETTES.find((p) => p.name === selectedPalette)

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paletas de Colores</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Explora paletas de colores predefinidas y profesionales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Paleta */}
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTES.map((palette) => (
            <Button
              key={palette.name}
              variant={selectedPalette === palette.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPalette(palette.name)}
              className={
                selectedPalette === palette.name
                  ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500"
              }
            >
              {palette.name}
            </Button>
          ))}
        </div>

        {/* Paleta Seleccionada */}
        {currentPalette && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              {currentPalette.description}
            </p>

            <div className="space-y-6">
              {currentPalette.colors.map((color) => (
                <div key={color.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{color.name}</h4>
                    {color.shades && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedColor(expandedColor === color.name ? null : color.name)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {expandedColor === color.name ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Ocultar tonos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Ver tonos
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Color principal */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => onColorSelect(color.hex)}
                      title={`${color.name}: ${color.hex}`}
                    />
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100 flex-1">{color.hex}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(color.hex, `${color.name}`)}
                      className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {copiedText === color.hex ? (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Tonos expandidos */}
                  {color.shades && expandedColor === color.name && (
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      {color.shades.map((shade) => (
                        <div key={shade.name} className="text-center">
                          <button
                            className="w-full aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-sm mb-2"
                            style={{ backgroundColor: shade.hex }}
                            onClick={() => onColorSelect(shade.hex)}
                            title={`${color.name} ${shade.name}: ${shade.hex}`}
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{shade.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
