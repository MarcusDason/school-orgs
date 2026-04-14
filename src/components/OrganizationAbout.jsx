import React from "react";
import { FaCalendarAlt, FaBullseye, FaUserTie, FaUsers } from "react-icons/fa";

export default function OrganizationAbout({ org, members = [] }) {
  if (!org) return null;

  const president = members.find(
    (m) => m.position?.toLowerCase() === "president"
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-10">
      <h2 className="text-3xl font-bold mb-6 dark:text-white">
        About {org.name}
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
        {org.description || "No description available."}
      </p>

      <div className="flex flex-wrap flex-col gap-6 mb-6 text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <FaUsers className="text-blue-600 dark:text-blue-400" />
          <span>{members.length} Members</span>
        </div>
        {president && (
          <div className="flex items-center gap-2">
            <FaUserTie className="text-blue-600 dark:text-blue-400" />
            <span>President: {president.fullName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
          <span>
            Founded{" "}
            {org.dateAdded
              ? new Date(org.dateAdded).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Unknown"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 mt-6">
        <FaBullseye className="text-blue-600 dark:text-blue-400 text-2xl mt-1" />
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {org.mission || "This section can include more details about the organization, mission, goals, or any additional information."}
        </p>
      </div>
    </div>
  );
}