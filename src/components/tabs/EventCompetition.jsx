import { useState } from "react";
import { Trash2, Calendar, Clock, Plus } from "lucide-react";
import AddMatchModal from "../AddMatchModal"; // import the modal

export default function EventCompetition({
  event,
  view,
  setView,
  selectedCompetition,
  openCompetitionDetail,
  openCompetitionModal,
  statusFilter,
  setStatusFilter,
  handleAddMatch,
  handleDeleteMatch,
  handleFinishMatch,
  handleDeleteCompetition,
  userCanEdit,
}) {
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

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

  const getMatchStatus = (match) => {
    if (match.status === "finished") return "finished";
    if (!match.date || !match.time) return "future";

    const matchDateTime = new Date(`${match.date}T${match.time}`);
    const now = new Date();
    const oneHourLater = new Date(matchDateTime.getTime() + 3600000);

    if (matchDateTime < now && oneHourLater < now) return "finished";
    if (matchDateTime <= now && oneHourLater >= now) return "ongoing";
    return "future";
  };

  

  const filteredMatches =
    selectedCompetition?.matches?.filter((match) =>
      statusFilter ? getMatchStatus(match) === statusFilter : true
    ) || [];

  const sortedMatches = filteredMatches.sort((a, b) => {
    const statusOrder = { ongoing: 0, future: 1, finished: 2 };
    return statusOrder[getMatchStatus(a)] - statusOrder[getMatchStatus(b)];
  });

  // const handleEndCompetition = (compId) => {
  //   if (window.confirm("Are you sure you want to end this competition? This action cannot be undone.")) {
  //     // Call the function passed from parent to end the competition
  //     openCompetitionDetail({ ...selectedCompetition, status: "finished" });
  //     setView("list");
  //   }
  // };

  console.log(userCanEdit)
  console.log("MODAL OPEN:", isMatchModalOpen);
  


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          <h2 className="text-xl font-semibold dark:text-white">Competition</h2>

          {event.competitions && event.competitions.length > 0 ? (
            <ul className="space-y-3">
              {event.competitions.map((comp, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => openCompetitionDetail(comp)}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {comp.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {comp.type || "Tournament"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No competitions yet.
            </p>
          )}
          {userCanEdit && (
            <button
              onClick={openCompetitionModal}
              className="w-full sm:w-auto mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add New Competition</span>
            </button>
          )}
        </>
      )}

      {/* DETAIL VIEW */}
      {view === "detail" && selectedCompetition && (
        <>
          <button
            onClick={() => setView("list")}
            className="text-black mb-2 self-start dark:text-white"
          >
            ← Back to Competitions
          </button>

          <h2 className="text-xl font-semibold dark:text-white">
            {selectedCompetition.name}
          </h2>
          
          {/* FILTER */}
          <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex gap-3 mb-2">
              {["finished", "ongoing", "future"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded font-medium ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {userCanEdit && (
                <button
                  onClick={() => setIsMatchModalOpen(true)}
                  className="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Match
                </button>
              )}
              {userCanEdit && (
                <button
              
                  className="self-start px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  End Competition
                </button>
              )}
            </div>
          </div>

          {/* MATCHES */}
          {sortedMatches.length > 0 ? (
            <ul className="space-y-3 mt-4">
              {sortedMatches.map((match, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900 dark:text-white break-words">
                      {match.teams && match.teams.length > 0
                        ? `${match.teams[0].name} vs ${match.teams[1].name}`
                        : match.players?.join(" vs ")}
                    </span>

                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime12Hour(match.time)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {userCanEdit && getMatchStatus(match) === "ongoing" && (
                      <button
                        onClick={() => handleFinishMatch(match.id)}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Finish Match
                      </button>
                    )}
                    {userCanEdit && (
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic mt-4">
              No matches scheduled.
            </p>
          )}

          {/* ADD MATCH MODAL */}
          <AddMatchModal
            isOpen={isMatchModalOpen}
            onClose={() => setIsMatchModalOpen(false)}
            onAddMatch={handleAddMatch}
            matchFormat={selectedCompetition?.matchFormat}
          />
        </>
      )}
    </div>
  );
}