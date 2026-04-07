import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid
} from "recharts"

export default function DashboardCharts() {

  const membershipGrowth = [
    { month: "Jan", members: 200 },
    { month: "Feb", members: 260 },
    { month: "Mar", members: 310 },
    { month: "Apr", members: 400 },
    { month: "May", members: 470 }
  ]

  const membersByCategory = [
    { name: "Academic", value: 220 },
    { name: "Sports", value: 150 },
    { name: "Arts", value: 90 },
    { name: "Tech", value: 80 }
  ]

  const eventsPerMonth = [
    { month: "Jan", events: 4 },
    { month: "Feb", events: 6 },
    { month: "Mar", events: 3 },
    { month: "Apr", events: 7 },
    { month: "May", events: 5 }
  ]

  const topOrganizations = [
    { name: "Volunteer Corps", members: 62, growth: 12 },
    { name: "Drama Society", members: 26, growth: 8 },
    { name: "Student Council", members: 5, growth: 5 },
    { name: "Environmental Club", members: 41, growth: 15 },
    { name: "Music Ensemble", members: 38, growth: 6 }
  ]

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

  const maxMembers = Math.max(...topOrganizations.map(org => org.members))
  const sortedTopOrganizations = [...topOrganizations].sort((a, b) => b.members - a.members);

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-8">

      {/* Membership Growth */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
          Membership Growth
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={membershipGrowth}>
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="members"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Members by Category */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
          Members by Category
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={membersByCategory}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              labelLine={false}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {membersByCategory.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>

            <Tooltip formatter={(value, name) => [`${value} members`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Events Per Month */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
          Events per Month
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={eventsPerMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="events" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Organizations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">

        <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
          Top Organizations by Members
        </h2>

        <ol className="space-y-5">
          {sortedTopOrganizations.map(({ name, members, growth }, index) => {

            const barWidthPercent = (members / maxMembers) * 100;

            return (
              <li key={name} className="flex items-center gap-4">

                {/* Rank */}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold">
                  {index + 1}
                </div>

                {/* Name + Progress */}
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-white">
                    {name}
                  </div>

                  <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-1">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                </div>

                {/* Members */}
                <div className="whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium ml-4">
                  {members} members
                </div>

                {/* Growth */}
                <div className="text-green-600 dark:text-green-400 font-semibold ml-4">
                  +{growth}%
                </div>

              </li>
            )
          })}
        </ol>

      </div>

    </div>
  )
}