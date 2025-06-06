"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Upload,
  ImageIcon,
  Palette,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Zap,
  Settings,
  FileText,
  Code,
} from "lucide-react"
import {
  ColorAnalysisEngine,
  type ColorAnalysisResult,
  type AnalyzedColor,
  type ColorPalette,
} from "@/lib/standalone-color-analysis"
import { copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"

interface StandaloneColorAnalysisProps {
  onColorsExtracted?: (colors: string[]) => void
  onColorSelect?: (color: string) => void
}

export function StandaloneColorAnalysis({ onColorsExtracted, onColorSelect }: StandaloneColorAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ColorAnalysisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Analysis options
  const [maxColors, setMaxColors] = useState(10)
  const [minPercentage, setMinPercentage] = useState(1)
  const [groupingThreshold, setGroupingThreshold] = useState(25)

  const { toast } = useToast()

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null)
      setAnalysisResult(null)

      // Validate file
      const validation = ColorAnalysisEngine.validateImageFile(file)
      if (!validation.isValid) {
        setError(validation.error || "Invalid file")
        return
      }

      setIsAnalyzing(true)

      try {
        // Create preview URL
        const imageUrl = URL.createObjectURL(file)
        setUploadedImage(imageUrl)

        // Analyze image
        const result = await ColorAnalysisEngine.analyzeImage(file, {
          maxColors,
          minPercentage,
          groupingThreshold,
          maxImageSize: 300,
        })

        setAnalysisResult(result)

        // Notify parent components
        if (onColorsExtracted) {
          const extractedColors = result.dominantColors.map((color) => color.hex)
          onColorsExtracted(extractedColors)
        }

        toast({
          title: "Analysis Complete!",
          description: `Extracted ${result.dominantColors.length} dominant colors in ${result.metadata.analysisTime.toFixed(0)}ms`,
        })
      } catch (err) {
        setError("Error analyzing image. Please try another image.")
        console.error("Analysis error:", err)
      } finally {
        setIsAnalyzing(false)
      }
    },
    [maxColors, minPercentage, groupingThreshold, onColorsExtracted, toast],
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

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedItem(text)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  const exportAnalysis = (format: "json" | "css") => {
    if (!analysisResult) return

    let content: string
    let filename: string
    let mimeType: string

    if (format === "json") {
      content = ColorAnalysisEngine.exportAnalysisAsJSON(analysisResult)
      filename = "color-analysis.json"
      mimeType = "application/json"
    } else {
      content = ColorAnalysisEngine.exportAnalysisAsCSS(analysisResult, "extracted")
      filename = "color-analysis.css"
      mimeType = "text/css"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const ColorCard = ({
    color,
    showPercentage = false,
    showDetails = false,
  }: {
    color: AnalyzedColor
    showPercentage?: boolean
    showDetails?: boolean
  }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-sm"
        style={{ backgroundColor: color.hex }}
        onClick={() => onColorSelect?.(color.hex)}
        title={`Select ${color.name}: ${color.hex}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{color.hex}</span>
          {showPercentage && (
            <Badge variant="secondary" className="text-xs">
              {color.percentage.toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{color.name}</div>
        {showDetails && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b}) • HSL({color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%)
          </div>
        )}
        {showPercentage && <Progress value={color.percentage} className="h-1 mt-1" />}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopy(color.hex, color.name || "Color")}
        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {copiedItem === color.hex ? (
          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        )}
      </Button>
    </div>
  )

  const PaletteSection = ({ palette }: { palette: ColorPalette }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{palette.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{palette.description}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {palette.type}
        </Badge>
      </div>
      <div className="space-y-2">
        {palette.colors.map((color, index) => (
          <ColorCard key={index} color={color} showDetails />
        ))}
      </div>
    </div>
  )

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Standalone Color Analysis
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Advanced color extraction and palette generation from images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Settings */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Analysis Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Max Colors: {maxColors}</Label>
              <Slider
                value={[maxColors]}
                onValueChange={(value) => setMaxColors(value[0])}
                min={3}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Min Percentage: {minPercentage}%</Label>
              <Slider
                value={[minPercentage]}
                onValueChange={(value) => setMinPercentage(value[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Grouping Threshold: {groupingThreshold}</Label>
              <Slider
                value={[groupingThreshold]}
                onValueChange={(value) => setGroupingThreshold(value[0])}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("color-analysis-upload")?.click()}
        >
          <input
            id="color-analysis-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {isAnalyzing ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing image...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Click to upload or drag an image here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF, WebP, or BMP (max 50MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Image Preview */}
        {uploadedImage && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Uploaded Image</h3>
            <div className="relative">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded for analysis"
                className="w-full max-h-48 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Results</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAnalysis("json")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAnalysis("css")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Code className="w-4 h-4 mr-1" />
                  CSS
                </Button>
              </div>
            </div>

            {/* Analysis Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {analysisResult.totalPixels.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pixels Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {analysisResult.dominantColors.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Colors Found</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {analysisResult.metadata.analysisTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {analysisResult.palettes.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Palettes Generated</div>
              </div>
            </div>

            <Tabs defaultValue="dominant" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dominant" className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Dominant
                </TabsTrigger>
                <TabsTrigger value="palettes" className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  Palettes
                </TabsTrigger>
                <TabsTrigger value="average" className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Average
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dominant" className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most frequent colors in the image (minimum {minPercentage}% presence)
                  </p>
                  <div className="space-y-2">
                    {analysisResult.dominantColors.map((color, index) => (
                      <ColorCard key={index} color={color} showPercentage showDetails />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="palettes" className="space-y-6">
                {analysisResult.palettes.map((palette, index) => (
                  <PaletteSection key={index} palette={palette} />
                ))}
              </TabsContent>

              <TabsContent value="average" className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average color calculated from all pixels in the image
                  </p>
                  <ColorCard color={analysisResult.averageColor} showDetails />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Image Dimensions</Label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResult.metadata.imageSize.width} × {analysisResult.metadata.imageSize.height} pixels
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Analysis Settings</Label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Max Colors: {maxColors}, Min %: {minPercentage}, Threshold: {groupingThreshold}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color Distribution</Label>
                    <div className="space-y-1">
                      {analysisResult.dominantColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm font-mono">{color.hex}</span>
                          <span className="text-sm text-gray-500">({color.percentage.toFixed(2)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
