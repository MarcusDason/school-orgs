import React, { useState , useEffect} from "react";
import { loadModels, detectFace } from "../utils/detectIfPersonImage";
import imageCompression from "browser-image-compression";
import { auth, db } from "../firebase/config";
import { ref, get, query, orderByChild, equalTo, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

import MemberModal from "./MemberModal";

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

  const rolePriority = {
    "president": 1,
    "vice president": 2,
    "secretary": 3,
    "treasurer": 4,
    "member": 5,
  };

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

    const sortedMembers = [...members].sort((a, b) => {
    const roleA = rolePriority[a.position?.toLowerCase()] || 999;
    const roleB = rolePriority[b.position?.toLowerCase()] || 999;

    if (roleA !== roleB) return roleA - roleB;

    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  const visibleMembers = showAllMembers
    ? sortedMembers
    : sortedMembers.slice(0, 5);

  const hasMoreThanFive = sortedMembers.length > 5;

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleAddMember = async (memberData) => {
    if (!userCanManage) {
      alert("You are not allowed to manage members.");
      return;
    }
    if (!memberData.fullName.trim()) return;

    const existingPresident = members.find(
      (m) =>
        m.position?.toLowerCase() === "president" &&
        m !== editingMember
    );

    if (memberData.position === "President" && existingPresident) {
      const confirmChange = window.confirm(
        `There is already a President (${existingPresident.fullName}).\n\nDo you want to replace them?`
      );
      if (!confirmChange) return;

      await onEditMember?.({
        ...existingPresident,
        position: "Member",
      });
    }

    if (isEditMode && editingMember) {
      await onEditMember?.({
        ...editingMember,
        ...memberData,
      });
    } else {
      await onAddMember?.({
        ...memberData,
        number: Date.now(),
      });
    }

    setIsModalOpen(false);
    setEditingMember(null);
    setIsEditMode(false);
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
                    {/* <button
                      onClick={() => {
                        setEditingMember(member);
                        setIsEditMode(true);
                        setIsModalOpen(true);
                        setOpenMenuIndex(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-white"
                    >
                      ✏️ Edit
                    </button> */}

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
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (selectedUser) => {
          await onAddMember?.({
            ...selectedUser,
            orgId: org.id,
            position: "Member",
            number: Date.now(),
          });
          setIsModalOpen(false);
        }}
        members={orgMembers}
      />
    </div>
  );
}