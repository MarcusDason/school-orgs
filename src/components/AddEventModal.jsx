import { useState } from "react";
import { X, Calendar, FileText, MapPin, Type, Image } from "lucide-react";
import { db } from "../firebase/config";
import { ref, push } from "firebase/database";

export default function AddEventModal({ isOpen, onClose, orgId, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    image: null,
    imageFocus: "center", // default focus
    attendees: "", // <-- new field
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && !file.type.startsWith("image/")) {
        setError("Please upload a valid image.");
        return;
      }

      setForm({ ...form, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, startDate, endDate, location, imageFocus, attendees } = form;

    if (!title || !description || !startDate || !endDate) {
      setError("Title, description, and both dates are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError("End date cannot be before start date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFuture = start > today;

    if (!isFuture && !location) {
      setError("Location is required for current or past events.");
      return;
    }

    try {
      let imageData = null;
      if (form.image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(form.image);
        });
      }

      const eventData = {
        title,
        description,
        startDate,
        endDate,
        location: location || "",
        image: imageData,
        imageFocus: imageFocus || "center",
        attendees: attendees || null, // store null if empty
      };

      const eventRef = ref(db, `organizations/${orgId}/events`);
      const newEventRef = await push(eventRef, eventData);

      if (onAdd) onAdd({ id: newEventRef.key, ...eventData });
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to add event.");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      image: null,
      imageFocus: "center",
      attendees: "",
    });
    setPreview(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  // Determine if end date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const showAttendeesInput = form.endDate && new Date(form.endDate) < today;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-xl border border-gray-200 dark:border-gray-700 scrollbar-none">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5 dark:text-white" />
        </button>

        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Add New Event</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Event Title */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Event Title</label>
          <div className="relative">
            <Type className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="title"
              placeholder="Enter event title"
              value={form.title}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              name="description"
              placeholder="Enter event description"
              value={form.description}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Start Date */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* End Date */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Location */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="location"
              placeholder="Event Location"
              value={form.location}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Event Image</label>
          <div className="relative">
            <Image className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Image Focus */}
          <label className="text-gray-700 dark:text-gray-200 font-medium">Image Focus</label>
          <select
            name="imageFocus"
            value={form.imageFocus}
            onChange={handleChange}
            className="pl-2 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>

          {/* Preview */}
          {preview && (
            <div className="w-full h-48 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: form.imageFocus }}
              />
            </div>
          )}

          {/* Conditional Attendees Input */}
          {showAttendeesInput && (
            <>
              <label className="text-gray-700 dark:text-gray-200 font-medium">Number of Attendees</label>
              <input
                type="number"
                name="attendees"
                value={form.attendees}
                onChange={handleChange}
                className="pl-4 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg mt-2"
          >
            Add Event
          </button>

        </form>
      </div>
    </div>
  );
}