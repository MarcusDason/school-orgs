import { useRef } from "react";
import { Clock, Edit, ArrowDown, ArrowUp } from "lucide-react";

export default function EventAbout({ event, openEditModal, userCanEdit }) {
  const aboutRef = useRef(null);
  const scheduleRef = useRef(null);

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // ================= FIXED SCROLL (IMPORTANT) =================
  const scrollToSchedule = () => {
    const el = scheduleRef.current;
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: top - 80, // offset for spacing / header
      behavior: "smooth",
    });
  };

  const scrollToAbout = () => {
    const el = aboutRef.current;
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: top - 80,
      behavior: "smooth",
    });
  };

  // Conditions
  const isLongDescription = event?.description?.length > 200;
  const isLongSchedule = event?.schedule?.length > 5;

  return (
    <>
      {/* ================= FLOAT: DOWN ================= */}
      {isLongDescription && (
        <button
          onClick={scrollToSchedule}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
          title="Go to schedule"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      )}

      {/* ================= FLOAT: UP ================= */}
      {isLongSchedule && (
        <button
          onClick={scrollToAbout}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 flex items-center justify-center z-50"
          title="Back to about"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* ================= ABOUT SECTION ================= */}
      <div
        ref={aboutRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">
            About this Event
          </h2>

          {userCanEdit && (
            <button onClick={() => openEditModal("about")} className="p-1">
              <Edit className="w-5 h-5 text-black hover:text-gray-200 dark:text-white" />
            </button>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-200">
          {event.description || "No description available."}
        </p>
      </div>

      {/* ================= SCHEDULE SECTION ================= */}
      <div
        ref={scheduleRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">
            Event Schedule
          </h2>

          {userCanEdit && (
            <button onClick={() => openEditModal("schedule")} className="p-1">
              <Edit className="w-5 h-5 text-black hover:text-gray-200 dark:text-white" />
            </button>
          )}
        </div>

        {event.schedule && event.schedule.length > 0 ? (
          <div className="space-y-4">
            {event.schedule
              .slice()
              .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700"
                >
                  <Clock className="w-6 h-6 text-blue-500" />

                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTime12Hour(item.time)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-200">
                      {item.activity || "No activity specified"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No schedule yet.</p>
        )}
      </div>
    </>
  );
}