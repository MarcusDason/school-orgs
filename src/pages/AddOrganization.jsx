import { useState } from "react";
import { db } from "../firebase/config";
import { ref, push, set } from "firebase/database";
import imageCompression from "browser-image-compression";
import { Upload, User, Users, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { loadModels, detectFace } from "../utils/detectIfPersonImage";


export default function AddOrganization() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [memberName, setMemberName] = useState("");
  const [memberPosition, setMemberPosition] = useState("");
  const [memberPic, setMemberPic] = useState(null);
  const [memberPreview, setMemberPreview] = useState(null);

  const [members, setMembers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImage = async (e, setFile, setPreview, { detectPerson = false } = {}) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
        const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 300,
        useWebWorker: true,
        });

        if (detectPerson) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(compressedFile);

        await new Promise((resolve) => (img.onload = resolve));

        await loadModels();
        const detections = await detectFace(img);

        if (detections.length === 0) {
            alert("No human face detected.");
            return;
        }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
        setFile(compressedFile);
        setPreview(reader.result);
        };

        reader.readAsDataURL(compressedFile);
    } catch (err) {
        console.error("Image processing error:", err);
    }
    };

  const handleAddMember = () => {
    if (!memberName || !memberPosition || (!memberPic && !memberPreview)) {
      return alert("All member fields required");
    }

    const newMember = {
      fullName: memberName,
      position: memberPosition,
      profilePic: memberPreview,
    };

    if (editIndex !== null) {
      const updated = [...members];
      updated[editIndex] = newMember;
      setMembers(updated);
      setEditIndex(null);
    } else {
      setMembers([...members, newMember]);
    }

    setMemberName("");
    setMemberPosition("");
    setMemberPic(null);
    setMemberPreview(null);
  };

  const handleEditMember = (index) => {
    const m = members[index];
    setMemberName(m.fullName);
    setMemberPosition(m.position);
    setMemberPreview(m.profilePic);
    setMemberPic(null);
    setEditIndex(index);
  };

  const handleDeleteMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);

    if (editIndex === index) {
      setMemberName("");
      setMemberPosition("");
      setMemberPic(null);
      setMemberPreview(null);
      setEditIndex(null);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !logoPreview) {
        return alert("All organization fields required");
    }

    try {
        const orgRef = ref(db, "organizations");
        const newOrgRef = push(orgRef);

        const orgId = newOrgRef.key;

        let memberCount = 0;

        const membersRef = ref(db, "members");

        for (let m of members) {
        const newMemberRef = push(membersRef);

        await set(newMemberRef, {
            fullName: m.fullName,
            position: m.position,
            profilePic: m.profilePic,
            orgId: orgId,
        });

        memberCount++;
        }

        await set(newOrgRef, {
        name,
        description,
        image: logoPreview,
        members: memberCount,
        dateAdded: new Date().toISOString(),
        });

        setShowSuccess(true);

        setTimeout(() => {
        setShowSuccess(false);
        navigate("/organizations");
        }, 2000);

    } catch (err) {
        console.error("Error saving organization:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Organization Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" /> Organization Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Organization Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 border dark:border-gray-700 p-3 rounded-lg cursor-pointer bg-white dark:bg-gray-800">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e, setLogo, setLogoPreview)}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-start gap-2 mt-4 border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800">
            <ImageIcon className="w-5 h-5 text-gray-400 mt-1" />
            <textarea
              placeholder="Organization Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
            />
          </div>

          {/* Logo Preview styled like member preview */}
          <div className="flex justify-center mt-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">
                <ImageIcon />
              </div>
            )}
          </div>
        </div>

        {/* Members Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" /> Members
          </h2>

          <div className="grid md:grid-cols-2 gap-6 items-center">

            {/* Inputs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
                />
              </div>

              <select
                value={memberPosition}
                onChange={(e) => setMemberPosition(e.target.value)}
                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-lg"
              >
                <option value="">Select Position</option>

                {/* Unique Roles */}
                <option
                  disabled={members.some(m => m.position === "President") && memberPosition !== "President"}
                >President</option>

                <option
                  disabled={members.some(m => m.position === "Vice President") && memberPosition !== "Vice President"}
                >Vice President</option>

                {/* Non-unique roles */}
                <option>Secretary</option>
                <option>Treasurer</option>
                <option>Member</option>
              </select>

              <label className="flex items-center gap-2 border dark:border-gray-700 p-3 rounded-lg cursor-pointer bg-white dark:bg-gray-800">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Upload Profile</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                        handleImage(e, setMemberPic, setMemberPreview, {
                            detectPerson: true,
                        })
                    }
                  className="hidden"
                />
              </label>

              <button
                onClick={handleAddMember}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                <User className="w-5 h-5" />
                {editIndex !== null ? "Update Member" : "Add Member"}
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              {memberPreview ? (
                <img src={memberPreview} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700" />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">
                  <ImageIcon />
                </div>
              )}
            </div>
          </div>

          {/* Members List WITH DELETE */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {members.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              >
                <div
                  onClick={() => handleEditMember(i)}
                  className="flex items-center gap-4 cursor-pointer flex-1"
                >
                  <img src={m.profilePic} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{m.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.position}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMember(i)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold shadow"
        >
          <Save className="w-5 h-5" /> Save Organization
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-8 py-6 rounded-2xl shadow-xl text-center animate-fade-in">
            <div className="flex flex-col items-center gap-3">
                <Save className="w-10 h-10" />
                <h2 className="text-xl font-bold">Organization Saved!</h2>
                <p className="text-sm">Redirecting...</p>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}
