export default function NeutralSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  )
}