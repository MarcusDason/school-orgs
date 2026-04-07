import { Users, Building2, CalendarCheck, BarChart3 } from "lucide-react"
import StatCard from "../components/StatCard"
import DashboardCharts from "../components/DashboardCharts"

export default function Dashboard() {

  const stats = {
    organizations: 12,
    students: 540,
    activeEvents: 8,
    avgMembers: 45
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-2 mt-3 text-gray-800 dark:text-white">
        Organization Dashboard
      </h1>

      <p className="mb-7 text-gray-600 dark:text-gray-300">
        Overview of all school organizations and their activities
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Total Organizations"
          value={stats.organizations}
          icon={Building2}
          bgColor="bg-blue-100 dark:bg-blue-900"
          iconColor="text-blue-600 dark:text-blue-300"
        />

        <StatCard
          title="Total Members"
          value={stats.students}
          icon={Users}
          bgColor="bg-green-100 dark:bg-green-900"
          iconColor="text-green-600 dark:text-green-300"
          change="+24 from last month"
        />

        <StatCard
          title="Active Events"
          value={stats.activeEvents}
          icon={CalendarCheck}
          bgColor="bg-purple-100 dark:bg-purple-900"
          iconColor="text-purple-600 dark:text-purple-300"
          change="+3 this month"
        />

        <StatCard
          title="Avg Members / Org"
          value={stats.avgMembers}
          icon={BarChart3}
          bgColor="bg-orange-100 dark:bg-orange-900"
          iconColor="text-orange-600 dark:text-orange-300"
        />

      </div>

      <DashboardCharts />

    </div>
  )
}