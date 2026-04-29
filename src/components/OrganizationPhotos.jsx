import React, { useState, useEffect, useRef } from "react"
import { db, auth } from "../firebase/config"
import {
  ref,
  update,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

export default function OrganizationPhotos({ org, onPhotoAdd }) {
  if (!org) return null

  const fileInputRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [role, setRole] = useState("user")
  const [orgMembers, setOrgMembers] = useState([])
  const [zoomImage, setZoomImage] = useState(null)

  const photos = org.photos
    ? Array.isArray(org.photos)
      ? org.photos
      : Object.values(org.photos)
    : []

  // =========================
  // 🔐 GET USER ROLE
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      try {
        const snapshot = await get(ref(db, `users/${user.uid}`))
        if (snapshot.exists()) {
          setRole(snapshot.val().role || "user")
        }
      } catch (err) {
        console.error("Error fetching role:", err)
      }
    })

    return () => unsubscribe()
  }, [])

  // =========================
  // 👥 GET ORG MEMBERS
  // =========================
  useEffect(() => {
    if (!org?.id) return

    const membersRef = ref(db, "members")
    const q = query(membersRef, orderByChild("orgId"), equalTo(org.id))

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val() || {}
      setOrgMembers(Object.values(data))
    })

    return () => unsubscribe()
  }, [org])

  const currentUid = auth.currentUser?.uid

  const userCanManage =
    role === "admin" ||
    orgMembers.some((m) => m.uid === currentUid)

  // =========================
  // 📁 FILE HANDLERS
  // =========================
  const handleOpenFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      setPreview(reader.result)
      setIsModalOpen(true)
    }

    reader.readAsDataURL(file)
  }

  // =========================
  // ☁️ UPLOAD
  // =========================
  const handleUpload = async () => {
    if (!userCanManage) {
      alert("You are not allowed to upload photos.")
      return
    }

    if (!preview) return

    setUploading(true)

    try {
      const updatedPhotos = [...photos, preview]

      await update(ref(db, `organizations/${org.id}`), {
        photos: updatedPhotos,
      })

      onPhotoAdd?.(updatedPhotos)

      setPreview(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error("Upload failed:", err)
    }

    setUploading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">
          Organization Photos
        </h2>

        {userCanManage && (
          <button
            onClick={handleOpenFile}
            className="text-black font-medium dark:text-white cursor-pointer"
          >
            + Add Photo
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* PHOTO GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

        {photos.length > 0 ? (
          photos.map((photo, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 aspect-square group"
            >
              <img
                src={photo}
                alt={`photo-${index}`}
                onClick={() => {
                  setZoomImage(photo)
                }}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-110 cursor-zoom-in"
              />
              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition pointer-events-none"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 col-span-4 text-center">
            No photos available yet.
          </p>
        )}

      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-md">

            <h2 className="text-lg font-bold mb-4 dark:text-white">
              Preview Photo
            </h2>

            {preview && (
              <div className="w-full h-80 bg-black flex items-center justify-center rounded-lg overflow-hidden border dark:border-gray-600 mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setPreview(null)
                }}
                className="px-3 py-1 border rounded dark:border-gray-600 dark:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

          </div>
        </div>
      )}

      {zoomImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center"
          onClick={() => {
            console.log("closing zoom")
            setZoomImage(null)
          }}
        >
          <img
            src={zoomImage}
            alt="zoom"
            className="max-w-[95%] max-h-[95%] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}