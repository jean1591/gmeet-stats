import { Calendar } from "lucide-react"

export function EmptyState() {
  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="text-center">
        <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">No meetings tracked yet</h2>
        <p className="mt-2 text-muted-foreground">
          Install the Chrome extension and join a Google Meet to start tracking.
        </p>
      </div>
    </div>
  )
}
