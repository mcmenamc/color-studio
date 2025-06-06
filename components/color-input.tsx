"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shuffle } from "lucide-react"
import { generateRandomColor } from "@/lib/color-utils"

interface ColorInputProps {
  inputColor: string
  onColorChange: (color: string) => void
  error?: string
}

export function ColorInput({ inputColor, onColorChange, error }: ColorInputProps) {
  const handleRandomColor = () => {
    onColorChange(generateRandomColor())
  }

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ingresa un Color</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Puedes usar formato HEX (#RRGGBB) o RGB (rgb(255, 0, 0))
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Ej: #3b82f6 o rgb(59, 130, 246)"
            value={inputColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 border-gray-300 focus:border-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400 dark:placeholder-gray-500"
          />
          <Button
            onClick={handleRandomColor}
            variant="outline"
            size="icon"
            className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500"
          >
            <Shuffle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
