"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  summary: {
    totalSessions: number
    totalDuration: number
    avgDuration: number
    thisMonth: {
      count: number
      duration: number
    }
    thisYear: {
      count: number
      duration: number
    }
  }
}

export function StatsCards({ summary }: StatsCardsProps) {
  // Convert milliseconds to hours and minutes
  const totalMonthMinutes = Math.round(summary.thisMonth.duration / 1000 / 60)
  const totalYearMinutes = Math.round(summary.thisYear.duration / 1000 / 60)
  const avgDurationMinutes = Math.round(summary.avgDuration / 1000 / 60)

  const stats = {
    totalMonthTime: {
      hours: Math.floor(totalMonthMinutes / 60),
      minutes: totalMonthMinutes % 60,
    },
    totalMeetings: summary.thisMonth.count,
    avgDuration: avgDurationMinutes,
    totalYearTime: {
      hours: Math.floor(totalYearMinutes / 60),
      minutes: totalYearMinutes % 60,
    },
  }

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
