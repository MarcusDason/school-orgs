export default function StatCard({
  title,
  value,
  icon: Icon,
  bgColor,
  iconColor,
  change
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-200">

      {/* Text */}
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {title}
        </p>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {value}
        </h2>

        {change && (
          <p className="text-sm mt-1 text-green-600 dark:text-green-400">
            {change}
          </p>
        )}
      </div>

      {/* Icon */}
      <div className={`${bgColor} p-3 rounded-lg`}>
        <Icon className={`${iconColor} w-6 h-6`} />
      </div>

    </div>
  );
}