"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay } from "date-fns"

interface DailyStats {
  date: string
  sessionCount: number
  duration: number
}

interface YearCalendarProps {
  dailyStats: DailyStats[]
}

export function YearCalendar({ dailyStats }: YearCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; minutes: number } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const calendarData = useMemo(() => {
    const now = new Date()
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)
    const days = eachDayOfInterval({ start: yearStart, end: yearEnd })

    // Convert dailyStats to a map for quick lookup
    const statsByDay = new Map<string, number>()
    dailyStats.forEach((stat) => {
      // Convert milliseconds to minutes
      const minutes = Math.round(stat.duration / 1000 / 60)
      statsByDay.set(stat.date, minutes)
    })

    return days.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd")
      const minutes = statsByDay.get(dateKey) || 0
      return { date: day, minutes }
    })
  }, [dailyStats])

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return "bg-muted"
    if (minutes <= 60) return "bg-muted-foreground/20"
    if (minutes <= 180) return "bg-muted-foreground/40"
    if (minutes <= 300) return "bg-muted-foreground/60"
    return "bg-muted-foreground/80"
  }

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleMouseMove = (e: React.MouseEvent, day: { date: Date; minutes: number }) => {
    setHoveredDay(day)
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Activity Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            <div className="flex flex-col gap-1 pr-2">
              {dayLabels.map((day) => (
                <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
              {calendarData.map((day, index) => {
                const dayOfWeek = (getDay(day.date) + 6) % 7
                return (
                  <div
                    key={index}
                    className={`h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-ring ${getIntensityClass(
                      day.minutes,
                    )}`}
                    style={{ gridRow: dayOfWeek + 1 }}
                    onMouseEnter={(e) => handleMouseMove(e, day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onMouseMove={(e) => handleMouseMove(e, day)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
            }}
          >
            <div className="font-medium">{format(hoveredDay.date, "MMM d, yyyy")}</div>
            <div className="text-muted-foreground">
              {hoveredDay.minutes > 0
                ? `${Math.floor(hoveredDay.minutes / 60)}h ${hoveredDay.minutes % 60}m`
                : "No meetings"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
