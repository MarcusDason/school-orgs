import { Plus, Trash2, Link } from "lucide-react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase/config";
import { useState } from "react";

export default function EventPhotos({ event, setEvent , userCanEdit}) {
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]); // { file, preview (base64) }
  const [postLink, setPostLink] = useState("");

  // DELETE PHOTO
  const handleDeletePhoto = async (indexToDelete) => {
    const updatedPhotos = (event.photos || []).filter(
      (_, index) => index !== indexToDelete
    );

    try {
      await update(ref(db, `events/${event.id}`), { photos: updatedPhotos });
      setEvent((prev) => ({ ...prev, photos: updatedPhotos }));
      setPhotoToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ADD FILES TO POST
  const addFiles = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotos((prev) => [...prev, { src: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // POST PHOTOS TO DATABASE
  const handlePostPhotos = async () => {
    if (!newPhotos.length) return;

    const uploaded = newPhotos.map((p) => ({ src: p.src, link: postLink }));
    const updatedPhotos = [...(event.photos || []), ...uploaded];

    try {
      await update(ref(db, `events/${event.id}`), { photos: updatedPhotos });
      setEvent((prev) => ({ ...prev, photos: updatedPhotos }));
      setNewPhotos([]);
      setPostLink("");
      setShowPostModal(false);
    } catch (err) {
      console.error("Post failed:", err);
    }
  };

  // SET LINK FOR EXISTING PHOTO
  const handleSetLink = async (index) => {
    const currentLink = event.photos[index]?.link || "";
    const newLink = prompt("Enter the URL for this photo:", currentLink);

    if (newLink !== null) {
      const updatedPhotos = [...(event.photos || [])];
      updatedPhotos[index] = { ...updatedPhotos[index], link: newLink };

      try {
        await update(ref(db, `events/${event.id}`), { photos: updatedPhotos });
        setEvent((prev) => ({ ...prev, photos: updatedPhotos }));
      } catch (err) {
        console.error("Update link failed:", err);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Event Photos</h2>
        {userCanEdit && (
        <button
          onClick={() => setShowPostModal(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
        )}
      </div>

      {/* PHOTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(event.photos || []).length > 0 ? (
          event.photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
            >
              {/* ICONS */}
              <div className="absolute top-1 right-1 z-10 flex gap-1">
                {userCanEdit && (
                  <button
                    onClick={() => setPhotoToDelete(index)}
                    className="bg-black/50 rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
                {userCanEdit && (
                  <button
                    onClick={() => handleSetLink(index)}
                    className="bg-black/50 rounded-full p-1 hover:bg-blue-600 transition"
                  >
                    <Link className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              <img
                src={photo.src}
                alt={`event-photo-${index}`}
                className="w-full h-full object-cover hover:scale-110 transition cursor-pointer"
                onClick={() => {
                  if (photo.link) window.open(photo.link, "_blank");
                }}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 col-span-4 text-center">
            No photos yet for this event.
          </p>
        )}
      </div>

      {/* POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 flex flex-col gap-4">
            {/* DROPZONE */}
            <div
              className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("postPhotoInput").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
            >
              <p className="text-gray-600 dark:text-gray-300">
                Drag & drop photos here or click to upload
              </p>
              <input
                type="file"
                id="postPhotoInput"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* LINK INPUT */}
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                placeholder="Add a link for this post (optional)"
                className="border p-2 rounded flex-1 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* PREVIEW */}
            {newPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {newPhotos.map((p, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
                  >
                    <img
                      src={p.src}
                      alt={`new-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setNewPhotos((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-red-500 p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setNewPhotos([]);
                  setPostLink("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handlePostPhotos}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {photoToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
            <h3 className="text-lg font-bold dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this photo?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePhoto(photoToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}