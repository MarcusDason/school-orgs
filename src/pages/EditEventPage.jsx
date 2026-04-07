import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Type,
  Image,
  Plus,
  ArrowLeft,
  Clock
} from "lucide-react";

import { db } from "../firebase/config";
import { ref, get, update } from "firebase/database";

export default function EditEventPage() {
  const { orgId, eventId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    image: null,
    attendees: "",
    schedule: [{ time: "", activity: "" }],
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    async function fetchEvent() {
      const snapshot = await get(
        ref(db, `organizations/${orgId}/events/${eventId}`)
      );

      if (snapshot.exists()) {
        const data = snapshot.val();

        setForm({
          title: data.title || "",
          description: data.description || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          location: data.location || "",
          image: null,
          attendees: data.attendees || "",
          schedule: data.schedule || [{ time: "", activity: "" }],
        });

        setPreview(data.image || null);
      }

      setLoading(false);
    }

    fetchEvent();
  }, [orgId, eventId]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      const updated = { ...form, [name]: value };

      if (updated.startDate && updated.endDate) {
        const start = new Date(updated.startDate);
        const end = new Date(updated.endDate);
        setDateError(end < start ? "End date cannot be earlier than start date." : "");
      }

      setForm(updated);
    }
  };

  // ================= SCHEDULE =================
  const handleScheduleChange = (index, field, value) => {
    const updated = [...form.schedule];
    updated[index][field] = value;
    setForm({ ...form, schedule: updated });
  };

  const addScheduleRow = () => {
    setForm({
      ...form,
      schedule: [...form.schedule, { time: "", activity: "" }],
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageData = preview;

      if (form.image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(form.image);
        });
      }

      await update(
        ref(db, `organizations/${orgId}/events/${eventId}`),
        {
          ...form,
          image: imageData,
        }
      );

      navigate(`/organizations/${orgId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update event.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 dark:text-white">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 mb-4 bg-white dark:bg-gray-800 text-blue-600 rounded-lg shadow hover:bg-blue-50"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-3xl font-bold dark:text-white mb-6">
          Edit Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ================= BASIC INFO ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Type size={18} /> Basic Information
            </h2>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event Title"
              className="w-full px-4 py-3 mb-3 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Event Description"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* ================= DATE & LOCATION ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Calendar size={18} /> Schedule & Location
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="p-2 rounded bg-gray-100 dark:bg-gray-700" />
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="p-2 rounded bg-gray-100 dark:bg-gray-700" />
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="p-2 rounded bg-gray-100 dark:bg-gray-700" />
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="p-2 rounded bg-gray-100 dark:bg-gray-700" />
            </div>

            {dateError && <p className="text-red-500 mt-2">{dateError}</p>}

            <div className="relative mt-4">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Event Location"
                className="pl-10 w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* SCHEDULE */}
            <h3 className="mt-6 mb-2 font-semibold dark:text-white">
              Detailed Schedule
            </h3>

            {form.schedule.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) =>
                    handleScheduleChange(index, "time", e.target.value)
                  }
                  className="p-2 rounded bg-gray-100 dark:bg-gray-700"
                />
                <input
                  type="text"
                  value={item.activity}
                  onChange={(e) =>
                    handleScheduleChange(index, "activity", e.target.value)
                  }
                  placeholder="Activity"
                  className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addScheduleRow}
              className="flex items-center gap-2 text-blue-600 mt-2"
            >
              <Plus size={16} /> Add Schedule
            </button>
          </div>

          {/* ================= IMAGE ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Image size={18} /> Event Image
            </h2>

            <input type="file" name="image" onChange={handleChange} />

            {preview && (
              <img
                src={preview}
                className="w-full h-56 object-cover rounded-xl mt-4"
              />
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg">
              Update Event
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}