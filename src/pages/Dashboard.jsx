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

// COmponents
import Announcements from "../components/Announcements"
import Feed from "../components/Feed"
import FeedSkeleton from "../components/FeedSkeleton"
import AdminSkeleton from "../components/AdminSkeleton"

export default function Dashboard() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [role, setRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
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
      setAuthLoading(false)
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
    if (authLoading) return

    const fetchData = async () => {
      try {
        const [eventsSnap, orgSnap] = await Promise.all([
          get(ref(db, "events")),
          get(ref(db, "organizations")),
        ])

        const eventsData = eventsSnap.val() || {}
        const orgData = orgSnap.val() || {}

        const allPosts = Object.entries(eventsData).map(([id, event]) => {
          const org = orgData[event.orgId] || {}

          return {
            id,
            orgId: event.orgId,
            orgName: org.name || "Organization",
            orgImage: org.image || null,
            title: event.title,
            description: event.description,
            image: event.image,
            date: event.startDate,
            status: getEventStatus(event.startDate, event.endDate),
          }
        })

        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

        setPosts(allPosts)
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [authLoading])

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

  if (authLoading) {
    // // Don't know role yet → show neutral skeleton (or nothing)
    // return <FeedSkeleton />
  }

  if (dataLoading) {
    const isAdmin = role?.toLowerCase() === "admin"
    return isAdmin ? <AdminSkeleton /> : <FeedSkeleton />
  }

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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT SPACER */}
          <div className="hidden lg:block"></div>

          {/* ================= FEED (CENTER + WIDER) ================= */}
          <Feed
            posts={posts}
            expandedPosts={expandedPosts}
            toggleExpand={toggleExpand}
            formatDate={formatDate}
          />

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="hidden lg:block">
            <Announcements role={role} />
          </div>

        </div>
      )}
    </div>
  )
}