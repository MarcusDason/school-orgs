import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  MapPin,
  Type,
  Image,
  Plus,
  Clock,
  ArrowLeft
} from "lucide-react";

import { db } from "../firebase/config";
import { ref, push } from "firebase/database";

export default function AddEventPage() {
  const { orgId } = useParams();
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
    category: "",
    targetParticipant: "",
    competitions: [{ name: "", type: "" }],
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState("");
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showCompetition, setShowCompetition] = useState(false);
  
  const eventCategories = [
    "Academic showcases",
    "Social gatherings",
    "Arts and performance",
    "Physical education",
    "Fundraising / Community-driven events",
    "Orientation / Seasonal festival",
  ];

  const competitionTypes = [
    "Contest",
    "Tournament",
    "Championship",
    "Pageant",
  ];

  const handleAddCompetition = () => {
    setShowCompetition(true);
  };

const addCompetition = () => {
  setForm((prev) => ({
    ...prev,
    competitions: [...prev.competitions, { name: "", type: "" }],
  }));
};

const handleCompetitionChange = (index, field, value) => {
  const updated = [...form.competitions];
  updated[index][field] = value;

  setForm((prev) => ({
    ...prev,
    competitions: updated,
  }));

  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors[`competition_name_${index}`];
    delete newErrors[`competition_type_${index}`];
    delete newErrors.competitions;
    return newErrors;
  });
};

const removeCompetition = (index) => {
  const updated = form.competitions.filter((_, i) => i !== index);

  setForm((prev) => ({
    ...prev,
    competitions: updated.length
      ? updated
      : [{ name: "", type: "" }],
  }));
};

  

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
      return;
    }

    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");

    // ========== DATE VALIDATION ==========
    if (updatedForm.startDate && updatedForm.endDate) {
      const start = new Date(updatedForm.startDate);
      const end = new Date(updatedForm.endDate);

      if (end < start) {
        setDateError("End date cannot be earlier than start date.");
      } else {
        setDateError("");
      }
    }

    // ========== TIME VALIDATION ==========
    if (updatedForm.startTime && updatedForm.endTime) {
      const [startH, startM] = updatedForm.startTime.split(":").map(Number);
      const [endH, endM] = updatedForm.endTime.split(":").map(Number);

      const start = new Date();
      start.setHours(startH, startM, 0, 0);

      const end = new Date();
      end.setHours(endH, endM, 0, 0);

      if (end <= start) {
        setErrors((prev) => ({
          ...prev,
          endTime: "End time must be after start time",
        }));
        setDuration("");
      } else {
        setErrors((prev) => {
          const newErr = { ...prev };
          delete newErr.endTime;
          return newErr;
        });

        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const durString = `${diffHours} hour(s) ${diffMinutes} minute(s)`;
        setDuration(durString);
        setShowDurationModal(true);
      }
    }
  };

  // ================= SCHEDULE =================
  const handleScheduleChange = (index, field, value) => {
    const updated = [...form.schedule];
    updated[index][field] = value;
    setForm({ ...form, schedule: updated });

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (!updated[index].time) {
        newErrors[`schedule_time_${index}`] = "Time required";
      } else if (form.endTime && updated[index].time > form.endTime) {
        newErrors[`schedule_time_${index}`] = "Cannot exceed event end time";
      } else {
        delete newErrors[`schedule_time_${index}`];
      }

      if (!updated[index].activity) {
        newErrors[`schedule_activity_${index}`] = "Activity required";
      } else {
        delete newErrors[`schedule_activity_${index}`];
      }

      return newErrors;
    });
  };

  const validateScheduleTimes = () => {
    if (!form.endTime) return true;

    const eventEnd = form.endTime;
    let hasError = false;
    const newErrors = { ...errors };

    form.schedule.forEach((item, index) => {
      if (item.time && item.time > eventEnd) {
        newErrors[`schedule_time_${index}`] = "Cannot exceed event end time";
        hasError = true;
      } else {
        delete newErrors[`schedule_time_${index}`];
      }
    });

    if (hasError) {
      setErrors(newErrors);
      setModalMessage("Some schedule times exceed the event's end time!");
      setShowModal(true);
      return false;
    }

    return true;
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

    let newErrors = {};

    // ================= BASIC REQUIRED =================
    if (!form.title) newErrors.title = "Title is required";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.startTime) newErrors.startTime = "Start time is required";
    if (!form.endTime) newErrors.endTime = "End time is required";
    if (!form.location) newErrors.location = "Event location is required";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.targetParticipant)
      newErrors.targetParticipant = "Please select a target participant";

    // ================= IMAGE REQUIRED =================
    if (!form.image) {
      newErrors.image = "Event image is required";
    }

    // ================= DATE ERROR =================
    if (dateError) {
      setError("Please fix the date error before submitting.");
      return;
    }

    // ================= TIME VALIDATION =================
    if (form.startTime && form.endTime) {
      const [startH, startM] = form.startTime.split(":").map(Number);
      const [endH, endM] = form.endTime.split(":").map(Number);

      const start = new Date();
      start.setHours(startH, startM, 0, 0);

      const end = new Date();
      end.setHours(endH, endM, 0, 0);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // ================= SCHEDULE VALIDATION =================
    const scheduleTimesValid = validateScheduleTimes();

    if (!scheduleTimesValid) {
      setError("Please fix schedule times exceeding the event's end time.");
      return;
    }

    const isIncompleteSchedule = form.schedule.some(
      (item) => !item.time || !item.activity
    );

    if (isIncompleteSchedule) {
      newErrors.schedule = "Please fill out all Event Time & Activity fields";
    }

    form.schedule.forEach((item, index) => {
      if (!item.time) {
        newErrors[`schedule_time_${index}`] = "Time is required";
      }
      if (!item.activity) {
        newErrors[`schedule_activity_${index}`] = "Activity is required";
      }
    });

    // ================= COMPETITIONS REQUIRED =================
    if (!form.competitions || form.competitions.length === 0) {
      newErrors.competitions = "Please add at least one competition";
    }

    form.competitions.forEach((comp, index) => {
      if (!comp.name) {
        newErrors[`competition_name_${index}`] =
          "Competition name is required";
      }
      if (!comp.type) {
        newErrors[`competition_type_${index}`] =
          "Competition type is required";
      }
    });

    // ================= FINAL CHECK =================
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Please fill all required fields.");
      return;
    }

    // ================= SUBMIT =================
    try {
      let imageData = null;

      if (form.image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(form.image);
        });
      }

      await push(ref(db, `events`), {
        ...form,
        image: imageData,
        orgId: orgId,
      });

      navigate(`/organizations/${orgId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to add event.");
    }
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastEvent =
  form.startDate &&
  form.endDate &&
  new Date(form.startDate) < today &&
  new Date(form.endDate) < today;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 mb-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
            <ArrowLeft className="w-4 h-4" />
            Back
        </button>

          <h1 className="text-3xl font-bold dark:text-white">
            Create New Event
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Fill out the details below to organize your event
          </p>
        </div>

     <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* ================= BASIC INFO ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Type className="w-5 h-5" /> Basic Information
            </h2>

          <div className="space-y-4">
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

            <input
              name="title"
              placeholder="Event Title"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
            <textarea
              name="description"
              placeholder="Event Description"
              rows={4}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            {/* Category */}
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Event Category</option>
              {eventCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Target Participant */}
            {errors.targetParticipant && (
              <p className="text-red-500 text-sm">{errors.targetParticipant}</p>
            )}
            <textarea
              name="targetParticipant"
              placeholder="Target Participant (e.g., students, staff, general public)"
              rows={3}
              value={form.targetParticipant}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          </div>

          {/* ================= SCHEDULE ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Calendar className="w-5 h-5" /> Schedule & Location
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-2">

              <div>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Start Date
                  </label>

                  {errors.startDate && (
                    <p className="text-red-500 text-sm">{errors.startDate}</p>
                  )}
                </div>
                <input
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white ${
                    dateError ? "border-2 border-red-500" : ""
                  }`}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    End Date
                  </label>

                  {errors.endDate && (
                    <p className="text-red-500 text-sm">{errors.endDate}</p>
                  )}
                </div>

                <input
                  type="date"
                  name="endDate"
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white ${
                    dateError ? "border-2 border-red-500" : ""
                  }`}
                  required
                />

              </div>

              <div>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Start Time
                  </label>

                  {errors.startTime && (
                    <p className="text-red-500 text-sm">{errors.startTime}</p>
                  )}
                </div>

                <input
                  type="time"
                  name="startTime"
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                  End Time
                </label>

                {duration && !errors.endTime && (
                  <p className="text-green-600 text-sm mt-1">
                    Event Duration: {duration}
                  </p>
                )}

                {errors.endTime && (
                  <p className="text-red-500 text-sm">{errors.endTime}</p>
                )}
                </div>
                
                <input
                  type="time"
                  name="endTime"
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

            </div>

            {dateError && (
              <p className="text-red-500 text-sm mb-4">
                {dateError}
              </p>
            )}

            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location}</p>
            )}

            <div className="relative mb-6">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                name="location"
                placeholder="Event Location"
                onChange={handleChange}
                className="pl-10 w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>

            <h3 className="font-semibold mb-3 dark:text-white">
              Detailed Schedule
            </h3>
          
            <div className="space-y-3">
              {form.schedule.map((item, index) => (
                <div key={index} className="flex flex-col gap-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                   {/* Show per-row errors */}
                  <div className="flex gap-3 text-red-500 text-sm">
                    {errors[`schedule_time_${index}`] && <p>{errors[`schedule_time_${index}`]}</p>}
                    {errors[`schedule_activity_${index}`] && <p>{errors[`schedule_activity_${index}`]}</p>}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-white dark:bg-gray-800">
                      
                      <input
                        type="time"
                        name="eventTime"
                        value={item.time}
                        onChange={(e) =>
                          handleScheduleChange(index, "time", e.target.value)
                        }
                        className="bg-transparent outline-none text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <input
                      type="text"
                      name="eventActivity"
                      placeholder="Activity"
                      value={item.activity}
                      onChange={(e) =>
                        handleScheduleChange(index, "activity", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>

                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addScheduleRow}
              className="mt-4 flex items-center gap-2 text-blue-600"
            >
              <Plus size={16} /> Add Schedule
            </button>
          </div>

          {/* ================= ADDITIONAL ================= */}
          {isPastEvent && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                Additional Details
              </h2>

              <input
                type="number"
                name="attendees"
                placeholder="Expected Attendees"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* ================= COMPETITIONS ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              Competitions
            </h2>

            {/* Global error */}
            {errors.competitions && (
              <p className="text-red-500 text-sm mb-2">{errors.competitions}</p>
            )}

            <div className="space-y-4">
              {form.competitions.map((comp, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl space-y-2"
                >
                  {/* Name error */}
                  {errors[`competition_name_${index}`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`competition_name_${index}`]}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Competition Name"
                    value={comp.name}
                    onChange={(e) =>
                      handleCompetitionChange(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                  />

                  {/* Type error */}
                  {errors[`competition_type_${index}`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`competition_type_${index}`]}
                    </p>
                  )}

                  <select
                    value={comp.type}
                    onChange={(e) =>
                      handleCompetitionChange(index, "type", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Competition Type</option>
                    {competitionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeCompetition(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCompetition}
              className="mt-4 flex items-center gap-2 text-blue-600"
            >
              <Plus size={16} /> Add Competition
            </button>
          </div>

          {/* ================= IMAGE ================= */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 dark:text-white">
              <Image className="w-5 h-5" /> Event Image
            </h2>

            {/* ✅ NEW IMAGE UI */}
            <label
              className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl h-56 cursor-pointer overflow-hidden group hover:border-blue-500 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setForm((prev) => ({ ...prev, image: file }));
                  const reader = new FileReader();
                  reader.onloadend = () => setPreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            >
              {!preview && (
                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <Image className="w-10 h-10 mb-2 opacity-70" />
                  <p className="text-sm">Click to upload or drag image</p>
                </div>
              )}

              {preview && (
                <>
                  <img
                    src={preview}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="preview"
                  />
                  <div className="absolute inset-0 bg-black/40 dark:bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <p className="text-white dark:text-gray-900 text-sm">Change Image</p>
                  </div>
                </>
              )}

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="flex sticky bottom-0 bg-white dark:bg-gray-900 py-4 gap-4 mt-6 px-6">
            <button
               onClick={() => navigate(-1)} 
              className="w-1/4 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:text-black dark:hover:bg-gray-600 py-3 rounded-xl text-lg font-semibold shadow-lg">
              Cancel
            </button>
            <button className="w-3/4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg">
              Create Event
            </button>
          </div>

        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full text-center">
            <p className="text-gray-900 dark:text-white mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDurationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full text-center">
            <p className="text-gray-900 dark:text-white mb-4">
              Event Duration: {duration}
            </p>
            <button
              onClick={() => setShowDurationModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}