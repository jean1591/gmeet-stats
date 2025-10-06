"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfWeek } from "date-fns"

interface Session {
  start_time: string
  duration: number
}

interface MetricsCardsProps {
  sessions: Session[]
}

export function MetricsCards({ sessions }: MetricsCardsProps) {
  const metrics = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const thisMonthSessions = sessions.filter((s) =>
      isWithinInterval(new Date(s.start_time), { start: monthStart, end: monthEnd }),
    )

    // Longest meeting
    const longestMeeting = thisMonthSessions.reduce(
      (max, s) => (s.duration > max.duration ? s : max),
      thisMonthSessions[0] || { duration: 0, start_time: "" },
    )

    // Busiest day
    const dayTotals = new Map<string, { date: Date; total: number }>()
    thisMonthSessions.forEach((s) => {
      const date = new Date(s.start_time)
      const dateKey = format(date, "yyyy-MM-dd")
      const existing = dayTotals.get(dateKey)
      if (existing) {
        existing.total += s.duration
      } else {
        dayTotals.set(dateKey, { date, total: s.duration })
      }
    })

    const busiestDay = Array.from(dayTotals.values()).reduce((max, day) => (day.total > max.total ? day : max), {
      date: new Date(),
      total: 0,
    })

    // Average meetings per week
    const weeks = new Set<string>()
    thisMonthSessions.forEach((s) => {
      const weekKey = format(startOfWeek(new Date(s.start_time)), "yyyy-ww")
      weeks.add(weekKey)
    })
    const avgPerWeek = weeks.size > 0 ? Math.round(thisMonthSessions.length / weeks.size) : 0

    return {
      longestMeeting: {
        duration: longestMeeting.duration,
        date: longestMeeting.start_time ? format(new Date(longestMeeting.start_time), "MMM d") : "N/A",
      },
      busiestDay: {
        total: busiestDay.total,
        date: busiestDay.total > 0 ? format(busiestDay.date, "MMM d") : "N/A",
      },
      avgPerWeek,
    }
  }, [sessions])

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
