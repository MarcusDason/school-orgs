import { SquarePen, Trash } from "lucide-react"

export default function AnnouncementCard({
  item,
  isRead,
  onClick,
  formatDate,
  currentUser,
  onEdit,
  onDelete,
}) {
  const isMe = item.userId === currentUser?.uid

  const senderLabel = isMe ? "Me" : item.senderName || "Unknown"

  return (
    <div
      className={`relative group cursor-pointer border rounded-xl p-3 transition
        ${
          isRead
            ? "bg-white dark:bg-gray-800"
            : "bg-blue-50 dark:bg-gray-900 border-blue-400"
        }`}
    >
      {/* MAIN CONTENT */}
      <div onClick={() => onClick(item)}>
        {!isRead && (
          <div className="text-xs text-blue-600 font-semibold mb-1">
            ● New
          </div>
        )}

        <p className="text-sm text-gray-800 dark:text-gray-200">
          {item.message}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {senderLabel}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          {formatDate(item.createdAt)}
        </p>
      </div>

      {/* ACTION ICONS */}
      {isMe && (
        <div
          className="
            absolute top-2 right-2 flex gap-2
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            className="text-gray-500 hover:text-blue-600"
          >
            <SquarePen size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item)
            }}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  )
}