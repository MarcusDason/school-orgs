import { ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Feed({ posts, expandedPosts, toggleExpand, formatDate }) {
  const navigate = useNavigate()

  return (
    <div className="lg:col-span-2 space-y-6">

      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() =>
            navigate(`/organizations/${post.orgId}/events/${post.id}`, {
              state: { from: "dashboard" },
            })
          }
          className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden"
        >

          {/* HEADER */}
          <div className="flex items-center gap-3 p-4">

            {/* PROFILE */}
            <div
              className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/organizations/${post.orgId}`)
              }}
            >
              {post.orgImage ? (
                <img src={post.orgImage} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>

            {/* ORG */}
            <div
              className="flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/organizations/${post.orgId}`)
              }}
            >
              <p className="font-semibold text-gray-800 dark:text-white hover:underline">
                {post.orgName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(post.date)}
              </p>
            </div>

            {/* STATUS */}
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
                : post.description}
            </p>

            {post.description?.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
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
                className="w-full max-h-[480px] object-cover"
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

    </div>
  )
}