import { startOfYear, subDays, addMinutes } from "date-fns"

export function generateMockSessions(userId: string) {
  const sessions = []
  const now = new Date()
  const yearStart = startOfYear(now)

  // Generate sessions for the past year with varying patterns
  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 365)
    const startTime = subDays(now, daysAgo)

    // Random start hour between 8 AM and 8 PM
    startTime.setHours(8 + Math.floor(Math.random() * 12))
    startTime.setMinutes(Math.floor(Math.random() * 60))

    // Random duration between 15 minutes and 3 hours
    const durationMinutes = 15 + Math.floor(Math.random() * 165)
    const endTime = addMinutes(startTime, durationMinutes)

    sessions.push({
      id: `mock-session-${i}`,
      user_id: userId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      created_at: startTime.toISOString(),
      updated_at: startTime.toISOString(),
    })
  }

  // Sort by start time descending (most recent first)
  return sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
}
