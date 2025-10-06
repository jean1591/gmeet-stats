"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns"

interface Session {
  id: string
  start_time: string
  end_time: string
  duration: number
}

interface StatsCardsProps {
  sessions: Session[]
}

export function StatsCards({ sessions }: StatsCardsProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)

    const thisMonthSessions = sessions.filter((s) =>
      isWithinInterval(new Date(s.start_time), { start: monthStart, end: monthEnd }),
    )

    const thisYearSessions = sessions.filter((s) =>
      isWithinInterval(new Date(s.start_time), { start: yearStart, end: yearEnd }),
    )

    const totalMonthMinutes = thisMonthSessions.reduce((sum, s) => sum + s.duration, 0)
    const totalYearMinutes = thisYearSessions.reduce((sum, s) => sum + s.duration, 0)
    const avgDuration = thisMonthSessions.length > 0 ? totalMonthMinutes / thisMonthSessions.length : 0

    return {
      totalMonthTime: {
        hours: Math.floor(totalMonthMinutes / 60),
        minutes: totalMonthMinutes % 60,
      },
      totalMeetings: thisMonthSessions.length,
      avgDuration: Math.round(avgDuration),
      totalYearTime: {
        hours: Math.floor(totalYearMinutes / 60),
        minutes: totalYearMinutes % 60,
      },
    }
  }, [sessions])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Time This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalMonthTime.hours}h {stats.totalMonthTime.minutes}m
          </div>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Meetings This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.totalMeetings}</div>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.avgDuration} min</div>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Time This Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalYearTime.hours}h {stats.totalYearTime.minutes}m
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
