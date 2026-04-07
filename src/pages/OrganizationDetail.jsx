import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaUsers, FaUserTie, FaCalendarAlt } from "react-icons/fa";
import { db } from "../firebase/config";
import { ref, get, update, onValue, off, remove, push, set } from "firebase/database";

// Components
import OrganizationAbout from "../components/OrganizationAbout";
import EventsSection from "../components/EventsSection";
import OrganizationMembers from "../components/OrganizationMembers";
import OrganizationPhotos from "../components/OrganizationPhotos";

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState({ previous: [], current: [], future: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [members, setMembers] = useState([]);

  // ✅ Persist active page in localStorage
  const [activeTabPage, setActiveTabPage] = useState(() => {
    return localStorage.getItem(`org-${id}-tab`) || "events";
  });

  // Update localStorage whenever activeTabPage changes
  useEffect(() => {
    localStorage.setItem(`org-${id}-tab`, activeTabPage);
  }, [activeTabPage, id]);

  const categorizeEvents = (eventsArray) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const categorized = { previous: [], current: [], future: [] };
    eventsArray.forEach(({ id, ...event }) => {
      const start = event.startDate ? new Date(event.startDate) : null;
      const end = event.endDate ? new Date(event.endDate) : start;
      if (!start) return;
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      const eventWithId = { ...event, id };
      if (end < now) categorized.previous.push(eventWithId);
      else if (start <= now && now <= end) categorized.current.push(eventWithId);
      else categorized.future.push(eventWithId);
    });
    return categorized;
  };

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const snapshot = await get(ref(db, `organizations/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setOrg({ id, ...data });
          const dbEvents = data.events
            ? Object.entries(data.events).map(([eventId, eventData]) => ({ id: eventId, ...eventData }))
            : [];
          setEvents(categorizeEvents(dbEvents));
        } else {
          setOrg(null);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganization();
  }, [id]);

  useEffect(() => {
  const membersRef = ref(db, "members");

  const unsubscribe = onValue(membersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = Object.entries(snapshot.val()).map(
        ([idKey, value]) => ({
          id: idKey,
          ...value,
        })
      );

      // ✅ filter only members of this org
      const filteredMembers = data.filter(
        (m) => m.orgId === id
      );

      setMembers(filteredMembers);
    } else {
      setMembers([]);
    }
  });

  return () => off(membersRef);
}, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
      </div>
    );

  if (!org)
    return <p className="text-center mt-10 dark:text-white">Organization not found.</p>;

    const president = members.find(
      (m) => m.position?.toLowerCase() === "president"
    );

  const handleSaveOrg = async (updatedData) => {
  try {
    await update(ref(db, `organizations/${id}`), updatedData);

    setOrg((prev) => ({ ...prev, ...updatedData }));

    alert("Organization updated successfully!");
  } catch (error) {
    console.error("Error updating organization:", error);
    alert("Failed to update organization.");
  }
};

  const handleUpdateMembers = async (updatedMembers) => {
    try {
      const updatedOrg = {
        ...org,
        member: updatedMembers,
      };

      await update(ref(db, `organizations/${id}`), {
        member: updatedMembers,
      });

      setOrg(updatedOrg);
    } catch (error) {
      console.error("Failed updating members:", error);
    }
  };

  const handleDeleteMember = async (member) => {
    await remove(ref(db, `members/${member.id}`));
  };

  const handlePromoteMember = async (member) => {
    // remove current president
    const currentPresident = members.find(
      (m) => m.position?.toLowerCase() === "president"
    );

    if (currentPresident) {
      await update(ref(db, `members/${currentPresident.id}`), {
        position: "Member",
      });
    }

    // promote selected member
    await update(ref(db, `members/${member.id}`), {
      position: "President",
    });
  };

  const handleAddMember = async (newMember) => {
    const newRef = push(ref(db, "members"));

    await set(newRef, {
      ...newMember,
      orgId: id,
    });

    // ✅ OPTIONAL: update member count in org
    await update(ref(db, `organizations/${id}`), {
      members: members.length + 1,
    });
  };

  const handleEditMember = async (member) => {
  // 🔥 You MUST have member.id or member.key
    const memberRef = ref(db, `members/${member.id}`);

    await update(memberRef, {
      fullName: member.fullName,
      position: member.position,
      profilePic: member.profilePic,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 min-h-screen flex flex-col">
      {/* Back Button */}
      <Link to="/organizations" className="text-black dark:text-white mb-4 inline-block">
        ← Back to Organizations
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8 gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
          <FaUsers size={28} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">{org.name}</h1>
          <p className="mt-4 mb-6 text-gray-700 dark:text-gray-300">{org.description}</p>
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <FaUsers /> 
              <span>
                {members.length} Members
              </span>
            </div>
            {president && (
              <div className="flex items-center gap-2">
                <FaUserTie />
                <span>
                  President: {president.fullName || "N/A"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaCalendarAlt />{" "}
              <span>
                Founded{" "}
                {org.dateAdded
                  ? new Date(org.dateAdded).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for About / Events */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTabPage("events")}
          className={`px-4 py-2 rounded-full transition ${
            activeTabPage === "events"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTabPage("about")}
          className={`px-4 py-2 rounded-full transition ${
            activeTabPage === "about"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTabPage("members")}
          className={`px-4 py-2 rounded-full transition ${
            activeTabPage === "members"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Members
        </button>

        <button
          onClick={() => setActiveTabPage("photos")}
          className={`px-4 py-2 rounded-full transition ${
            activeTabPage === "photos"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Photos
        </button>
      </div>

      {/* Render About or Events */}
      {activeTabPage === "about" ? (
          <OrganizationAbout org={org} onSave={handleSaveOrg} />
        ) : activeTabPage === "members" ? (
          <OrganizationMembers
              members={members}
              org={org}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onPromoteMember={handlePromoteMember}
            />
        ) : activeTabPage === "photos" ? (
          <OrganizationPhotos
            org={org}
            onPhotoAdd={(updatedPhotos) => {
              setOrg((prev) => ({
                ...prev,
                photos: updatedPhotos,
              }));
            }}
          />
        ) : (
          <EventsSection
            events={events}
            activeTab={activeTab}
            search={search}
            setSearch={setSearch}
            setActiveTab={setActiveTab}
            orgId={id}
            navigate={navigate}
          />
        )}

      {/* CTA */}
      <div className="mt-auto pt-12 bg-blue-600 text-white p-6 rounded-lg text-center">
        <h3 className="text-2xl font-bold mb-2">Interested in Joining?</h3>
        <p>Connect with us to learn more about {org.name}.</p>
        <button className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded">Contact Us</button>
      </div>
    </div>
  );
}