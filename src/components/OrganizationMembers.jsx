import React, { useState , useEffect} from "react";
import { loadModels, detectFace } from "../utils/detectIfPersonImage";
import imageCompression from "browser-image-compression";
import { auth, db } from "../firebase/config";
import { ref, get, query, orderByChild, equalTo, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export default function OrganizationMembers({
  members = [],
  org,
  onDeleteMember,
  onPromoteMember,
  onAddMember,
  onEditMember,
}) {
  if (!org) return null;

  const [role, setRole] = useState("user");
  const [orgMembers, setOrgMembers] = useState([]);

  const [loadingAction, setLoadingAction] = useState({
    id: null,
    type: null,
  });

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [newMember, setNewMember] = useState({
    fullName: "",
    position: "Member",
    profilePic: "",
  });

  // 🎯 ROLE PRIORITY ORDER
  const rolePriority = {
    "president": 1,
    "vice president": 2,
    "secretary": 3,
    "treasurer": 4,
    "member": 5,
  };

  // ✅ GET USER ROLE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(db, `users/${user.uid}`));
          if (snapshot.exists()) {
            setRole(snapshot.val().role || "user");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ GET ORG MEMBERS
  useEffect(() => {
    if (!org?.id) return;

    const membersRef = ref(db, "members");
    const q = query(membersRef, orderByChild("orgId"), equalTo(org.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val() || {};
      setOrgMembers(Object.values(data));
    });

    return () => unsubscribe();
  }, [org]);

  const userCanManage =
  role === "admin" ||
  orgMembers.some((m) => m.uid === auth.currentUser?.uid);

  // ✅ SORT MEMBERS BASED ON ROLE
    const sortedMembers = [...members].sort((a, b) => {
    const roleA = rolePriority[a.position?.toLowerCase()] || 999;
    const roleB = rolePriority[b.position?.toLowerCase()] || 999;

    if (roleA !== roleB) return roleA - roleB;

    // 🔤 same role → sort by name
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  const visibleMembers = showAllMembers
    ? sortedMembers
    : sortedMembers.slice(0, 5);

  const hasMoreThanFive = sortedMembers.length > 5;

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleAddMember = async () => {
    if (!userCanManage) {
      alert("You are not allowed to manage members.");
      return;
    }
    if (!newMember.fullName.trim()) return;

    const existingPresident = members.find(
      (m) =>
        m.position?.toLowerCase() === "president" &&
        m !== editingMember // allow editing same president
    );

    // 🚫 BLOCK if trying to create another president
    if (
      newMember.position === "President" &&
      existingPresident
    ) {
      const confirmChange = window.confirm(
        `There is already a President (${existingPresident.fullName}).\n\nDo you want to replace them?`
      );

      if (!confirmChange) return;

      // 🔥 Demote existing president
      await onEditMember?.({
        ...existingPresident,
        position: "Member",
      });
    }

    if (isEditMode && editingMember) {
      // ✅ EDIT
      await onEditMember?.({
        ...editingMember,
        ...newMember,
      });
    } else {
      // ✅ ADD
      await onAddMember?.({
        ...newMember,
        number: Date.now(),
      });
    }

    // RESET
    setNewMember({
      fullName: "",
      position: "Member",
      profilePic: "",
    });

    setEditingMember(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Members</h2>

        {userCanManage && (
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingMember(null);
              setNewMember({
                fullName: "",
                position: "Member",
                profilePic: "",
              });
              setIsModalOpen(true);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* LIST */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleMembers.map((member, index) => (
          <li
            key={member.number || member.fullName || index}
            className={`relative flex items-center justify-between gap-4 p-3 rounded-lg shadow-sm ${
              member.position?.toLowerCase() === "president"
                ? "bg-blue-100 dark:bg-blue-900"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-4">
              {member.profilePic ? (
                <img
                  src={member.profilePic}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
                  {member.fullName?.[0] || "?"}
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-semibold dark:text-white">
                  {member.fullName || "N/A"}
                </span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.position || "Member"}
                </span>
              </div>
            </div>

            {/* MENU */}
            {userCanManage && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu(index)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >
                  ⋮
                </button>

                {openMenuIndex === index && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg z-50">

                    {/* ✏️ EDIT */}
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setNewMember({
                          fullName: member.fullName,
                          position: member.position,
                          profilePic: member.profilePic,
                        });
                        setIsEditMode(true);
                        setIsModalOpen(true);
                        setOpenMenuIndex(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-white"
                    >
                      ✏️ Edit
                    </button>

                    {/* ⭐ PROMOTE */}
                    <button
                      disabled={
                        loadingAction.id === member.number &&
                        loadingAction.type === "promote"
                      }
                      onClick={() => {
                        setLoadingAction({
                          id: member.number,
                          type: "promote",
                        });

                        onPromoteMember?.(member).finally(() => {
                          setLoadingAction({ id: null, type: null });
                          setOpenMenuIndex(null);
                        });
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-white"
                    >
                      ⭐ Promote
                    </button>

                    {/* 🗑 DELETE */}
                    <button
                      disabled={
                        loadingAction.id === member.number &&
                        loadingAction.type === "delete"
                      }
                      onClick={() => {
                        setLoadingAction({
                          id: member.number,
                          type: "delete",
                        });

                        onDeleteMember?.(member).finally(() => {
                          setLoadingAction({ id: null, type: null });
                          setOpenMenuIndex(null);
                        });
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-100 dark:hover:bg-red-700 text-red-600 text-sm dark:text-white"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* SEE MORE */}
      {hasMoreThanFive && (
        <button
          onClick={() => setShowAllMembers((prev) => !prev)}
          className="mt-4 text-blue-600 hover:underline font-medium"
        >
          {showAllMembers ? "Show less" : "See more"}
        </button>
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {isEditMode ? "Edit Member" : "Add Member"}
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              value={newMember.fullName}
              onChange={(e) =>
                setNewMember({ ...newMember, fullName: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
            />

            <div className="mb-3 flex gap-4 items-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                    const file = e.target.files[0];
                      if (!file || !file.type.startsWith("image/")) return;

                      try {
                        // 🔥 1. COMPRESS IMAGE (same as AddOrganization)
                        const compressedFile = await imageCompression(file, {
                          maxSizeMB: 0.2,
                          maxWidthOrHeight: 300,
                          useWebWorker: true,
                        });

                        // 🔥 2. LOAD IMAGE
                        const img = document.createElement("img");
                        img.src = URL.createObjectURL(compressedFile);

                        await new Promise((resolve) => (img.onload = resolve));

                        // 🔥 3. FACE DETECTION
                        await loadModels();
                        const detections = await detectFace(img);

                        if (detections.length === 0) {
                          alert("No human face detected.");
                          return;
                        }

                        // 🔥 4. CONVERT TO BASE64
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewMember((prev) => ({
                            ...prev,
                            profilePic: reader.result,
                          }));
                        };

                        reader.readAsDataURL(compressedFile);

                      } catch (err) {
                        console.error("Image error:", err);
                      }
                    }}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />

                {/* Preview */}
                {newMember.profilePic && (
                    <img
                    src={newMember.profilePic}
                    alt="Preview"
                    className="w-20 h-20 mt-2 object-cover border dark:border-gray-600"
                    />
                )}
            </div>

            <select
              value={newMember.position}
              onChange={(e) =>
                setNewMember({ ...newMember, position: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Position</option>

              {/* Unique roles */}
              <option
                disabled={
                  members.some(
                    (m) =>
                      m.position === "President" &&
                      m !== editingMember
                  ) && newMember.position !== "President"
                }
              >
                President
              </option>

              <option
                disabled={
                  members.some(
                    (m) =>
                      m.position === "Vice President" &&
                      m !== editingMember
                  ) && newMember.position !== "Vice President"
                }
              >
                Vice President
              </option>

              {/* Non-unique */}
              <option>Secretary</option>
              <option>Treasurer</option>
              <option>Member</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleAddMember}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}