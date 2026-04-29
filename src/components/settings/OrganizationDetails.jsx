import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBullseye, FaPen } from "react-icons/fa";
import { db } from "../../firebase/config";
import { ref, update } from "firebase/database";
import { SquarePen } from "lucide-react";

export default function OrganizationDetails({ org, onSave, userCanManage }) {
  const [name, setName] = useState(org?.name || "");
  const [description, setDescription] = useState(org?.description || "");
  const [mission, setMission] = useState(org?.mission || "");
  const [loading, setLoading] = useState(false);

  // edit states
  const [editField, setEditField] = useState(null); 
  // "name" | "description" | "mission" | null

  useEffect(() => {
    if (!org) return;
    setName(org.name || "");
    setDescription(org.description || "");
    setMission(org.mission || "");
  }, [org]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = {
        name,
        description,
        mission,
      };

      await update(ref(db, `organizations/${org.id}`), updatedData);
      onSave?.(updatedData);

      setEditField(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ================= NAME ================= */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <label className="font-semibold dark:text-white">Name</label>

          {userCanManage && (
            <button onClick={() => setEditField("name")}>
              <SquarePen size={14} className="text-black dark:text-white"/>
            </button>
          )}
        </div>

        {editField === "name" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setEditField(null)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        ) : (
          <p className="dark:text-white">{name || "—"}</p>
        )}
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <label className="font-semibold dark:text-white">Description</label>

          {userCanManage && (
            <button onClick={() => setEditField("description")}>
              <SquarePen size={14} className="text-black dark:text-white"/>
            </button>
          )}
        </div>

        {editField === "description" ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setEditField(null)}
            rows={3}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        ) : (
          <p className="dark:text-white whitespace-pre-wrap">
            {description || "—"}
          </p>
        )}
      </div>

      {/* ================= MISSION ================= */}
      <div className="mb-4 flex items-start gap-3">
        <FaBullseye className="text-blue-600 dark:text-blue-400 text-2xl mt-1" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <label className="font-semibold dark:text-white">Mission</label>

            {userCanManage && (
              <button onClick={() => setEditField("mission")}>
                <SquarePen size={14} className="text-black dark:text-white" />
              </button>
            )}
          </div>

          {editField === "mission" ? (
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              onBlur={() => setEditField(null)}
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          ) : (
            <p className="dark:text-white whitespace-pre-wrap">
              {mission || "—"}
            </p>
          )}
        </div>
      </div>

      {/* ================= DATE ================= */}
      <div className="flex items-center gap-2 mb-6 text-gray-700 dark:text-gray-300">
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

      {/* ================= SAVE ================= */}
      {userCanManage && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPen /> {loading ? "Saving..." : "Save Settings"}
        </button>
      )}
    </div>
  );
}