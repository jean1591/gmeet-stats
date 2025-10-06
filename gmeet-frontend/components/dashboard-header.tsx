"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Moon, Sun, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  userId: string
  lastUpdated: Date
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export function DashboardHeader({ userId, lastUpdated, isDarkMode, onToggleDarkMode }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy user ID",
        variant: "destructive",
      })
    }
  }

  const truncatedUserId = userId.length > 12 ? `${userId.slice(0, 8)}...${userId.slice(-4)}` : userId

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Meet Time Tracker</h1>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleCopyUserId}
            className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="font-mono">{truncatedUserId}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </p>
        <Button variant="outline" size="icon" onClick={onToggleDarkMode} className="bg-transparent transition-colors">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
