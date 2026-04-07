import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo, useRef, useState } from "react";
import { exportToPDF } from "../../utils/exportPDF";

import { Users, BookOpen, Trophy, Activity } from "lucide-react";

export default function EventStatistic({
  event,
  organizationName,
  totalAttendees,
  attendanceData,
  competitionCount,
  competitionData,
  userCanEdit,
}) {
  const statsRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Sort data
  const sortedAttendanceData = useMemo(() => {
    return [...(attendanceData || [])].sort((a, b) => b.value - a.value);
  }, [attendanceData]);

  const sortedCompetitionData = useMemo(() => {
    return [...(competitionData || [])].sort(
      (a, b) => b.participants - a.participants
    );
  }, [competitionData]);

  // ===== Helpers for formatting date/time =====
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

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime) return "Time not set";
    const start = formatTime12Hour(startTime);
    const end = endTime ? formatTime12Hour(endTime) : "";
    return end ? `${start} – ${end}` : start;
  };

  const handleDownload = async () => {
    setIsExporting(true);

    // wait for DOM update
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Prepare schedule text for PDF
    const scheduleText = event
      ? `${formatDateRange(event.startDate, event.endDate)} | ${formatTimeRange(event.startTime, event.endTime)}`
      : "Not set";

    await exportToPDF(statsRef.current, `${event?.title || "event"}-statistics.pdf`, { scheduleText });

    setIsExporting(false);
  };

  const totalMatches =
    event?.competitions?.reduce(
      (sum, c) => sum + (c.matches?.length || 0),
      0
    ) || 0;

  const eventName = event?.title || "N/A";

  return (
    <div
      ref={statsRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-6 mb-10"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold dark:text-white">
            Event Statistics Report
          </h2>

          {/* ✅ Show ONLY in PDF */}
          {isExporting && (
            <div className="mt-2 text-gray-700 space-y-1">
              <p>
                Organization: <strong>{organizationName || "N/A"}</strong>
              </p>
              <p>
                Event: <strong>{eventName}</strong>
              </p>
              <p>
                <strong>Event Schedule:</strong>{" "}
                {formatDateRange(event.startDate, event.endDate)} |{" "}
                {formatTimeRange(event.startTime, event.endTime)}
              </p>
            </div>
          )}
        </div>

        {/* ❌ Hide button in PDF */}
        {!isExporting && userCanEdit &&(
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Download PDF
          </button>
        )}
      </div>

      {/* ✅ Sentence instead of cards */}
      {isExporting ? (
        <div className="text-gray-700 space-y-2">
          <p>
            This event recorded a total of <strong>{totalAttendees}</strong>{" "}
            attendees across <strong>{attendanceData?.length || 0}</strong>{" "}
            courses.
          </p>

          <p>
            There were <strong>{competitionCount}</strong> competitions held
            with a total of <strong>{totalMatches}</strong> matches conducted.
          </p>
        </div>
      ) : (
        // Normal UI cards
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Attendees" value={totalAttendees} icon={Users}/>
          <Stat label="Courses" value={attendanceData?.length || 0} icon={BookOpen} />
          <Stat label="Competitions" value={competitionCount} icon={Trophy} />
          <Stat label="Matches" value={totalMatches} icon={Activity} />
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="h-80 flex flex-col justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          {sortedAttendanceData.length > 0 ? (
            <>
              {isExporting && (
                <p className="mb-2 text-sm text-gray-600">
                  This chart shows the number of attendees per course, with the
                  highest attendance displayed at the top.
                </p>
              )}

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedAttendanceData} layout="vertical" className="p-6">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#60a5fa" 
                    isAnimationActive={!isExporting}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No attendance data available
            </p>
          )}
        </div>

        {/* Competition Chart */}
        <div className="h-80 flex flex-col justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          {sortedCompetitionData.length > 0 ? (
            <>
              {isExporting && (
                <p className="mb-2 text-sm text-gray-600">
                  This chart illustrates the number of participants in each
                  competition, with the highest participation shown first.
                </p>
              )}

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedCompetitionData} className="p-6">
                  <XAxis dataKey="name"/>
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="participants" 
                    fill="#3b82f6" 
                    isAnimationActive={!isExporting}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No competition data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Clean stat card component with icons
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="p-4 rounded-xl shadow-sm border dark:text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
      <div className="flex flex-col">
        <p>{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}