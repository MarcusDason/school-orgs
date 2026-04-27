import { useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import { db } from "../firebase/config";
import { ref, remove, update , get} from "firebase/database";
import EditOrgModal from "../components/EditOrgModal";

function OrgCard({ org, index, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const memberCount = org.members || 0;
  const memberText = `${memberCount} Member${memberCount === 1 ? "" : "s"}`;

  const shortDescription = useMemo(() => {
    if (!org.description) return "";
    const words = org.description.split(" ");
    return words.length <= 20
      ? org.description
      : words.slice(0, 20).join(" ") + "...";
  }, [org.description]);

  const icons = [
    {
      bg: "bg-blue-100 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-300",
      svg: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      bg: "bg-green-100 dark:bg-green-900",
      color: "text-green-600 dark:text-green-300",
      svg: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      color: "text-yellow-600 dark:text-yellow-300",
      svg: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      bg: "bg-purple-100 dark:bg-purple-900",
      color: "text-purple-600 dark:text-purple-300",
      svg: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      bg: "bg-pink-100 dark:bg-pink-900",
      color: "text-pink-600 dark:text-pink-300",
      svg: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ];

  const iconIndex =
    index != null
      ? index % icons.length
      : org.id.charCodeAt(0) % icons.length;

  const icon = icons[iconIndex];

  const confirmDelete = async () => {
    try {
      const orgId = org.id;

      const membersRef = ref(db, "members");
      const membersSnap = await get(membersRef);

      if (membersSnap.exists()) {
        const membersData = membersSnap.val();

        const deleteMemberPromises = Object.entries(membersData)
          .filter(([_, member]) => member.orgId === orgId)
          .map(([memberId]) =>
            remove(ref(db, `members/${memberId}`))
          );

        await Promise.all(deleteMemberPromises);
      }

      const eventsRef = ref(db, "events");
      const eventsSnap = await get(eventsRef);

      if (eventsSnap.exists()) {
        const eventsData = eventsSnap.val();

        const deleteEventPromises = Object.entries(eventsData)
          .filter(([_, event]) => event.orgId === orgId)
          .map(([eventId]) =>
            remove(ref(db, `events/${eventId}`))
          );

        await Promise.all(deleteEventPromises);
      }

      await remove(ref(db, `organizations/${orgId}`));

      if (onDelete) onDelete(orgId);
      setIsDeleteOpen(false);

    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  const handleEdit = (updatedOrg) => {
    const orgRef = ref(db, `organizations/${org.id}`);
    update(orgRef, updatedOrg)
      .then(() => {
        if (onUpdate) onUpdate({ id: org.id, ...updatedOrg });
      })
      .catch((err) =>
        console.error("Failed to update organization:", err)
      );

    setIsEditOpen(false);
  };

  return (
    <>
      <div
        onClick={() =>
          navigate(`/organizations/${org.id}`, {
            state: { org },
          })
        }
        className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 hover:scale-105 transition transform relative flex flex-col justify-between h-64"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(`/organizations/${org.id}`, {
              state: { org },
            });
          }
        }}
      >
        
        {/* Hover Buttons */}
        {(onUpdate || onDelete) && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition duration-200">
            
            {/* Edit Button */}
            {onUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-600 transition"
              >
                <FaPen size={14} />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-red-600 transition"
              >
                <FaTrash size={14} />
              </button>
            )}
            
          </div>
        )}

        {/* Icon + Name */}
        <div className="flex items-center gap-4 mb-3">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 ${icon.bg}`}
          >
            <div className={`${icon.color} w-6 h-6`}>{icon.svg}</div>
          </div>

          <h2 className="font-bold text-xl text-gray-800 dark:text-white">
            {org.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-300 mb-4 flex-1">
          {shortDescription}
        </p>

        {/* Members */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-6">
          {memberText}
        </p>

        {/* Founded */}
        {org.dateAdded && (
          <p className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500 italic">
            Founded{" "}
            {new Date(org.dateAdded).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && onUpdate && (
        <EditOrgModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          org={org}
          onSave={handleEdit}
        />
      )}

      {/* Delete Modal */}
      {isDeleteOpen && onDelete &&(
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Delete Organization
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <strong>{org.name}</strong>?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(OrgCard);