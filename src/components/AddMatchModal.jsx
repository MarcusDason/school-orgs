import { useState, useEffect } from "react";

export default function AddMatchModal({
  isOpen,
  onClose,
  onAddMatch,
  matchFormat,
}) {
  const getPlayersPerTeam = () => {
    if (!matchFormat) return 1;
    const parts = matchFormat.split("v");
    return Number(parts[0]);
  };

  const playersPerTeam = getPlayersPerTeam();

  const [newMatch, setNewMatch] = useState({
    team1Name: "",
    team2Name: "",
    team1Players: [],
    team2Players: [],
    date: "",
    time: "",
  });

  // Initialize/reset form when modal opens or format changes
  useEffect(() => {
    if (!isOpen) return;

    setNewMatch({
      team1Name: "",
      team2Name: "",
      date: "",
      time: "",
      team1Players: Array(playersPerTeam).fill(""),
      team2Players: Array(playersPerTeam).fill(""),
    });
  }, [isOpen, playersPerTeam]);

  if (!isOpen) return null;

  // Handle player input changes
  const handlePlayerChange = (team, index, value) => {
    setNewMatch((prev) => {
      const updated = [...prev[team]];
      updated[index] = value;

      return {
        ...prev,
        [team]: updated,
      };
    });
  };

  const handleAdd = () => {
    if (
      !newMatch.team1Name ||
      !newMatch.team2Name ||
      newMatch.team1Players.some((p) => !p) ||
      newMatch.team2Players.some((p) => !p) ||
      !newMatch.date ||
      !newMatch.time
    ) {
      alert("Please fill all required fields!");
      return;
    }

    onAddMatch({
      id: Date.now(),
      teams: [
        {
          name: newMatch.team1Name,
          players: newMatch.team1Players,
        },
        {
          name: newMatch.team2Name,
          players: newMatch.team2Players,
        },
      ],
      date: newMatch.date,
      time: newMatch.time,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[90%] max-w-2xl">

        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Add Match
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">

          {/* TEAM 1 */}
          <div className="flex-1 p-3 border rounded dark:border-gray-600">
            <input
              type="text"
              placeholder="Team One Name"
              value={newMatch.team1Name}
              onChange={(e) =>
                setNewMatch((prev) => ({
                  ...prev,
                  team1Name: e.target.value,
                }))
              }
              className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
            />

            {newMatch.team1Players.map((player, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Player ${idx + 1}`}
                value={player}
                onChange={(e) =>
                  handlePlayerChange("team1Players", idx, e.target.value)
                }
                className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
              />
            ))}
          </div>

          {/* TEAM 2 */}
          <div className="flex-1 p-3 border rounded dark:border-gray-600">
            <input
              type="text"
              placeholder="Team Two Name"
              value={newMatch.team2Name}
              onChange={(e) =>
                setNewMatch((prev) => ({
                  ...prev,
                  team2Name: e.target.value,
                }))
              }
              className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
            />

            {newMatch.team2Players.map((player, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Player ${idx + 1}`}
                value={player}
                onChange={(e) =>
                  handlePlayerChange("team2Players", idx, e.target.value)
                }
                className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
              />
            ))}
          </div>
        </div>

        {/* DATE & TIME */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="date"
            value={newMatch.date}
            onChange={(e) =>
              setNewMatch((prev) => ({ ...prev, date: e.target.value }))
            }
            className="p-2 border rounded dark:bg-gray-700 dark:text-white flex-1"
          />

          <input
            type="time"
            value={newMatch.time}
            onChange={(e) =>
              setNewMatch((prev) => ({ ...prev, time: e.target.value }))
            }
            className="p-2 border rounded dark:bg-gray-700 dark:text-white flex-1"
          />
        </div>

        {/* BUTTONS */}
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