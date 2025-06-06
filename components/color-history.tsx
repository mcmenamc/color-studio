"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ColorHistoryProps {
  colorHistory: string[]
  onColorSelect: (color: string) => void
}

export function ColorHistory({ colorHistory, onColorSelect }: ColorHistoryProps) {
  if (colorHistory.length === 0) return null

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Historial de Colores</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Últimos colores utilizados (haz clic para seleccionar)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {colorHistory.map((color, index) => (
            <button
              key={index}
              className="aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-sm"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
