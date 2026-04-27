import { useState } from "react"
import { db } from "../firebase/config"
import { ref, push, set, serverTimestamp } from "firebase/database"

export default function Announcements({ role = "user" }) {
  const isAdmin = role?.toLowerCase() === "admin"

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddAnnouncement = async () => {
    if (!title.trim() || !message.trim()) return

    setLoading(true)

    try {
      const newRef = push(ref(db, "announcements"))

      await set(newRef, {
        title,
        message,
        createdAt: Date.now(),
      })

      setTitle("")
      setMessage("")
    } catch (err) {
      console.error("Failed to add announcement:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          📢 Announcements
        </h2>
      </div>

      {/* SAMPLE ITEMS (replace later with Firebase list) */}
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

      {/* ================= ADMIN ADD FORM ================= */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-3">

          <h3 className="font-semibold text-gray-800 dark:text-white">
            Add Announcement
          </h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />

          <button
            onClick={handleAddAnnouncement}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Posting..." : "Post Announcement"}
          </button>

        </div>
      )}

    </div>
  )
}