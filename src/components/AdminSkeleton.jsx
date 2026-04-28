export default function AdminSkeleton() {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen animate-pulse">
      
      <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-6" />

      {/* STAT CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow space-y-3">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-6 w-16 bg-gray-400 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>

      {/* CHART AREA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl h-64 shadow" />

    </div>
  )
}