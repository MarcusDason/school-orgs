import { useEffect, useState } from "react"
import { db, auth } from "../firebase/config"
import { ref, get } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

import StatCard from "../components/StatCard"
import DashboardCharts from "../components/DashboardCharts"
import { Users, Building2, CalendarCheck, BarChart3 } from "lucide-react"

import Announcements from "../components/Announcements"
import Feed from "../components/Feed"
import FeedSkeleton from "../components/FeedSkeleton"
import AdminSkeleton from "../components/AdminSkeleton"

export default function Dashboard() {
  const [posts, setPosts] = useState([])
  const [role, setRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState(new Set())

  const [stats, setStats] = useState({
    organizations: 0,
    students: 0,
    activeEvents: 0,
    avgMembers: 0,
  })

  const [chartData, setChartData] = useState({
    membershipGrowth: [],
    membersByCategory: [],
    eventsPerMonth: [],
    topOrganizations: [],
  })

  // ================= ROLE =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
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
      } catch (error) {
        console.error("Error fetching user role:", error)
        setRole("user")
      } finally {
        setAuthLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // ================= EVENT STATUS =================
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

        // ================= CHARTS =================

        const membersByCategory = Object.values(orgData).map((org) => {
          let memberCount = 0

          if (typeof org.members === "number") {
            memberCount = org.members
          } else if (org.members && typeof org.members === "object") {
            memberCount = Object.keys(org.members).length
          }

          return {
            name: org.name || "Unknown",
            value: memberCount,
          }
        })

        const topOrganizations = [...membersByCategory]
          .map((org) => ({
            name: org.name,
            members: org.value,
          }))
          .sort((a, b) => b.members - a.members)
          .slice(0, 5)

        const monthCounts = {}

        Object.values(eventsData).forEach((event) => {
          if (!event.startDate) return

          const month = new Date(event.startDate).toLocaleString(
            "en-US",
            { month: "short" }
          )

          monthCounts[month] =
            (monthCounts[month] || 0) + 1
        })

        const eventsPerMonth = Object.entries(monthCounts).map(
          ([month, events]) => ({
            month,
            events,
          })
        )

        const membershipGrowth = topOrganizations.map((org) => ({
          month: org.name,
          members: org.members,
        }))

        setChartData({
          membershipGrowth,
          membersByCategory,
          eventsPerMonth,
          topOrganizations,
        })

        // ================= STATS =================

        const totalOrganizations = Object.keys(orgData).length

        const totalMembers = Object.values(orgData).reduce((sum, org) => {
          // If members is a number
          if (typeof org.members === "number") {
            return sum + org.members
          }

          // If members is an object/list of users
          if (org.members && typeof org.members === "object") {
            return sum + Object.keys(org.members).length
          }

          return sum
        }, 0)

        const activeEvents = Object.values(eventsData).filter((event) => {
          const status = getEventStatus(
            event.startDate,
            event.endDate
          )

          return status !== "finished"
        }).length

        const avgMembers =
          totalOrganizations > 0
            ? Math.round(totalMembers / totalOrganizations)
            : 0

        setStats({
          organizations: totalOrganizations,
          students: totalMembers,
          activeEvents,
          avgMembers,
        })

        // ================= FEED POSTS =================

        const allPosts = Object.entries(eventsData).map(
          ([id, event]) => {
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
              status: getEventStatus(
                event.startDate,
                event.endDate
              ),
            }
          }
        )

        allPosts.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )

        setPosts(allPosts)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [authLoading])

  // ================= EXPAND POST =================
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

  // ================= LOADING =================
  if (dataLoading) {
    const isAdmin = role?.toLowerCase() === "admin"
    return isAdmin ? <AdminSkeleton /> : <FeedSkeleton />
  }

  const isAdmin = role?.toLowerCase() === "admin"

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {isAdmin ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Dashboard
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Organizations"
              value={stats.organizations}
              icon={Building2}
            />

            <StatCard
              title="Total Members"
              value={stats.students}
              icon={Users}
            />

            <StatCard
              title="Active Events"
              value={stats.activeEvents}
              icon={CalendarCheck}
            />

            <StatCard
              title="Avg Members / Org"
              value={stats.avgMembers}
              icon={BarChart3}
            />
          </div>

          <DashboardCharts chartData={chartData} />
        </>
      ) : (
        <div className="max-w-full mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 xl:col-span-9">
              <Feed
                posts={posts}
                expandedPosts={expandedPosts}
                toggleExpand={toggleExpand}
                formatDate={formatDate}
              />
            </div>

            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-20">
                <Announcements role={role} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}