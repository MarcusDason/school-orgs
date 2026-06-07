import { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase/config"; 
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { User } from "lucide-react";
import { uploadBytesResumable, getDownloadURL, ref as storageRef } from "firebase/storage"; 

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [profilePic, setProfilePic] = useState(null); 
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const navigate = useNavigate();

  // Fetch user info when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email);

      const userRef = ref(db, "users/" + currentUser.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        console.log("PROFILE DATA:", data); // DEBUG

        setName(data.fullName || "");
        setProfilePic(data.profilePic || null);
        setProfilePicPreview(data.profilePic || null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const storageReference = storageRef(storage, `profile_pics/${user.uid}`);

    const uploadTask = uploadBytesResumable(storageReference, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // You can monitor the upload progress here
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        console.log("UPLOADED IMAGE URL:", downloadURL);

        const userRef = ref(db, "users/" + user.uid);
        await update(userRef, {
          fullName: name,
          email: user.email,
          profilePic: downloadURL || "",
        });

        setProfilePicPreview(downloadURL);
        alert("Profile picture updated!");
      }
    );
  };

  const handleSave = async () => {
    if (isSaving) {
      // Prevent multiple clicks while saving
      return;
    }

    setIsSaving(true); // Set saving state to true

    if (user && name !== user.displayName) {
      try {
        console.log("Updating profile...");

        // Update the displayName in Firebase Authentication
        await updateProfile(user, { displayName: name });

        // Now update the fullName in Firebase Realtime Database
        const userRef = ref(db, "users/" + user.uid); // Reference to user's data in Realtime Database
        await update(userRef, {
          fullName: name,
          email: user.email,
          profilePic: profilePicPreview,
        });

        console.log("Profile updated successfully.");
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile.");
      } finally {
        setIsSaving(false); // Set saving state back to false
      }
    } else {
      setIsSaving(false); // If no changes are made, set saving state back to false
    }
  };

  const handleChangePassword = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setPasswordSuccess("");

    try {
      if (!currentPassword) {
        setCurrentPasswordError("Please enter your current password.");
        return;
      }

      if (newPassword.length < 6) {
        setNewPasswordError("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setConfirmPasswordError("Passwords do not match.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setPasswordSuccess("Password updated successfully!");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setCurrentPasswordError("Current password is incorrect.");
          break;

        case "auth/weak-password":
          setNewPasswordError("Password must be at least 6 characters.");
          break;

        default:
        setCurrentPasswordError(
          "Failed to update password. Please try again."
        );
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("USER:", user);
  console.log("PROFILE PIC:", profilePic);
  console.log("PREVIEW:", profilePicPreview);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Profile
        </h2>

        {/* Profile Details */}
        <div className="flex justify-center mt-4">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={name} // This will show the fetched name
              onChange={(e) => setName(e.target.value)} // Allow name change
              className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload} // Handle image upload
              className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">
            Change Password
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Current Password
              </label>

              {currentPasswordError && (
                <span className="text-red-500 text-xs font-medium">
                  {currentPasswordError}
                </span>
              )}
            </div>

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setCurrentPasswordError("");
                setPasswordSuccess("");
              }}
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </label>

              {newPasswordError && (
                <span className="text-red-500 text-xs font-medium">
                  {newPasswordError}
                </span>
              )}
            </div>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError("");
                setPasswordSuccess("");
              }}
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>

              {confirmPasswordError && (
                <span className="text-red-500 text-xs font-medium">
                  {confirmPasswordError}
                </span>
              )}
            </div>

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                setConfirmPasswordError("");
                setPasswordSuccess("");
              }}
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {passwordSuccess && (
            <p className="text-green-500 text-sm mb-3">
              {passwordSuccess}
            </p>
          )}

          <button
            onClick={handleChangePassword}
            className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
          >
            Change Password
          </button>
        </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving} // Disable the button if saving is in progress
            className={`w-full p-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}