import { useEffect, useState } from "react"
import { ref, set, remove } from "firebase/database"
import { db } from "../firebase/config"

export default function AnnouncementModal({
  announcement,
  onClose,
  formatDate,
  currentUser,
  userOrgs,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")

  const isOwner = announcement?.userId === currentUser?.uid

  // Set initial message when modal opens
  useEffect(() => {
    if (announcement) {
      setEditText(announcement.message)
      setIsEditing(false)
    }
  }, [announcement])

  // mark as read
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

  // update message
  const handleUpdate = async () => {
    await set(ref(db, `announcements/${announcement.id}`), {
      ...announcement,
      message: editText,
    })

    setIsEditing(false)
  }

  // delete message
  const handleDelete = async () => {
    await remove(ref(db, `announcements/${announcement.id}`))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-5 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          Announcement Details
        </h2>

        {/* MESSAGE (EDITABLE) */}
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4"
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4">
            {announcement.message}
          </p>
        )}

        {/* SENDER */}
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span className="font-semibold">Sent by:</span>{" "}
          {announcement.senderName || "Unknown"}
        </div>

        {/* DATE */}
        <div className="text-xs text-gray-400 mb-2">
          {formatDate(announcement.createdAt)}
        </div>

        {/* ORGS */}
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

        {/* ACTIONS (EDIT / DELETE) */}
        {isOwner && (
          <div className="flex gap-2 mt-4">

            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="text-xs px-3 py-1 rounded bg-green-600 text-white"
                >
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-3 py-1 rounded bg-gray-500 text-white"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-3 py-1 rounded bg-blue-600 text-white"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="text-xs px-3 py-1 rounded bg-red-600 text-white"
                >
                  Delete
                </button>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  )
}