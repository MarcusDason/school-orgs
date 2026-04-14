import { useEffect, useState } from "react"
import { db } from "../firebase/config"
import { ref, onValue, off, get } from "firebase/database"
import { ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { auth } from "../firebase/config"
import { onAuthStateChanged } from "firebase/auth"

// Admin UI (optional)
import StatCard from "../components/StatCard"
import DashboardCharts from "../components/DashboardCharts"
import { Users, Building2, CalendarCheck, BarChart3 } from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState(new Set())

  // ================= ROLE =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await get(ref(db, `users/${user.uid}`))
        if (snap.exists()) {
          setRole(snap.val().role || "user")
        } else {
          setRole("user")
        }
      } else {
        setRole("user")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ================= STATUS HELPER =================
  const getEventStatus = (startDate, endDate) => {
    const now = new Date()

    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start

    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    if (end < now) return "finished"
    if (start <= now && now <= end) return "ongoing"
    return "future"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // ================= FETCH DATA =================
  useEffect(() => {
    const eventsRef = ref(db, "events")
    const orgRef = ref(db, "organizations")

    let orgCache = {}

    const unsubOrg = onValue(orgRef, (orgSnap) => {
      if (orgSnap.exists()) {
        orgCache = orgSnap.val()
      }
    })

    const unsubEvents = onValue(eventsRef, (snap) => {
      if (!snap.exists()) {
        setPosts([])
        return
      }

      const data = snap.val()

      const allPosts = Object.entries(data).map(([id, event]) => {
        const org = orgCache[event.orgId] || {}

        const status = getEventStatus(event.startDate, event.endDate)

        return {
          id,
          orgId: event.orgId,
          orgName: org.name || "Organization",
          orgImage: org.image || null,
          title: event.title,
          description: event.description,
          image: event.image,
          date: event.startDate,
          status,
        }
      })

      allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
      setPosts(allPosts)
    })

    return () => {
      off(eventsRef)
      off(orgRef)
    }
  }, [])

  const stats = {
    organizations: 12,
    students: 540,
    activeEvents: 8,
    avgMembers: 45,
  }

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (loading) return <p className="p-6">Loading...</p>

  const isAdmin = role?.toLowerCase() === "admin"

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">

      {/* ================= ADMIN ================= */}
      {isAdmin ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Dashboard
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Organizations" value={stats.organizations} icon={Building2} />
            <StatCard title="Total Members" value={stats.students} icon={Users} />
            <StatCard title="Active Events" value={stats.activeEvents} icon={CalendarCheck} />
            <StatCard title="Avg Members / Org" value={stats.avgMembers} icon={BarChart3} />
          </div>

          <DashboardCharts />
        </>
      ) : (

        // ================= USER FEED =================
        <div className="max-w-2xl mx-auto space-y-6">

          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                navigate(`/organizations/${post.orgId}/events/${post.id}`, {
                  state: { from: "dashboard" },
                })
              }
              className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition cursor-pointer overflow-hidden"
            >

              {/* HEADER */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200">
                  {post.orgImage ? (
                    <img src={post.orgImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {post.orgName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.date)}
                  </p>
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    post.status === "ongoing"
                      ? "bg-green-100 text-green-700"
                      : post.status === "finished"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {post.status === "ongoing"
                    ? "Ongoing"
                    : post.status === "finished"
                    ? "Finished"
                    : "Upcoming"}
                </span>
              </div>

              {/* CONTENT */}
              <div className="px-4 pb-3">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {post.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {expandedPosts.has(post.id)
                    ? post.description
                    : post.description?.length > 120
                      ? post.description.slice(0, 120) + "..."
                      : post.description
                  }
                </p>

                {post.description?.length > 120 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // prevents navigation to event page
                      toggleExpand(post.id)
                    }}
                    className="text-blue-500 text-xs mt-1 hover:underline"
                  >
                    {expandedPosts.has(post.id) ? "See less" : "See more"}
                  </button>
                )}
              </div>

              {/* IMAGE */}
              {post.image && (
                <div className="w-full">
                  <img
                    src={post.image}
                    alt="event"
                    className="w-full max-h-[420px] object-cover"
                  />
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-around text-gray-500 text-sm border-t p-3">
                <button className="hover:text-blue-500">Like</button>
                <button className="hover:text-blue-500">Comment</button>
                <button className="hover:text-blue-500">Share</button>
              </div>

            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-center text-gray-500">
              No posts available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}