import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

export default function AddMatchModal({ isOpen, onClose, onAddMatch, matchFormat }) {
  const [newMatch, setNewMatch] = useState({ 
    team1Name: "", team2Name: "", date: "", time: "" 
  });

  // Determine number of players per team from matchFormat (e.g., 2v2)
  const getPlayersPerTeam = () => {
    if (!matchFormat) return 1;
    const parts = matchFormat.split("v");
    return Number(parts[0]); // Assuming symmetric teams (2v2 => 2 players per team)
  };

  const playersPerTeam = getPlayersPerTeam();

  // Initialize player fields whenever matchFormat changes
  useEffect(() => {
    const team1 = {};
    const team2 = {};
    for (let i = 1; i <= playersPerTeam; i++) {
      team1[`player${i}`] = "";
      team2[`player${i}`] = "";
    }
    setNewMatch(prev => ({ ...prev, ...team1, ...team2 }));
  }, [matchFormat]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const team1Players = Array.from({ length: playersPerTeam }).map(
      (_, idx) => newMatch[`player${idx + 1}`]
    );
    const team2Players = Array.from({ length: playersPerTeam }).map(
      (_, idx) => newMatch[`player${idx + 1 + playersPerTeam}`]
    );

    if (!newMatch.team1Name || !newMatch.team2Name || team1Players.some(p => !p) || team2Players.some(p => !p) || !newMatch.date || !newMatch.time) {
      alert("Please fill all required fields!");
      return;
    }

    onAddMatch({
      id: Date.now(),
      teams: [
        { name: newMatch.team1Name, players: team1Players },
        { name: newMatch.team2Name, players: team2Players }
      ],
      date: newMatch.date,
      time: newMatch.time
    });

    onClose();
    setNewMatch({ team1Name: "", team2Name: "", date: "", time: "" });
  };

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[90%] max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Match</h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Team 1 */}
          <div className="flex-1 p-3 border rounded dark:border-gray-600">
            <input
              type="text"
              placeholder="Team One Name"
              value={newMatch.team1Name}
              onChange={e => setNewMatch(prev => ({ ...prev, team1Name: e.target.value }))}
              className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
            />
            {Array.from({ length: playersPerTeam }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Player ${idx + 1}`}
                value={newMatch[`player${idx + 1}`] || ""}
                onChange={e => setNewMatch(prev => ({ ...prev, [`player${idx + 1}`]: e.target.value }))}
                className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
              />
            ))}
          </div>

          {/* Team 2 */}
          <div className="flex-1 p-3 border rounded dark:border-gray-600">
            <input
              type="text"
              placeholder="Team Two Name"
              value={newMatch.team2Name}
              onChange={e => setNewMatch(prev => ({ ...prev, team2Name: e.target.value }))}
              className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
            />
            {Array.from({ length: playersPerTeam }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Player ${idx + 1}`}
                value={newMatch[`player${idx + 1 + playersPerTeam}`] || ""}
                onChange={e => setNewMatch(prev => ({ ...prev, [`player${idx + 1 + playersPerTeam}`]: e.target.value }))}
                className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
              />
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="date"
            value={newMatch.date}
            onChange={e => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white flex-1"
          />
          <input
            type="time"
            value={newMatch.time}
            onChange={e => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white flex-1"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}