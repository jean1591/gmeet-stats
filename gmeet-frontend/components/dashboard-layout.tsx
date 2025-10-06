"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { YearCalendar } from "@/components/year-calendar"
import { MonthComparison } from "@/components/month-comparison"
import { MetricsCards } from "@/components/metrics-cards"
import { RecentSessionsList } from "@/components/recent-sessions-list"
import { ErrorState } from "@/components/error-state"
import { EmptyState } from "@/components/empty-state"

interface Session {
  id: string
  user_id: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

interface DashboardLayoutProps {
  userId: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.stats.rb2.fr'

export function DashboardLayout({ userId }: DashboardLayoutProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setIsDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
      return newValue
    })
  }

  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`)

      if (!response.ok) {
        if (response.status === 404) {
          // User has no sessions yet
          setSessions([])
        } else {
          throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`)
        }
      } else {
        const data = await response.json()
        setSessions(data)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSessions()
  }, [userId])

  // Auto-refresh every hour
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions()
    }, 60 * 60 * 1000) // 1 hour in milliseconds

    return () => clearInterval(interval)
  }, [userId])

  // Calculate session durations and enrich data
  const enrichedSessions = useMemo(() => {
    return sessions.map((session) => ({
      ...session,
      duration: Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000 / 60), // duration in minutes
    }))
  }, [sessions])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardHeader
            userId={userId}
            lastUpdated={lastUpdated}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          <ErrorState error={error} onRetry={fetchSessions} />
        </div>
      </div>
    )
  }

  if (!loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardHeader
            userId={userId}
            lastUpdated={lastUpdated}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          <EmptyState />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader
          userId={userId}
          lastUpdated={lastUpdated}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <div className="mt-8 space-y-8">
          <StatsCards sessions={enrichedSessions} />
          <YearCalendar sessions={enrichedSessions} />
          <MonthComparison sessions={enrichedSessions} />
          <MetricsCards sessions={enrichedSessions} />
          <RecentSessionsList sessions={enrichedSessions} />
        </div>
      </div>
    </div>
  )
}
