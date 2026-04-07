import React, { useState, useEffect } from "react";

export default function EditModal({ editModal, setEditModal, saveEditModal }) {
  const [previewImage, setPreviewImage] = useState(null);

  // Sync previewImage when modal opens
  useEffect(() => {
    if (editModal.section === "topPart" && editModal.value) {
      setPreviewImage(editModal.value.image || null);
    }
  }, [editModal.section, editModal.value]);

  const closeEditModal = () => {
    setEditModal({ open: false, section: "", value: null });
    setPreviewImage(null);
  };

  if (!editModal.open) return null;

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setEditModal({
        ...editModal,
        value: { ...editModal.value, file, image: reader.result },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          {editModal.section === "about" && "Edit About This Event"}
          {editModal.section === "schedule" && "Edit Event Schedule"}
          {editModal.section === "info" && "Edit Event Info"}
          {editModal.section === "topPart" && "Edit Event Top Section"}
        </h3>

        {/* Top Part Section */}
        {editModal.section === "topPart" && (
          <div className="flex flex-col gap-4">
            {/* Title */}
            <input
              type="text"
              placeholder="Event Title"
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={editModal.value.title}
              onChange={(e) =>
                setEditModal({
                  ...editModal,
                  value: { ...editModal.value, title: e.target.value },
                })
              }
            />

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {/* Preview */}
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-2 w-full h-40 object-cover rounded"
              />
            )}
          </div>
        )}

        {/* About Section */}
        {editModal.section === "about" && (
          <textarea
            className="w-full h-40 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            value={editModal.value}
            onChange={(e) =>
              setEditModal({ ...editModal, value: e.target.value })
            }
          />
        )}

        {/* Schedule Section */}
        {editModal.section === "schedule" && (
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {editModal.value
            .slice() // create a copy so we don't mutate state
            .sort((a, b) => {
                if (!a.time) return 1; // empty times go to the end
                if (!b.time) return -1;
                return a.time.localeCompare(b.time); // sort HH:MM strings
            })
            .map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                <input
                    type="time"
                    required
                    className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={item.time || ""}
                    onChange={(e) => {
                    const newSchedule = [...editModal.value];
                    // find the index in the original array
                    const originalIndex = newSchedule.findIndex(
                        (sch) => sch === item
                    );
                    newSchedule[originalIndex].time = e.target.value;
                    setEditModal({ ...editModal, value: newSchedule });
                    }}
                />
                <input
                    type="text"
                    required
                    className="flex-2 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Activity"
                    value={item.activity || ""}
                    onChange={(e) => {
                    const newSchedule = [...editModal.value];
                    const originalIndex = newSchedule.findIndex(
                        (sch) => sch === item
                    );
                    newSchedule[originalIndex].activity = e.target.value;
                    setEditModal({ ...editModal, value: newSchedule });
                    }}
                />
                <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => {
                    const newSchedule = [...editModal.value];
                    const originalIndex = newSchedule.findIndex(
                        (sch) => sch === item
                    );
                    newSchedule.splice(originalIndex, 1);
                    setEditModal({ ...editModal, value: newSchedule });
                    }}
                >
                    Delete
                </button>
                </div>
            ))}

            <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() =>
                setEditModal({
                ...editModal,
                value: [...editModal.value, { time: "", activity: "" }],
                })
            }
            >
            Add Schedule Item
            </button>
        </div>
        )}

        {/* Info Section */}
        {editModal.section === "info" && (
          <div className="flex flex-col gap-3">
            {["startDate", "endDate"].map((field) => (
              <div className="flex flex-col" key={field}>
                <label className="text-gray-700 dark:text-gray-200">
                  {field === "startDate" ? "Start Date" : "End Date"}
                </label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editModal.value[field]}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      value: { ...editModal.value, [field]: e.target.value },
                    })
                  }
                />
              </div>
            ))}

            {["startTime", "endTime"].map((field) => (
              <div className="flex flex-col" key={field}>
                <label className="text-gray-700 dark:text-gray-200">
                  {field === "startTime" ? "Start Time" : "End Time"}
                </label>
                <input
                  type="time"
                  className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editModal.value[field]}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      value: { ...editModal.value, [field]: e.target.value },
                    })
                  }
                />
              </div>
            ))}

            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-200">Location</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                value={editModal.value.location}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    value: { ...editModal.value, location: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-200">Attendees</label>
              <input
                type="number"
                min={0}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                value={editModal.value.attendees}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    value: { ...editModal.value, attendees: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={closeEditModal}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveEditModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}