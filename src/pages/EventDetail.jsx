import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db , auth} from "../firebase/config";
import { get, ref, update, remove } from "firebase/database";
import { MapPin, Calendar, User, Clock, Edit , Trophy, CalendarRange, UserRound , Camera , MoveRightIcon} from "lucide-react";
import EditModal from "../components/EditModal";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import EventCenter from "../components/EventCenter";
import AddCompetitionModal from "../components/AddCompetitionModal";
import { onAuthStateChanged } from "firebase/auth";

export default function EventDetail() {
  const [currentUser, setCurrentUser] = useState(null);
  const [orgMembers, setOrgMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const { orgId, eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editModal, setEditModal] = useState({ open: false, section: "", value: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [newCompetition, setNewCompetition] = useState({ name: "", type: "" });
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [view, setView] = useState("list");
  const [statusFilter, setStatusFilter] = useState("ongoing");
  const [organization, setOrganization] = useState(null);

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  

// ==================== CHECK MEMBERSHIP & ROLE ====================
useEffect(() => {
  if (!currentUser || !organization) return; // ensure org is loaded

  async function fetchMembershipAndRole() {
    try {
      // 1️⃣ Get current user's role from users table
      const userSnap = await get(ref(db, `users/${currentUser.uid}`));
      const mainUserRole = userSnap.exists() ? userSnap.val().role : "user";

      // 2️⃣ Get all members of this org
      const membersSnap = await get(ref(db, "members"));
      const membersData = membersSnap.exists() ? Object.values(membersSnap.val()) : [];

      // 3️⃣ Check if current user is a member of this org
      const isOrgMember = membersData.some(
        (member) => member.uid === currentUser.uid && member.orgId === organization.id
      );

      setIsMember(isOrgMember);   // true if user is a member of this org
      setUserRole(mainUserRole);  // admin/user role

    } catch (err) {
      console.error("Error fetching membership:", err);
    }
  }

  fetchMembershipAndRole();
}, [currentUser, organization]);

// Determine if user can edit
const canEdit = userRole === "admin" || isMember;

 useEffect(() => {
  async function fetchEventAndOrganization() {
    try {
      const eventSnap = await get(ref(db, `events/${eventId}`));

      if (!eventSnap.exists()) {
        setEvent(null);
        return;
      }

      const eventData = eventSnap.val();
      setEvent({ id: eventId, ...eventData });

      // fetch organization using orgId inside event
      if (eventData.orgId) {
        const orgSnap = await get(ref(db, `organizations/${eventData.orgId}`));
        if (orgSnap.exists()) {
          setOrganization({ id: eventData.orgId, ...orgSnap.val() });
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchEventAndOrganization();
}, [eventId]);


console.log("currentUser:", currentUser);
console.log("userRole:", userRole);
console.log("isMember:", isMember);
console.log("canEdit:", canEdit);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
    </div>
  );

  if (!event) return (
    <div className="text-center mt-10 dark:text-white">
      <p>Event not found.</p>
      <Link to={`/organizations/${event?.orgId || orgId}`} className="text-blue-600 mt-4 inline-block">← Back</Link>
    </div>
  );

  const now = new Date();
  const getStatus = () => {
    if (!event.startDate) return "future";
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    if (end < now) return "previous";
    if (start <= now && now <= end) return "current";
    return "future";
  };
  const status = getStatus();
  const statusStyles = {
    previous: "bg-gray-200 text-gray-800",
    current: "bg-green-200 text-green-800",
    future: "bg-blue-200 text-blue-800",
  };
  const statusText = { previous: "Completed", current: "Happening Now", future: "Upcoming" };

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const formatDateRange = (start, end) => {
    if (!start) return "Date not set";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;
    const startMonth = startDate.toLocaleString("en-US", { month: "long" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    return endDate.getTime() !== startDate.getTime() 
      ? `${startMonth} ${startDay} – ${endDay}, ${year}` 
      : `${startMonth} ${startDay}, ${year}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime) return "Time not set";
    const start = formatTime12Hour(startTime);
    const end = endTime ? formatTime12Hour(endTime) : "";
    return end ? `${start} – ${end}` : start;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await remove(ref(db, `events/${eventId}`));

      alert("Event deleted successfully!");

      // redirect using event.orgId (fallback to param)
      const redirectOrgId = event?.orgId || orgId;
      window.location.href = `/organizations/${redirectOrgId}`;

    } catch (err) {
      console.error(err);
      alert("Failed to delete event. Try again.");
    }
  };

  // ================== EDIT MODAL HANDLERS ==================
  const openEditModal = (section) => {
    let value;
    switch (section) {
      case "about":
        value = event.description || "";
        break;
      case "schedule":
        value = event.schedule ? event.schedule.map(item => ({ ...item })) : [];
        break;
      case "info":
        value = {
          startDate: event.startDate || "",
          endDate: event.endDate || "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          location: event.location || "",
          attendees: event.attendees || "",
        };
        break;
      case "topPart":
        value = {
          title: event.title || "",
          image: event.image || "",
        };
        setPreviewImage(event.image || null);
        break;
      default:
        value = "";
    }
    setEditModal({ open: true, section, value });
  };

  const closeEditModal = () => setEditModal({ open: false, section: "", value: null });

  const saveEditModal = async () => {
    try {
      if (editModal.section === "schedule") {
        const invalidItem = editModal.value.find(
          (item) => !item.time || !item.activity
        );
        if (invalidItem) {
          alert("All schedule items must have both Time and Activity filled!");
          return;
        }
      }

      if (editModal.section === "info") {
        const { startDate, startTime, location } = editModal.value;
        if (!startDate || !startTime || !location) {
          alert("Please fill in all required info fields!");
          return;
        }
      }

      if (editModal.section === "topPart") {
        const { title } = editModal.value;
        if (!title) {
          alert("Title cannot be empty!");
          return;
        }
      }

      let updatedData = {};

      switch (editModal.section) {
        case "about":
          updatedData = { description: editModal.value };
          break;
        case "schedule":
          updatedData = { schedule: editModal.value };
          break;
        case "info":
          updatedData = editModal.value;
          break;
        case "topPart":
          updatedData = {
            title: editModal.value.title,
            image: editModal.value.image || "",
          };
          break;
      }

      await update(ref(db, `events/${eventId}`), updatedData);

      setEvent({ ...event, ...updatedData });
      setEditModal({ open: false, section: "", value: null });
      setPreviewImage(null);

    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  const handleAddCompetition = async (competition) => {
    const updatedCompetitions = event.competitions
      ? [...event.competitions, competition]
      : [competition];

    try {
      await update(ref(db, `events/${eventId}`), {
        competitions: updatedCompetitions,
      });
      setEvent({ ...event, competitions: updatedCompetitions });
    } catch (err) {
      console.error(err);
      alert("Failed to add competition.");
    }
  };

  const openCompetitionModal = () => {
    if (!userRole || !["admin", "member"].includes(userRole)) {
      alert("Only members or admins can add competitions.");
      return;
    }
    setIsCompetitionModalOpen(true);
  };
  const closeCompetitionModal = () => setIsCompetitionModalOpen(false);

  const openCompetitionDetail = (competition) => {
    setSelectedCompetition(competition);
    setView("detail");
  };

  const handleAddMatch = async (newMatch) => {
    if (!["admin", "member"].includes(userRole)) {
      alert("Only members or admins can add matches.");
      return;
    }
    if (!selectedCompetition) return;

    const updatedCompetitions = event.competitions.map((comp) => {
      if (comp.name === selectedCompetition.name) {
        const matches = comp.matches ? [...comp.matches, newMatch] : [newMatch];
        return { ...comp, matches };
      }
      return comp;
    });

    try {
      await update(ref(db, `events/${eventId}`), {
        competitions: updatedCompetitions,
      });

      setEvent({ ...event, competitions: updatedCompetitions });

      setSelectedCompetition((prev) => ({
        ...prev,
        matches: prev.matches ? [...prev.matches, newMatch] : [newMatch],
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to add match.");
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!selectedCompetition) return;

    const updatedCompetitions = event.competitions.map((comp) => {
      if (comp.name === selectedCompetition.name) {
        const updatedMatches = comp.matches.filter(
          (match) => match.id !== id
        );

        return {
          ...comp,
          matches: updatedMatches,
        };
      }
      return comp;
    });

    try {
      await update(ref(db, `events/${eventId}`), {
        competitions: updatedCompetitions,
      });

      setEvent((prev) => ({
        ...prev,
        competitions: updatedCompetitions,
      }));

      setSelectedCompetition((prev) => ({
        ...prev,
        matches: prev.matches.filter((m) => m.id !== id),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete match.");
    }
  };

  const handleFinishMatch = (id) => {
    if (!selectedCompetition) return;

    const updatedCompetitions = event.competitions.map((comp) => {
      if (comp.name === selectedCompetition.name) {
        const updatedMatches = comp.matches.map((match) => {
          if (match.id === id) {
            return { ...match, status: "finished" };
          }
          return match;
        });

        return { ...comp, matches: updatedMatches };
      }
      return comp;
    });

    setEvent((prev) => ({
      ...prev,
      competitions: updatedCompetitions,
    }));

    setSelectedCompetition((prev) => ({
      ...prev,
      matches: prev.matches.map((match) =>
        match.id === id ? { ...match, status: "finished" } : match
      ),
    }));
  };

  const handleDeleteCompetition = async (id) => {
    const updatedCompetitions = event.competitions.filter(
      (comp) => comp.id !== id
    );
    try {      await update(ref(db, `events/${eventId}`), {
        competitions: updatedCompetitions,
      });
      setEvent({ ...event, competitions: updatedCompetitions });
      setView("list");
    } catch (err) {
      console.error(err);
      alert("Failed to delete competition.");
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Hero Image */}
      {event.image && (
        <div className="relative w-full h-80 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" style={{ objectPosition: event.imageFocus || "center" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status]}`}>
            {statusText[status]}
          </span>
          {canEdit && (
            <button onClick={() => openEditModal("topPart")} className="absolute top-4 right-4">
              <Edit className="w-5 h-5 text-black dark:text-white hover:text-gray-200" />
            </button>
          )}
          <h1 className="absolute bottom-10 left-4 text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {event.title}
          </h1>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm md:text-base">
            <User className="w-5 h-5" />
            <span>{event.attendees || "Not included yet"}</span>
          </div>
        </div>
      )}

      {/* Sticky Back Link */}
      <div className="sticky top-16 z-50 mb-6">
        <Link
          to={`/organizations/${orgId}`}
          className="flex items-center gap-2 text-black dark:text-white inline-block bg-white dark:bg-gray-800 shadow p-4 px-6"
        >
          <MoveRightIcon className="w-4 h-4 rotate-180" />
          Back to Organization
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row max-w-full mx-auto px-6 gap-6">

      {/* LEFT COLUMN - Navigation */}
      <div className="lg:w-1/5 flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("about")}
            className={`text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === "about"
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <CalendarRange className="w-4 h-4 inline-block mr-3" />
            About
          </button>
          <button
            onClick={() => setActiveTab("competition")}
            className={`text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === "competition"
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Trophy className="w-4 h-4 inline-block mr-3" />
            Competition
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            className={`text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === "photos"
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Camera className="w-4 h-4 inline-block mr-3" />
            Photos
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === "attendance"
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <UserRound className="w-4 h-4 inline-block mr-3" />
            Attendance
          </button>

          <button
          onClick={() => setActiveTab("statistics")}
          className={`text-left px-4 py-2 rounded-lg font-medium ${
            activeTab === "statistics"
              ? "bg-blue-500 text-white"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Trophy className="w-4 h-4 inline-block mr-3" />
          Statistics
        </button>
        </div>
      </div>

        {/* Center Column */}
        <EventCenter
          activeTab={activeTab}
          setEvent={setEvent} 
          event={event}
          orgId={orgId}  
          view={view}
          setView={setView}
          openEditModal={openEditModal}
          openCompetitionDetail={openCompetitionDetail}
          openCompetitionModal={openCompetitionModal}
          selectedCompetition={selectedCompetition}
          handleAddMatch={handleAddMatch}
          handleDeleteMatch={handleDeleteMatch}
          handleDeleteCompetition={handleDeleteCompetition}
          handleFinishMatch={handleFinishMatch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          eventId={eventId}
          organization={organization}
        />

        {/* Right Column */}
        <div className="lg:w-1/5 bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-20 h-fit flex flex-col gap-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Event Info</h2>
            {canEdit && (
              <button onClick={() => openEditModal("info")} className="p-1">
                <Edit className="w-5 h-5 text-black dark:text-white hover:text-gray-200" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 text-gray-700 dark:text-gray-200 mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-500">Date</span>
              </div>
              <span className="ml-7">{formatDateRange(event.startDate, event.endDate)}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-500">Time</span>
              </div>
              <span className="ml-7">{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-500">Location</span>
              </div>
              <span className="ml-7">{event.location || "Not decided yet"}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-500">Attendees</span>
              </div>
              <span className="ml-7">{event.attendees || "Not included yet"}</span>
            </div>
          </div>
          {canEdit && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
              <User className="w-4 h-4" /> Delete Event
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Competition Modal */}
      <AddCompetitionModal
        isOpen={isCompetitionModalOpen}
        onClose={() => setIsCompetitionModalOpen(false)}
        onAddCompetition={handleAddCompetition}
         userRole={userRole}
      />

      {/* Edit Modal */}
      <EditModal
        editModal={editModal}
        setEditModal={setEditModal}
        saveEditModal={saveEditModal}
      />
    </div>
  );
}