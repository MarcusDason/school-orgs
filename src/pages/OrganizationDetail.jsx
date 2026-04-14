import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { ref, get, update, onValue, off, remove, push, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { ImageIcon } from "lucide-react";


import { Edit } from "lucide-react";

// Components
import OrganizationAbout from "../components/OrganizationAbout";
import EventsSection from "../components/EventsSection";
import OrganizationMembers from "../components/OrganizationMembers";
import OrganizationPhotos from "../components/OrganizationPhotos";
import OrganizationSettings from "../components/OrganizationSettings";

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState({ previous: [], current: [], future: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [permissions, setPermissions] = useState({});

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

        const filteredMembers = data.filter((m) => m.orgId === id);
        setMembers(filteredMembers);
      } else {
        setMembers([]);
      }
      setLoadingMembers(false); // ✅ mark members as loaded
    });

    return () => off(membersRef);
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsMember(false);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || loadingMembers) return;

    const member = members.find((m) => m.userId === currentUser.uid || m.uid === currentUser.uid);

    if (member) {
      setIsMember(true);
      setUserRole(member.position || "Member");
    } else {
      // Not a member, check if admin
      // fetch the user from the database
      get(ref(db, `users/${currentUser.uid}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.role === "admin") {
              setIsMember(true);       // admins can edit even if not a member
              setUserRole("Admin");
            } else {
              setIsMember(false);
              setUserRole(null);
            }
          } else {
            setIsMember(false);
            setUserRole(null);
          }
        });
    }
  }, [currentUser, members, loadingMembers]);

  useEffect(() => {
    const permRef = ref(db, `permissions/${id}`);

    const unsubscribe = onValue(permRef, (snapshot) => {
      if (snapshot.exists()) {
        setPermissions(snapshot.val());
      } else {
        setPermissions({});
      }
    });

    return () => off(permRef);
  }, [id]);

// console.log("currentUser:", currentUser);
// console.log("members:", members);
// console.log("found member:", members.find(m => m.uid === currentUser?.uid));

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

  console.log(userRole);

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative w-full h-48 sm:h-64 mb-8">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${org.image || ""})`,
            filter: "brightness(50%)",
            backgroundColor: "#ccc",
          }}
        />

        {/* Profile image wrapper */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
          {/* Circle */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg relative">
            {org.image ? (
              <img
                src={org.image}
                alt="Organization"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Edit Icon slightly overlapping */}
          <div className="absolute top-0 right-0 transform translate-x-1/8 -translate-y-1/8 z-20">
            {isMember && (userRole === "President" || userRole === "Admin") && (
              <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer">
                <Edit className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </div>
            )}
          </div>
        </div>
      </div>

      <Link to="/organizations" className="text-black dark:text-white mb-4 inline-block">
        ← Back to Organizations
      </Link>

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

        <button
          onClick={() => setActiveTabPage("settings")}
          className={`px-4 py-2 rounded-full transition ${
            activeTabPage === "settings"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Settings
        </button>
      </div>

      {/* Render About or Events */}
      {activeTabPage === "settings" ? (
          <OrganizationSettings 
            org={org} 
            onSave={handleSaveOrg} 
            permissions={permissions}
            orgId={id}
          />
         ) : 
        activeTabPage === "about" ? (
          <OrganizationAbout org={org} members={members} onSave={handleSaveOrg}/>
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