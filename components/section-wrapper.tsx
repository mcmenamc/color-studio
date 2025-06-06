"use client"

import type React from "react"
import { Sparkles } from "lucide-react"

interface SectionWrapperProps {
  id: string
  title: string
  description: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function SectionWrapper({ id, title, description, children, className = "", icon }: SectionWrapperProps) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`}>
      <div className="space-y-8">
        {/* Enhanced Section Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-900/30 dark:via-gray-800/30 dark:to-gray-900/30 rounded-3xl -z-10 blur-3xl" />

          <div className="relative py-8 px-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              {/* {icon && (
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {icon}
                </div>
              )} */}
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-600 font-bold tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mt-6 font-medium">
              {description}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="relative">{children}</div>
      </div>
    </section>
  )
}
