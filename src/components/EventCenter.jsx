import { Clock, Edit, Calendar, Trash2 , Plus , Camera} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Users,
  BookOpen,
  Trophy,
  Activity,
} from "lucide-react";

import { useState , useEffect} from "react";
import { ref, update , get, query, orderByChild, equalTo, onValue} from "firebase/database";
import { db , auth} from "../firebase/config"; 
import { onAuthStateChanged } from "firebase/auth";

import EventAbout from "./tabs/EventAbout";
import EventCompetition from "./tabs/EventCompetition";
import EventPhotos from "./tabs/EventPhotos";
import EventAttendance from "./tabs/EventAttendance";
import EventStatistic from "./tabs/EventStatistics";

export default function EventCenter({
  activeTab,
  event,
  setEvent,
  view,
  orgId,
  setView,
  openEditModal,
  openCompetitionDetail,
  openCompetitionModal,
  selectedCompetition,
  handleAddMatch,
  handleDeleteMatch,
  handleFinishMatch,
  handleDeleteCompetition,
  statusFilter,
  setStatusFilter,
  eventId,
  organization,
}) {

    const [role, setRole] = useState("user");
    const [orgMembers, setOrgMembers] = useState([]);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({
    player1: "",
    player2: "",
    date: "",
    time: "",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    name: "",
    course: "",
    section: "",
    schoolId: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
        const snapshot = await get(ref(db, `users/${user.uid}`));
        if (snapshot.exists()) {
            setRole(snapshot.val().role || "user");
        }
        }
    });

    return () => unsubscribe();
    }, []);

  useEffect(() => {
    if (!orgId) return;

    const membersRef = ref(db, "members");
    const q = query(membersRef, orderByChild("orgId"), equalTo(orgId));

    const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val() || {};
        setOrgMembers(Object.values(data));
    });

    return () => unsubscribe();
  }, [orgId]);

  const userCanEdit =
  role === "admin" ||
  orgMembers.some((m) => m.uid === auth.currentUser?.uid);
    

  // =================== Helpers ===================
  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };


   const handleSubmitAttendance = async () => {
    if (!attendanceForm.name || !attendanceForm.course || !attendanceForm.schoolId) {
        alert("Please fill all fields");
        return;
    }

    const course = attendanceForm.course.toUpperCase().trim();
    const section = attendanceForm.section;
    const key = `${course}-${section}`;

    const currentCounts = event.attendanceBreakdown || {};

    const updatedCounts = {
        ...currentCounts,
        [key]: (currentCounts[key] || 0) + 1,
    };

    const newTotal = Number(event.attendees || 0) + 1;

    try {
        // ✅ FIXED PATH
        await update(ref(db, `events/${eventId}`), {
        attendees: newTotal,
        attendanceBreakdown: updatedCounts,
        });

        // ✅ update UI
        setEvent((prev) => ({
        ...prev,
        attendees: newTotal,
        attendanceBreakdown: updatedCounts,
        }));

        // reset form
        setAttendanceForm({
        name: "",
        course: "",
        schoolId: "",
        section: "",
        });

    } catch (err) {
        console.error("Failed to update attendance:", err);
    }
    };

    const attendanceData = Object.entries(event.attendanceBreakdown || {}).map(
        ([key, value]) => ({
            name: key,
            value,
        })
    );

    const totalAttendees = event.attendees || 0;

    const competitionCount = event.competitions?.length || 0;

    const competitionData =
    event.competitions?.map((comp) => ({
        name: comp.name,
        participants: comp.matches?.length || 0,
    })) || [];

  // =================== Render ===================
  return (
    <div className="lg:w-3/5 flex flex-col gap-6">
        {/* ================= About Tab ================= */}
        {activeTab === "about" && (
            <EventAbout
                event={event}
                openEditModal={openEditModal}
                userCanEdit={userCanEdit}
            />
        )}

        {/* ================= Competition Tab ================= */}
        {activeTab === "competition" && (
            <EventCompetition
                event={event}
                view={view}
                setView={setView}
                selectedCompetition={selectedCompetition}
                openCompetitionDetail={openCompetitionDetail}
                openCompetitionModal={openCompetitionModal}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                handleAddMatch={handleAddMatch}
                handleDeleteMatch={handleDeleteMatch}
                handleFinishMatch={handleFinishMatch}
                userCanEdit={userCanEdit}
            />
        )}

        {/* PHOTOS TAB */}
        {activeTab === "photos" && (
            <EventPhotos
                event={event}
                setEvent={setEvent}
                orgId={orgId}
                userCanEdit={userCanEdit}
            />
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
        <EventAttendance
            event={event}
            attendanceForm={attendanceForm}
            setAttendanceForm={setAttendanceForm}
            handleSubmitAttendance={handleSubmitAttendance}
            userCanEdit={userCanEdit}
        />
        )}

        {/* STATISTICS */}
        {activeTab === "statistics" && (
            <EventStatistic
                event={event}
                organizationName={organization?.name}
                totalAttendees={totalAttendees}
                attendanceData={attendanceData}
                competitionCount={competitionCount}
                competitionData={competitionData}
                userCanEdit={userCanEdit}
            />
        )}

    </div>
  );
}