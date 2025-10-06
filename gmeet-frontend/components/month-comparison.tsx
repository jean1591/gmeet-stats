"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isToday } from "date-fns"

interface Session {
  start_time: string
  duration: number
}

interface MonthComparisonProps {
  sessions: Session[]
}

export function MonthComparison({ sessions }: MonthComparisonProps) {
  const chartData = useMemo(() => {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const currentMonthDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })
    const lastMonthDays = eachDayOfInterval({ start: lastMonthStart, end: lastMonthEnd })

    // Group sessions by day
    const sessionsByDay = new Map<string, number>()
    sessions.forEach((session) => {
      const date = new Date(session.start_time)
      const dateKey = format(date, "yyyy-MM-dd")
      sessionsByDay.set(dateKey, (sessionsByDay.get(dateKey) || 0) + session.duration)
    })

    const currentMonthData = currentMonthDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd")
      return {
        date: day,
        minutes: sessionsByDay.get(dateKey) || 0,
        isToday: isToday(day),
      }
    })

    const lastMonthData = lastMonthDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd")
      return {
        date: day,
        minutes: sessionsByDay.get(dateKey) || 0,
      }
    })

    const maxMinutes = Math.max(...currentMonthData.map((d) => d.minutes), ...lastMonthData.map((d) => d.minutes), 1)

    return { currentMonthData, lastMonthData, maxMinutes }
  }, [sessions])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Current Month vs Last Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 overflow-x-auto">
          <div className="flex h-full items-end gap-1" style={{ minWidth: "max-content" }}>
            {chartData.currentMonthData.map((day, index) => {
              const lastMonthDay = chartData.lastMonthData[index]
              const currentHeight = (day.minutes / chartData.maxMinutes) * 100
              const lastHeight = lastMonthDay ? (lastMonthDay.minutes / chartData.maxMinutes) * 100 : 0

              return (
                <div key={index} className="relative flex flex-col items-center gap-1">
                  <div className="relative h-48 w-6">
                    {/* Last month bar (background) */}
                    {lastHeight > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t-sm bg-muted-foreground/30"
                        style={{ height: `${lastHeight}%` }}
                      />
                    )}
                    {/* Current month bar */}
                    {currentHeight > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t-sm bg-foreground transition-all hover:bg-foreground/80"
                        style={{ height: `${currentHeight}%` }}
                      />
                    )}
                    {/* Today indicator */}
                    {day.isToday && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{format(day.date, "d")}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-foreground" />
            <span className="text-muted-foreground">Current Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-muted-foreground/30" />
            <span className="text-muted-foreground">Last Month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
