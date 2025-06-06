"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Layers, Copy, Check, Download, Plus, Minus, RefreshCw, Code, Eye, FileText, Palette, Zap } from "lucide-react"
import {
  GradientGenerator,
  type GradientConfig,
  type GradientCollection,
  type DesignExample,
} from "@/lib/standalone-gradient-generator"
import { copyToClipboard } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"

interface StandaloneGradientGeneratorProps {
  initialColors?: string[]
  onGradientSelect?: (gradient: GradientConfig) => void
}

export function StandaloneGradientGenerator({
  initialColors = ["#3B82F6", "#8B5CF6", "#EC4899"],
  onGradientSelect,
}: StandaloneGradientGeneratorProps) {
  const [colors, setColors] = useState<string[]>(initialColors)
  const [newColor, setNewColor] = useState("#FF0000")
  const [gradientCollection, setGradientCollection] = useState<GradientCollection | null>(null)
  const [selectedGradient, setSelectedGradient] = useState<GradientConfig | null>(null)
  const [designExamples, setDesignExamples] = useState<DesignExample[]>([])
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState("My Gradient Collection")
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()

  // Generate gradients when colors change
  useEffect(() => {
    if (colors.length >= 2) {
      generateGradients()
    }
  }, [colors])

  // Generate design examples when gradient is selected
  useEffect(() => {
    if (selectedGradient) {
      const examples = GradientGenerator.generateDesignExamples(selectedGradient)
      setDesignExamples(examples)
      onGradientSelect?.(selectedGradient)
    }
  }, [selectedGradient, onGradientSelect])

  const generateGradients = async () => {
    setIsGenerating(true)
    try {
      const collection = GradientGenerator.generateGradientCollection(colors, {
        includeVariations: true,
        maxGradients: 20,
        customName: collectionName,
      })
      setGradientCollection(collection)
      setSelectedGradient(collection.gradients[0])

      toast({
        title: "Gradients Generated!",
        description: `Created ${collection.gradients.length} gradients from ${colors.length} colors`,
      })
    } catch (error) {
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate gradients",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const addColor = () => {
    if (colors.length < 10 && !colors.includes(newColor)) {
      setColors([...colors, newColor])
      setNewColor("#FF0000")
    }
  }

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index))
    }
  }

  const updateColor = (index: number, newColor: string) => {
    const updatedColors = [...colors]
    updatedColors[index] = newColor
    setColors(updatedColors)
  }

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

  const exportCollection = (format: "css" | "scss" | "json") => {
    if (!gradientCollection) return

    let content: string
    let filename: string
    let mimeType: string

    switch (format) {
      case "css":
        content = GradientGenerator.exportCollectionAsCSS(gradientCollection, "gradient")
        filename = "gradients.css"
        mimeType = "text/css"
        break
      case "scss":
        content = GradientGenerator.exportCollectionAsSCSS(gradientCollection, "gradient")
        filename = "gradients.scss"
        mimeType = "text/scss"
        break
      case "json":
        content = GradientGenerator.exportCollectionAsJSON(gradientCollection)
        filename = "gradients.json"
        mimeType = "application/json"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const randomizeColors = () => {
    const randomColors = Array.from({ length: Math.floor(Math.random() * 4) + 3 }, () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
          .toUpperCase()
      )
    })
    setColors(randomColors)
  }

  const GradientCard = ({ gradient, isSelected = false }: { gradient: GradientConfig; isSelected?: boolean }) => (
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
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{gradient.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {gradient.type}
              </Badge>
              {gradient.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
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

  const DesignExampleCard = ({ example }: { example: DesignExample }) => (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{example.element}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(example.css, `${example.element} CSS`)}
          className="h-8 w-8 p-0"
        >
          {copiedItem === example.css ? (
            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">{example.description}</p>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Use Cases:</Label>
        <div className="flex flex-wrap gap-1">
          {example.useCase.map((useCase) => (
            <Badge key={useCase} variant="outline" className="text-xs">
              {useCase}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">CSS Code:</Label>
        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
          <code>{example.css}</code>
        </pre>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">HTML Example:</Label>
        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
          <code>{example.htmlExample}</code>
        </pre>
      </div>
    </div>
  )

  return (
    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Standalone Gradient Generator
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Create beautiful gradients from any set of colors with advanced customization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Input Colors</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={randomizeColors}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Random
              </Button>
            </div>
          </div>

          {/* Current Colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {colors.map((color, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="text-xs font-mono flex-1"
                  />
                  {colors.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColor(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Color */}
          {colors.length < 10 && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#FF0000"
                className="text-xs font-mono flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addColor}
                disabled={colors.includes(newColor)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Collection Settings */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Collection Name</Label>
          <Input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="My Gradient Collection"
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {/* Generate Button */}
        <Button onClick={generateGradients} disabled={colors.length < 2 || isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Gradients
            </>
          )}
        </Button>

        {/* Results */}
        {gradientCollection && (
          <div className="space-y-6">
            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generated Collection</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCollection("css")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Code className="w-4 h-4 mr-1" />
                  CSS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCollection("scss")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  SCSS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCollection("json")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Collection Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {gradientCollection.metadata.colorCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Input Colors</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {gradientCollection.metadata.gradientCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Gradients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {new Set(gradientCollection.gradients.map((g) => g.type)).size}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Types</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {new Set(gradientCollection.gradients.flatMap((g) => g.tags)).size}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Variations</div>
              </div>
            </div>

            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery" className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  Examples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gallery" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradientCollection.gradients.map((gradient) => (
                    <GradientCard
                      key={gradient.id}
                      gradient={gradient}
                      isSelected={selectedGradient?.id === gradient.id}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                {selectedGradient && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedGradient.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{selectedGradient.type}</Badge>
                        {selectedGradient.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div
                      className="h-32 rounded-lg border border-gray-300 dark:border-gray-600"
                      style={{ background: selectedGradient.preview }}
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">CSS Code</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedGradient.css, "CSS")}
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {copiedItem === selectedGradient.css ? (
                            <Check className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={selectedGradient.css}
                        readOnly
                        className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Gradient Stops</Label>
                      <div className="space-y-2">
                        {selectedGradient.stops.map((stop, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div
                              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: stop.color }}
                            />
                            <span className="font-mono text-sm">{stop.color}</span>
                            <span className="text-sm text-gray-500">{stop.position}%</span>
                            {stop.opacity && <span className="text-sm text-gray-500">α{stop.opacity}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                {designExamples.length > 0 ? (
                  <div className="space-y-6">
                    {designExamples.map((example, index) => (
                      <DesignExampleCard key={index} example={example} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Palette className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Select a gradient to see design examples</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
