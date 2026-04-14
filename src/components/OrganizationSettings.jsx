import React, { useState, useEffect } from "react";
import OrganizationDetails from "./settings/OrganizationDetails";
import OrganizationPermissions from "./settings/OrganizationPermissions";
import { auth, db } from "../firebase/config";
import { get, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export default function OrganizationSettings({ org, onSave, permissions, orgId }) {
  const [activeTab, setActiveTab] = useState("details");
  const [role, setRole] = useState("user");
  const [orgMembers, setOrgMembers] = useState([]);

  const userCanManage =
    role === "admin" || orgMembers.some((m) => m.uid === auth.currentUser?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snapshot = await get(ref(db, `users/${user.uid}`));
      if (snapshot.exists()) setRole(snapshot.val()?.role || "user");
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10">
      
      {/* 🔹 MOBILE NAV (TOP TABS) */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeTab === "details"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Details
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeTab === "permissions"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Permissions
        </button>
      </div>

      {/* 🔹 DESKTOP SIDEBAR */}
      <div className="hidden md:flex md:w-1/4 lg:w-1/5 flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <button
          className={`text-left px-4 py-2 rounded ${
            activeTab === "details"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          }`}
          onClick={() => setActiveTab("details")}
        >
          Organization Details
        </button>

        <button
          className={`text-left px-4 py-2 rounded ${
            activeTab === "permissions"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          }`}
          onClick={() => setActiveTab("permissions")}
        >
          Permissions
        </button>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
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
  );
}