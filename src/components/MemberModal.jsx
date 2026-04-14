import React, { useState, useEffect } from "react";
import {User , Plus} from "lucide-react";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";

export default function MemberModal({ isOpen, onClose, onSubmit, members }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Fetch and filter users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const snapshot = await get(ref(db, "users"));
        const usersData = snapshot.val() || {};

        const results = Object.entries(usersData)
          .map(([uid, user]) => ({
            uid,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic || "",
          }))
            .filter((user) => {
              // 1️⃣ User must have a full name
              if (!user.fullName) return false;

              // 2️⃣ Must match a non-empty search query
              if (!searchQuery || !user.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
                return false;
              }

              // 3️⃣ Exclude users already in org
              const alreadyMember = members.some(
                (m) => m.uid === user.uid || m.email === user.email
              );
              if (alreadyMember) return false;

              return true;
            })
          .sort((a, b) => a.fullName.localeCompare(b.fullName));

        setSearchResults(results);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, members]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex gap-2 items-center">
          <User className="w-8 h-8 text-black mb-2 dark:text-white" />
        <h2 className="text-xl font-bold mb-4 dark:text-white"> Add Member</h2>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
        />

        {isLoading && <div className="text-gray-500 mb-2 text-sm">Searching...</div>}
        {!isLoading && searchResults.length === 0 && (
          <div className="text-gray-500 text-sm mb-2">No users found.</div>
        )}

        <div className="flex flex-col gap-2">
          {searchResults.map((user) => (
            <div
              key={user.uid}
              className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.fullName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <div className="font-medium dark:text-white">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={() => onSubmit(user)}
                className="flex gap-2 items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}