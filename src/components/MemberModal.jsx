import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { loadModels, detectFace } from "../utils/detectIfPersonImage";

export default function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  editingMember,
  isEditMode,
  members,
}) {
  const [newMember, setNewMember] = useState({
    fullName: "",
    position: "Member",
    profilePic: "",
  });

  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && editingMember) {
      setNewMember({
        fullName: editingMember.fullName,
        position: editingMember.position,
        profilePic: editingMember.profilePic,
      });
    } else {
      setNewMember({ fullName: "", position: "Member", profilePic: "" });
    }
  }, [isEditMode, editingMember, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      setIsImageProcessing(true);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      });

      const img = document.createElement("img");
      img.src = URL.createObjectURL(compressedFile);

      await new Promise((resolve) => (img.onload = resolve));

      await loadModels();
      const detections = await detectFace(img);

      if (detections.length === 0) {
        alert("No human face detected.");
        setIsImageProcessing(false);
        return;
      }

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });

      setNewMember((prev) => ({ ...prev, profilePic: base64 }));
    } catch (err) {
      console.error("Image error:", err);
    } finally {
      setIsImageProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!newMember.fullName.trim()) return;
    if (isImageProcessing) {
      alert("Please wait, image is still processing.");
      return;
    }
    if (isSubmitting) return; // prevent double submit

    try {
      setIsSubmitting(true);
      await onSubmit(newMember);
      // Reset newMember if not editing
      if (!isEditMode) {
        setNewMember({ fullName: "", position: "Member", profilePic: "" });
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {isEditMode ? "Edit Member" : "Add Member"}
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={newMember.fullName}
          onChange={(e) =>
            setNewMember({ ...newMember, fullName: e.target.value })
          }
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
        />

        <div className="mb-3 flex gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          {newMember.profilePic && (
            <img
              src={newMember.profilePic}
              alt="Preview"
              className="w-20 h-20 mt-2 object-cover border dark:border-gray-600"
            />
          )}
        </div>

        <select
          value={newMember.position}
          onChange={(e) =>
            setNewMember({ ...newMember, position: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select Position</option>
          <option
            disabled={
              members.some(
                (m) => m.position === "President" && m !== editingMember
              ) && newMember.position !== "President"
            }
          >
            President
          </option>
          <option
            disabled={
              members.some(
                (m) => m.position === "Vice President" && m !== editingMember
              ) && newMember.position !== "Vice President"
            }
          >
            Vice President
          </option>
          <option>Secretary</option>
          <option>Treasurer</option>
          <option>Member</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className={`px-3 py-1 bg-blue-600 text-white rounded ${
              isSubmitting || isImageProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting || isImageProcessing}
          >
            {isEditMode ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}