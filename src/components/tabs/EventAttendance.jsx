import { Fragment } from "react";
import { exportToExcel } from "../../utils/exportExcel"; // Adjust path as needed

export default function EventAttendance({
  event,
  attendanceForm,
  setAttendanceForm,
  handleSubmitAttendance,
  userCanEdit,
}) {
  // Wrap submit to prevent default form reload
  const handleFormSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    handleSubmitAttendance();
  };

  // Handle export to Excel
  const handleExport = () => {
    if (!event.attendanceBreakdown) return;

    const data = Object.entries(event.attendanceBreakdown).map(
      ([section, count]) => ({
        Section: section,
        Attendees: count,
      })
    );

    exportToExcel(data, `${event.title || "attendance"}-breakdown`, "Attendance");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4 items-center mb-6">

      <h2 className="text-xl font-semibold dark:text-white">
        Event Attendance
      </h2>

      {/* COUNT */}
      <div className="text-gray-700 dark:text-gray-200 text-lg">
        <span className="font-medium">Total Attendees: </span>
        {event.attendees || 0}
      </div>

      {/* FORM */}
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-md flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Full Name"
          value={attendanceForm.name}
          onChange={(e) =>
            setAttendanceForm({ ...attendanceForm, name: e.target.value })
          }
          className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Course"
            value={attendanceForm.course}
            onChange={(e) =>
              setAttendanceForm({ ...attendanceForm, course: e.target.value })
            }
            className="w-1/2 p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />

          <select
            value={attendanceForm.section}
            onChange={(e) =>
              setAttendanceForm({ ...attendanceForm, section: e.target.value })
            }
            className="w-1/2 p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select Section</option>
            <option value="1-A">1-A</option>
            <option value="2-A">2-A</option>
            <option value="3-A">3-A</option>
            <option value="4-A">4-A</option>
            <option value="1-B">1-B</option>
            <option value="2-B">2-B</option>
            <option value="3-B">3-B</option>
            <option value="4-B">4-B</option>
            <option value="1-C">1-C</option>
            <option value="2-C">2-C</option>
            <option value="3-C">3-C</option>
            <option value="4-C">4-C</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="School ID"
          value={attendanceForm.schoolId}
          onChange={(e) =>
            setAttendanceForm({ ...attendanceForm, schoolId: e.target.value })
          }
          className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Attendance
        </button>
      </form>

      {/* Export Button */}
      {userCanEdit && (
        <button
          onClick={handleExport}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      )}

      {/* Attendance Breakdown */}
      <div className="mt-6 w-full max-w-md">
        <h3 className="font-semibold dark:text-white mb-2">
          Attendance Breakdown
        </h3>

        {event.attendanceBreakdown ? (
          <ul className="space-y-2">
            {Object.entries(event.attendanceBreakdown).map(([key, count]) => (
              <li
                key={key}
                className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="dark:text-white">{key}</span>
                <span className="font-semibold dark:text-white">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No data yet.</p>
        )}
      </div>
    </div>
  );
}