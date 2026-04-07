// src/components/OrganizationAbout.jsx
import React from "react";
import { FaCalendarAlt, FaBullseye } from "react-icons/fa";

export default function OrganizationAbout({ org }) {
  if (!org) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-10">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 dark:text-white">
        About {org.name}
      </h2>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
        {org.description || "No description available."}
      </p>

      {/* Founded / dateAdded */}
      <div className="flex items-center gap-3 mb-4">
        <FaCalendarAlt className="text-blue-600 dark:text-blue-400 text-2xl" />
        <div>
          <h3 className="text-sm font-semibold dark:text-white">Founded</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {org.dateAdded
            ? new Date(org.dateAdded).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Unknown"}
          </p>
        </div>
      </div>

      {/* Mission / Additional Info */}
      <div className="flex items-start gap-3 mt-6">
        <FaBullseye className="text-blue-600 dark:text-blue-400 text-2xl mt-1" />
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {org.mission ||
            "This section can include more details about the organization, mission, goals, or any additional information."}
        </p>
      </div>
    </div>
  );
}