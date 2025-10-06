import { DashboardLayout } from "@/components/dashboard-layout"

export default function UserDashboardPage({ params }: { params: { userId: string } }) {
  return <DashboardLayout userId={params.userId} />
}
