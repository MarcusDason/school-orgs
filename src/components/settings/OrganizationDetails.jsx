import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBullseye, FaPen } from "react-icons/fa";
import { db, auth } from "../../firebase/config";
import { ref, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function OrganizationDetails({ org, onSave, userCanManage }) {
  const [name, setName] = useState(org?.name || "");
  const [description, setDescription] = useState(org?.description || "");
  const [mission, setMission] = useState(org?.mission || "");
  const [image, setImage] = useState(org?.image || "");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!org) return;
    setName(org.name || "");
    setDescription(org.description || "");
    setMission(org.mission || "");
    setImage(org.image || "");
  }, [org]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !userCanManage) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imageUrl = image;

      if (file) {
        const storage = getStorage();
        const storageReference = storageRef(storage, `organization_images/${org.id}-${Date.now()}`);
        await uploadBytes(storageReference, file);
        imageUrl = await getDownloadURL(storageReference);
      }

      const updatedData = {
        name,
        description,
        mission,
        image: imageUrl,
      };

      await update(ref(db, `organizations/${org.id}`), updatedData);
      onSave?.(updatedData);
      setImage(updatedData.image);
      setPreview(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* IMAGE */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 object-cover rounded-lg border overflow-hidden">
          <img src={preview || image} alt="Organization" className="w-full h-full object-cover" />
        </div>
        {userCanManage && (
          <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded dark:bg-gray-700 dark:text-white" />
        )}
      </div>

      {/* NAME */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold dark:text-white">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      </div>

      {/* DESCRIPTION */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold dark:text-white">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      </div>

      {/* MISSION */}
      <div className="mb-4 flex items-start gap-3">
        <FaBullseye className="text-blue-600 dark:text-blue-400 text-2xl mt-1" />
        <div className="flex-1">
          <label className="block mb-1 font-semibold dark:text-white">Mission</label>
          <textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
        </div>
      </div>

      {/* DATE FOUNDED */}
      <div className="flex items-center gap-2 mb-6 text-gray-700 dark:text-gray-300">
        <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
        <span>
          Founded{" "}
          {org.dateAdded
            ? new Date(org.dateAdded).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "Unknown"}
        </span>
      </div>

      {userCanManage && (
        <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2">
          <FaPen /> {loading ? "Saving..." : "Save Settings"}
        </button>
      )}
    </div>
  );
}