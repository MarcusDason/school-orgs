import { useState } from "react";

export default function AddCompetitionModal({ isOpen, onClose, onAddCompetition }) {
  const [competition, setCompetition] = useState({ name: "", type: "", matchFormat: "" });

  const handleAdd = () => {
    if (!competition.name || !competition.type) {
      alert("Please fill competition name and type!");
      return;
    }
    if ((competition.type === "tournament" || competition.type === "contest" || competition.type === "championship") && !competition.matchFormat) {
      alert("Please select a match format!");
      return;
    }

    onAddCompetition(competition);
    setCompetition({ name: "", type: "", matchFormat: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Competition</h3>

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Competition Name"
            value={competition.name}
            onChange={(e) => setCompetition({ ...competition, name: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          />

          <select
            value={competition.type}
            onChange={(e) => setCompetition({ ...competition, type: e.target.value, matchFormat: "" })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Type</option>
            <option value="contest">Contest</option>
            <option value="tournament">Tournament</option>
            <option value="championship">Championship</option>
            <option value="pageant">Pageant</option>
          </select>

          {/* Conditional dropdown for match format */}
          {(competition.type === "contest" || competition.type === "tournament" || competition.type === "championship") && (
            <select
              value={competition.matchFormat}
              onChange={(e) => setCompetition({ ...competition, matchFormat: e.target.value })}
              className="p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Match Format</option>
              <option value="1v1">1 v 1</option>
              <option value="2v2">2 v 2</option>
              <option value="3v3">3 v 3</option>
              <option value="4v4">4 v 4</option>
              <option value="5v5">5 v 5</option>
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setCompetition({ name: "", type: "", matchFormat: "" }); onClose(); }}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}