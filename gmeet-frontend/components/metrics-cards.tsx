"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfMonth, endOfMonth, startOfWeek, parseISO } from "date-fns"

interface DailyStats {
  date: string
  sessionCount: number
  duration: number
}

interface MetricsCardsProps {
  summary: {
    thisMonth: {
      count: number
      duration: number
    }
  }
  dailyStats: DailyStats[]
}

export function MetricsCards({ summary, dailyStats }: MetricsCardsProps) {
  const metrics = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Filter dailyStats for this month
    const thisMonthStats = dailyStats.filter((stat) => {
      const date = parseISO(stat.date)
      return date >= monthStart && date <= monthEnd
    })

    // Longest single day duration (not individual meeting, but busiest day works for this)
    const longestDay = thisMonthStats.reduce(
      (max, stat) => (stat.duration > max.duration ? stat : max),
      thisMonthStats[0] || { duration: 0, date: "", sessionCount: 0 },
    )

    // Busiest day (same as longest day in this context)
    const busiestDay = longestDay

    // Average meetings per week
    const weeks = new Set<string>()
    thisMonthStats.forEach((stat) => {
      const date = parseISO(stat.date)
      const weekKey = format(startOfWeek(date), "yyyy-ww")
      weeks.add(weekKey)
    })
    const avgPerWeek = weeks.size > 0 ? Math.round(summary.thisMonth.count / weeks.size) : 0

    // Convert durations from ms to minutes
    const longestDayMinutes = Math.round(longestDay.duration / 1000 / 60)
    const busiestDayMinutes = Math.round(busiestDay.duration / 1000 / 60)

    return {
      longestMeeting: {
        duration: longestDayMinutes,
        date: longestDay.date ? format(parseISO(longestDay.date), "MMM d") : "N/A",
      },
      busiestDay: {
        total: busiestDayMinutes,
        date: busiestDay.date ? format(parseISO(busiestDay.date), "MMM d") : "N/A",
      },
      avgPerWeek,
    }
  }, [summary, dailyStats])

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Longest Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {Math.floor(metrics.longestMeeting.duration / 60)}h {metrics.longestMeeting.duration % 60}m
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{metrics.longestMeeting.date}</p>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Busiest Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {Math.floor(metrics.busiestDay.total / 60)}h {metrics.busiestDay.total % 60}m
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{metrics.busiestDay.date}</p>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Meetings/Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.avgPerWeek}</div>
        </CardContent>
      </Card>
    </div>
  )
}
