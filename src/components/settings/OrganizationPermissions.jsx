import React, { useState } from "react";
import { FaLock, FaUsers, FaUserTie, FaArrowLeft } from "react-icons/fa";
import { ref, update } from "firebase/database";
import { db } from "../../firebase/config";

export default function OrganizationPermissions({ permissions , orgId}) {
  const [activePerm, setActivePerm] = useState(null);
  const [values, setValues] = useState(permissions || {});

  const PERMISSIONS = [
    { key: "postEvent", label: "Posting Events" },
    { key: "postCompetition", label: "Posting Competitions" },
    { key: "editSettings", label: "Editing Settings" },
  ];

  const handleChange = async (key, value) => {
    const updated = {
      ...values,
      [key]: { ...values[key], type: value },
    };

    setValues(updated);

    try {
      await update(ref(db, `permissions/${orgId}`), {
        [key]: updated[key],
      });
    } catch (error) {
      console.error("Error saving permission:", error);
    }
  };

  const getLabel = (type) => {
    if (type === "president") return "Only President";
    if (type === "everyone") return "Everyone";
    if (type === "custom") return "Custom أعضاء";
    return "Not set";
  };

  console.log("permissions:", permissions);
console.log("orgId:", orgId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-10">
      {activePerm === null ? (
        <>
          <h2 className="text-3xl font-bold mb-6 dark:text-white">
            Organization Permissions
          </h2>

          <div className="flex flex-col gap-6">
            {PERMISSIONS.map((perm) => (
              <div
                key={perm.key}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                onClick={() => setActivePerm(perm.key)}
              >
                <div className="flex items-center gap-3">
                  <FaLock className="text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold dark:text-white">
                    {perm.label}
                  </span>
                </div>

                <span className="text-sm text-gray-500 dark:text-gray-300">
                  {getLabel(values[perm.key]?.type)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActivePerm(null)}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <FaArrowLeft />
            </button>

            <h2 className="text-2xl font-bold dark:text-white">
              Edit Permission
            </h2>
          </div>

          {/* OPTIONS */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleChange(activePerm, "president")}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                values[activePerm]?.type === "president"
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <FaUserTie className="text-blue-600 dark:text-blue-400" />
              <span className="dark:text-white">Only President</span>
            </button>

            <button
              onClick={() => handleChange(activePerm, "everyone")}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                values[activePerm]?.type === "everyone"
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <FaUsers className="text-blue-600 dark:text-blue-400" />
              <span className="dark:text-white">Everyone</span>
            </button>

            <button
              onClick={() => handleChange(activePerm, "custom")}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                values[activePerm]?.type === "custom"
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <FaUsers className="text-blue-600 dark:text-blue-400" />
              <span className="dark:text-white">
                Custom (Specific Members)
              </span>
            </button>

            {/* CUSTOM SECTION */}
            {values[activePerm]?.type === "custom" && (
              <div className="mt-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  (Add member selection UI here)
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}