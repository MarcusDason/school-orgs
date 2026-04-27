export default function Announcements() {
  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          📢 Announcements
        </h2>
      </div>

      {/* ITEMS */}
      <div className="space-y-3">

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <p className="font-semibold text-blue-600">System Update</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Maintenance tonight at 11PM.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <p className="font-semibold text-green-600">New Feature</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Image upload is now available.
          </p>
        </div>

      </div>

    </div>
  )
}