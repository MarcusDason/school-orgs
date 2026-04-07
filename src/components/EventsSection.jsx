import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import EventCard from "./EventCard";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../firebase/config";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

const EventsSection = ({ activeTab, search, setSearch, setActiveTab, orgId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [role, setRole] = useState("user"); // default role
  const [orgMembers, setOrgMembers] = useState([]); // array of member objects

  // 1️⃣ Fetch current user's role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(db, `users/${user.uid}`));
          if (snapshot.exists()) {
            setRole(snapshot.val().role || "user");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2️⃣ Fetch members of this org
  useEffect(() => {
    const membersRef = ref(db, "members");
    const q = query(membersRef, orderByChild("orgId"), equalTo(orgId));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val() || {};
      const membersArray = Object.values(data); // convert objects to array
      setOrgMembers(membersArray);
    });

    return () => unsubscribe();
  }, [orgId]);

  // 3️⃣ Fetch events from Firebase
  useEffect(() => {
    const eventsRef = ref(db, "events");

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const loadedEvents = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      // Filter events by organization
      const orgEvents = loadedEvents.filter((event) => event.orgId === orgId);
      setEvents(orgEvents);
    });

    return () => unsubscribe();
  }, [orgId]);

  // 4️⃣ Classify events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categorizedEvents = { previous: [], current: [], future: [] };

  events.forEach((event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < today) categorizedEvents.previous.push(event);
    else if (start <= today && end >= today) categorizedEvents.current.push(event);
    else categorizedEvents.future.push(event);
  });

  // 5️⃣ Filter events by search
  const filteredEvents = categorizedEvents[activeTab].filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  // 6️⃣ Check if current user can add events (admin or member of this org)
  const userCanAdd =
    role === "admin" ||
    orgMembers.some((member) => member.uid === auth.currentUser?.uid);

  return (
    <>
      {/* Search + Add Event */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
          />
        </div>

        {userCanAdd && (
          <button
            onClick={() => navigate(`/organizations/${orgId}/add-event`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-3">
        {["previous", "current", "future"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 dark:text-white"
            }`}
          >
            {tab === "previous" && "Previous Events"}
            {tab === "current" && "Current Events"}
            {tab === "future" && "Future Events"}
          </button>
        ))}
      </div>

      <hr className="mb-3" />

      {/* Event List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-10">
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                status={activeTab}
                orgId={orgId}
                eventId={event.id}
              />
            ))
          ) : (
            <p className="dark:text-gray-300">No events found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EventsSection;