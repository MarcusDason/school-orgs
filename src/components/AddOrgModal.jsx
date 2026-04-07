import { useState } from "react";
import { X, Building2, FileText, Users, Calendar, Image } from "lucide-react";
import { db } from "../firebase/config"; // make sure your RTDB config
import { ref, push } from "firebase/database"; // RTDB functions

export default function AddOrgModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    members: "",
    yearFounded: "",
    logo: null,
  });

  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      if (file && !file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setError("");
      setForm({ ...form, logo: file });

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

    if (form.logo && !form.logo.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    try {
      // Convert logo to base64 if uploaded
      let logoData = null;
      if (form.logo) {
        const reader = new FileReader();
        logoData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject("Error reading logo file");
          reader.readAsDataURL(form.logo);
        });
      }

      const newOrg = {
        ...form,
        logo: logoData,
        members: form.members ? Number(form.members) : 0,
      };

      const orgRef = ref(db, "organizations");
      const newOrgRef = await push(orgRef, newOrg);

      if (onAdd) onAdd({ id: newOrgRef.key, ...newOrg });

      resetForm();
    
    } catch (err) {
      console.error("Error adding organization: ", err);
      setError("Failed to add organization. Try again.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      members: "",
      yearFounded: "",
      logo: null,
    });
    setPreview(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-xl border border-gray-200 dark:border-gray-700">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5 dark:text-white" />
        </button>

        <h2 className="text-2xl font-bold mb-4 dark:text-white text-center">
          Add New Organization
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Organization Name */}
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Organization Name"
              value={form.name}
              onChange={handleChange}
              required
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Members */}
          <div className="relative">
            <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="members"
              placeholder="Members"
              value={form.members}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Founded Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="yearFounded"
              value={form.yearFounded}
              onChange={handleChange}
              className="pl-10 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="flex items-center gap-2 mb-1 font-medium dark:text-white">
              <Image className="w-5 h-5" />
              Organization Logo
            </label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            )}
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold mt-2"
          >
            Add Organization
          </button>

        </form>
      </div>
    </div>
  );
}