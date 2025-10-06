"use client"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">Meet Time Tracker</h1>
        <p className="mt-4 text-muted-foreground">
          Track your Google Meet session time and view detailed analytics.
        </p>
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6">
          <p className="text-sm text-muted-foreground">
            To view your dashboard, navigate to:
          </p>
          <code className="mt-2 block rounded bg-background px-3 py-2 text-sm font-mono text-foreground">
            stats.rb2.fr/[your-user-id]
          </code>
          <p className="mt-4 text-xs text-muted-foreground">
            Your User ID can be found in the Chrome extension popup.
          </p>
        </div>
      </div>
    </div>
  )
}
