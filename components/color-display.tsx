"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from "lucide-react"
import { type ColorData, copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ColorDisplayProps {
  colorData: ColorData
}

export function ColorDisplay({ colorData }: ColorDisplayProps) {
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

  if (!colorData.isValid) return null

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Color Preview */}
      <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className="w-full h-40 rounded-lg border border-gray-300 dark:border-gray-600 shadow-inner"
              style={{ backgroundColor: colorData.hex }}
            />
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Color seleccionado</p>
              <p className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">{colorData.hex}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Values */}
      <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Valores de Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                HEX
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(colorData.hex, "Código HEX")}
                className="h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {copiedText === colorData.hex ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
            <div className="font-mono text-lg bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              {colorData.hex}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                RGB
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(colorData.rgb, "Código RGB")}
                className="h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {copiedText === colorData.rgb ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
            <div className="font-mono text-lg bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              {colorData.rgb}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
