"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ColorData } from "@/lib/color-utils"

interface ColorPickerProps {
  colorData: ColorData
  onColorChange: (color: string) => void
}

export function ColorPicker({ colorData, onColorChange }: ColorPickerProps) {
  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Selector Visual</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Usa el selector de color nativo del navegador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={colorData.isValid ? colorData.hex : "#000000"}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Haz clic en el cuadrado para abrir el selector de color
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
