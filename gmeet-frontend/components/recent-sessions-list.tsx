"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface Session {
  id: string
  start_time: string
  end_time: string
  duration: number
}

interface RecentSessionsListProps {
  sessions: Session[]
}

export function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  // Sessions are already sorted and limited to 10 by backend
  const recentSessions = sessions

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Start Time</TableHead>
              <TableHead className="text-muted-foreground">End Time</TableHead>
              <TableHead className="text-right text-muted-foreground">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSessions.map((session) => (
              <TableRow key={session.id} className="transition-colors hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">
                  {format(new Date(session.start_time), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-foreground">{format(new Date(session.start_time), "h:mm a")}</TableCell>
                <TableCell className="text-foreground">{format(new Date(session.end_time), "h:mm a")}</TableCell>
                <TableCell className="text-right text-foreground">
                  {Math.floor(session.duration / 1000 / 60 / 60)}h {Math.floor((session.duration / 1000 / 60) % 60)}m
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
