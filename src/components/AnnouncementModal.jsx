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

  useEffect(() => {
    if (announcement) {
      setEditText(announcement.message)
      setIsEditing(false)
    }
  }, [announcement])

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

  const handleUpdate = async () => {
    await set(ref(db, `announcements/${announcement.id}`), {
      ...announcement,
      message: editText,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await remove(ref(db, `announcements/${announcement.id}`))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Announcement
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-lg"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* SUBJECT */}
          <div className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            {announcement.title || "No Subject"}
          </div>

          {/* EMAIL HEADER */}
          <div className="flex items-start gap-3 mb-5">

            {/* AVATAR */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {announcement.senderPhoto ? (
                <img
                  src={announcement.senderPhoto}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  {announcement.senderName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">

              {/* NAME + DATE */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {announcement.senderName || "Unknown"}
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(announcement.createdAt)}
                </div>
              </div>

              {/* SENT TO (MOVED HERE) */}
              <div className="mt-1 flex items-start gap-2 text-xs text-gray-500">
                <span className="whitespace-nowrap">Sent to:</span>

                <div className="flex flex-wrap gap-2">
                  {announcement.orgIds?.map((id) => {
                    const org = userOrgs?.find((o) => o.id === id)
                    if (!org) return null

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          {org.image ? (
                            <img
                              src={org.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
                              {org.name?.charAt(0).toUpperCase() || "O"}
                            </div>
                          )}
                        </div>

                        <span className="text-gray-700 dark:text-gray-300">
                          {org.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* MESSAGE */}
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-[120px] p-3 rounded-lg border dark:bg-gray-800 text-gray-700 dark:text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-5 break-words">
              {announcement.message}
            </div>
          )}

        </div>

        {/* ACTION BAR (FIXED) */}
        {isOwner && (
          <div className="flex justify-end gap-2 border-t px-6 py-4 dark:border-gray-700">

            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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