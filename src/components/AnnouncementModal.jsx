import { useEffect } from "react"
import { db } from "../firebase/config"
import { ref, set } from "firebase/database"

export default function AnnouncementModal({
  announcement,
  onClose,
  formatDate,
  currentUser,
  userOrgs,
}) {
  useEffect(() => {
    if (!announcement || !currentUser) return

    const markAsRead = async () => {
      const readRef = ref(
        db,
        `announcements/${announcement.id}/readBy/${currentUser.uid}`
      )

      await set(readRef, true)
    }

    markAsRead()
  }, [announcement, currentUser])

  if (!announcement) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-5 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          Announcement Details
        </h2>

        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4">
          {announcement.message}
        </p>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span className="font-semibold">Sent by:</span>{" "}
          {announcement.senderName || "Unknown"}
        </div>

        <div className="text-xs text-gray-400 mb-2">
          {formatDate(announcement.createdAt)}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
            {announcement.orgIds?.map((id) => {
                const org = userOrgs?.find((o) => o.id === id)

                return (
                    <span
                    key={id}
                    className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    >
                    {org?.name || "Unknown Org"}
                    </span>
                )
            })}
        </div>

      </div>
    </div>
  )
}