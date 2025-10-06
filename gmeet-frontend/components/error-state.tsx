"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  error: string
  onRetry: () => void
  onUseMockData?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Failed to load data</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <div className="mt-6">
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
