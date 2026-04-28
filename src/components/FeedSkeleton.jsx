export default function FeedSkeleton() {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      
      <div className="max-w-full mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ================= FEED SKELETON (8–9 cols) ================= */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden animate-pulse"
              >
                {/* HEADER */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-gray-700" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>

                  <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* CONTENT */}
                <div className="px-4 pb-3 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
                </div>

                {/* IMAGE */}
                <div className="w-full h-56 bg-gray-300 dark:bg-gray-700" />

                {/* ACTIONS */}
                <div className="flex justify-around p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* ================= RIGHT SIDEBAR SKELETON (3–4 cols) ================= */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">

            {/* ANNOUNCEMENTS HEADER */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 animate-pulse">
              <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>

            {/* ANNOUNCEMENTS CARDS */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-3 animate-pulse"
              >
                <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-2 w-4/5 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            ))}

            {/* OPTIONAL: extra sidebar block (feels more real like Facebook) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 animate-pulse">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}