import { useState, useEffect } from "react"
import { db, auth } from "../firebase/config"
import {
  ref,
  push,
  set,
  onValue,
  get,
  serverTimestamp,
  remove,
} from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"


// COmponents
import AnnouncementCard from "./AnnouncementCard"
import AnnouncementModal from "./AnnouncementModal"
import { formatDate } from "../utils/date"

export default function Announcements({ role = "user" }) {
  const [announcements, setAnnouncements] = useState([])
  const [message, setMessage] = useState("")
  const [selectedOrgs, setSelectedOrgs] = useState([])
  const [userOrgs, setUserOrgs] = useState([])
  const [loading, setLoading] = useState(false)

  const [currentUser, setCurrentUser] = useState(null)
  const [isMember, setIsMember] = useState(false)

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [userCache, setUserCache] = useState({})

  const isAdmin = role?.toLowerCase() === "admin"
  const canPost = isMember || isAdmin

  const [editMessage, setEditMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // ================= AUTH =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null)
    })
    return () => unsub()
  }, [])

  // ================= GET USER ORGS =================
  useEffect(() => {
    if (!currentUser) return

    const loadUserOrgs = async () => {
      try {
        const [orgSnap, membersSnap] = await Promise.all([
          get(ref(db, "organizations")),
          get(ref(db, "members")),
        ])

        if (!orgSnap.exists() || !membersSnap.exists()) return

        const orgs = orgSnap.val()
        const members = Object.values(membersSnap.val())

        const myOrgIds = members
          .filter((m) => m.uid === currentUser.uid)
          .map((m) => m.orgId)

        const filtered = Object.entries(orgs)
          .filter(([id]) => myOrgIds.includes(id))
          .map(([id, org]) => ({
            id,
            ...org,
          }))

        setUserOrgs(filtered)
      } catch (err) {
        console.error(err)
      }
    }

    loadUserOrgs()
  }, [currentUser])

  // ================= CHECK MEMBERSHIP =================
  useEffect(() => {
    if (!currentUser) return

    const check = async () => {
      const snap = await get(ref(db, "members"))
      if (!snap.exists()) return

      const members = Object.values(snap.val())
      setIsMember(members.some((m) => m.uid === currentUser.uid))
    }

    check()
  }, [currentUser])

  // ================= ANNOUNCEMENTS =================
  useEffect(() => {
  const refAnn = ref(db, "announcements")

  const unsub = onValue(refAnn, async (snap) => {
    const data = snap.val() || {}
    const entries = Object.entries(data)

    const enriched = await Promise.all(
      entries.map(async ([id, item]) => {
        let senderName = "Unknown"

        if (item.userId) {
          const userSnap = await get(ref(db, `users/${item.userId}`))

          if (userSnap.exists()) {
            const userData = userSnap.val()

            senderName =
              userData.fullName ||
              userData.name ||
              userData.displayName ||
              "Unknown"
          }
        }

        return {
          id,
          ...item,
          senderName,
        }
      })
    )

    enriched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    setAnnouncements(enriched)
  })

  return () => unsub()
}, [])
  // ================= TOGGLE ORGS =================
  const toggleOrg = (id) => {
    setSelectedOrgs((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  // ================= POST =================
  const handlePost = async () => {
    if (!message.trim() || selectedOrgs.length === 0) return
    if (!canPost) return

    setLoading(true)

    try {
      const newRef = push(ref(db, "announcements"))

      await set(newRef, {
        message,
        orgIds: selectedOrgs,
        createdAt: serverTimestamp(),
        userId: currentUser?.uid || null,
      })

      setMessage("")
      setSelectedOrgs([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ================= FORMAT =================
  const formatDate = (ts) => {
    if (!ts) return ""
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }
  const isRead = (item) =>
    item.readBy?.[currentUser?.uid] === true

  const handleDelete = async (item) => {
    await remove(ref(db, `announcements/${item.id}`))
  }

  const handleEdit = (item) => {
    setSelectedAnnouncement(item)
    setEditMessage(item.message)
    setIsEditing(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">

      {/* HEADER */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          📢 Announcements
        </h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm font-medium">No announcements yet</p>
            <p className="text-xs text-gray-500">
              When someone posts, it will appear here.
            </p>
          </div>
        ) : (
          announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              isRead={isRead(item)}
              onClick={(item) => {
                setSelectedAnnouncement(item)
                setEditMessage(item.message)
                setIsEditing(false)
              }}
              formatDate={formatDate}
              currentUser={currentUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* DIVIDER */}
      {canPost && (
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
      )}

      {/* POST SECTION */}
      {canPost && (
        <div className="p-4 space-y-3">

          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Organization
          </div>

          {/* ================= SELECTED CHIPS ================= */}
          {selectedOrgs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedOrgs.map((id) => {
                const org = userOrgs.find((o) => o.id === id)
                if (!org) return null

                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
                  >
                    <span>{org.name}</span>

                    <button
                      onClick={() =>
                        setSelectedOrgs((prev) =>
                          prev.filter((x) => x !== id)
                        )
                      }
                      className="hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ================= ORG LIST ================= */}
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">

            {userOrgs.map((org) => {
              const selected = selectedOrgs.includes(org.id)

              return (
                <button
                  key={org.id}
                  onClick={() => toggleOrg(org.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition
                    ${
                      selected
                        ? "border-blue-500 bg-blue-50 dark:bg-gray-800"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                >
                  {org.image ? (
                    <img
                      src={org.image}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                  )}

                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {org.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* TEXTAREA */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write an announcement..."
            className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />

          {/* POST BUTTON */}
          <button
            onClick={handlePost}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Announcement"}
          </button>

        </div>
      )}

      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        formatDate={formatDate}
        currentUser={currentUser}
        userOrgs={userOrgs}
        editMessage={editMessage}
        setEditMessage={setEditMessage}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </div>
  )
}