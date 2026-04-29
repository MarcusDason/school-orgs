import React, { useState, useEffect } from "react"
import OrganizationDetails from "./settings/OrganizationDetails"
import OrganizationPermissions from "./settings/OrganizationPermissions"
import { auth, db } from "../firebase/config"
import { get, ref } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"
import { ReceiptText, UserRoundKey } from "lucide-react"

export default function OrganizationSettings({
  org,
  onSave,
  permissions,
  orgId,
}) {
  const [activeTab, setActiveTab] = useState("details")
  const [role, setRole] = useState("user")
  const [orgMembers, setOrgMembers] = useState([])

  const userCanManage =
    role === "admin" ||
    orgMembers.some((m) => m.uid === auth.currentUser?.uid)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      const snapshot = await get(ref(db, `users/${user.uid}`))
      if (snapshot.exists()) setRole(snapshot.val()?.role || "user")
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="flex flex-col gap-6 mb-10">

      {/* 🔹 TOP NAV TABS (ALL SCREENS) */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700 pb-2">

        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition ${
            activeTab === "details"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          <ReceiptText size={16} className="inline -mt-1 mr-1" />
          Organization Details
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition ${
            activeTab === "permissions"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          <UserRoundKey size={16} className="inline -mt-1 mr-1" />
          Permissions
        </button>

      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">

        {activeTab === "details" && (
          <OrganizationDetails
            org={org}
            onSave={onSave}
            userCanManage={userCanManage}
          />
        )}

        {activeTab === "permissions" && (
          <OrganizationPermissions
            permissions={permissions}
            orgId={orgId}
          />
        )}

      </div>
    </div>
  )
}