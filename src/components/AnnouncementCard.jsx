export default function AnnouncementCard({
  item,
  isRead,
  onClick,
  formatDate,
  currentUser,
}) {
  const isMe = item.userId === currentUser?.uid

  const senderLabel = isMe
    ? "Me"
    : item.senderName || "Unknown"

  return (
    <div
      onClick={() => onClick(item)}
      className={`cursor-pointer border rounded-xl p-3 transition
        ${
          isRead
            ? "bg-white dark:bg-gray-800"
            : "bg-blue-50 dark:bg-gray-900 border-blue-400"
        }`}
    >
      {/* UNREAD BADGE */}
      {!isRead && (
        <div className="text-xs text-blue-600 font-semibold mb-1">
          ● New
        </div>
      )}

      <p className="text-sm text-gray-800 dark:text-gray-200">
        {item.message}
      </p>

      {/* SENDER */}
      <p className="text-xs text-gray-500 mt-1">
        {senderLabel}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {formatDate(item.createdAt)}
      </p>
    </div>
  )
}