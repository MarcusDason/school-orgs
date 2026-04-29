import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { ref, onValue, off, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  CheckCircle,
  ImagePlus,
  X,
  FilePlus,
  Download
} from "lucide-react";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [role, setRole] = useState("user");

  const [newStep, setNewStep] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");

  const [stepImages, setStepImages] = useState({});

  const [toast, setToast] = useState("");
  const [zoomImage, setZoomImage] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snap) => {
          if (snap.exists()) {
            setRole(snap.val().role || "user");
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const serviceRef = ref(db, `services/${id}`);

    const unsubscribe = onValue(serviceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setService(data);
        setStepImages(data.stepImages || {});
      } else {
        setService({
          title: "Service not found",
          steps: [],
        });
      }
    });

    return () => off(serviceRef);
  }, [id]);

  const handleStepImage = (file, index) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const updated = {
        ...(stepImages || {}),
        [index]: reader.result,
      };

      await update(ref(db, `services/${id}`), {
        stepImages: updated,
      });

      setStepImages(updated);
      showToast("Image attached successfully!");
    };

    reader.readAsDataURL(file);
  };

  const handleAddStep = async () => {
    if (!newStep.trim()) return;

    const updated = [...(service.steps || []), newStep];

    await update(ref(db, `services/${id}`), {
      steps: updated,
    });

    setNewStep("");
    showToast("Step added successfully!");
  };

  const handleDeleteStep = async (index) => {
    const updatedSteps = service.steps.filter((_, i) => i !== index);

    const updatedImages = { ...(stepImages || {}) };
    delete updatedImages[index];

    const reindexedImages = {};
    Object.keys(updatedImages).forEach((key) => {
        const numKey = parseInt(key);

        if (numKey < index) {
        reindexedImages[numKey] = updatedImages[numKey];
        } else {
        reindexedImages[numKey - 1] = updatedImages[numKey];
        }
    });

    await update(ref(db, `services/${id}`), {
        steps: updatedSteps,
        stepImages: reindexedImages,
    });

    setStepImages(reindexedImages);

    showToast("Step deleted successfully!");
    };

  const handleSaveEdit = async (index) => {
    const updated = [...service.steps];
    updated[index] = editedText;

    await update(ref(db, `services/${id}`), {
      steps: updated,
    });

    setEditingIndex(null);
    showToast("Step updated successfully!");
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleStepFile = (file, index) => {
    if (!file) return;

    // ❌ SIZE CHECK FIRST
    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large! Max allowed is 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const rawFiles = service.stepFiles?.[index];

      const existingFiles = Array.isArray(rawFiles)
        ? rawFiles
        : rawFiles
        ? [rawFiles]
        : [];

      const updated = {
        ...(service.stepFiles || {}),
        [index]: [
          ...existingFiles,
          {
            name: file.name,
            data: reader.result,
          },
        ],
      };

      await update(ref(db, `services/${id}`), {
        stepFiles: updated,
      });

      showToast("File added!");
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteFile = async (stepIndex, fileIndex) => {
    const rawFiles = service.stepFiles?.[stepIndex];

    const files = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles
      ? [rawFiles]
      : [];

    const updatedFiles = files.filter((_, i) => i !== fileIndex);

    const updated = {
      ...(service.stepFiles || {}),
      [stepIndex]: updatedFiles,
    };

    await update(ref(db, `services/${id}`), {
      stepFiles: updated,
    });

    showToast("File deleted!");
  };

  const handleReplaceFile = (file, stepIndex, fileIndex) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const raw = service.stepFiles?.[stepIndex];

      const files = Array.isArray(raw)
        ? raw
        : raw
        ? [raw]
        : [];

      const updatedFiles = [...files];

      updatedFiles[fileIndex] = {
        name: file.name,
        data: reader.result,
      };

      const updated = {
        ...(service.stepFiles || {}),
        [stepIndex]: updatedFiles,
      };

      await update(ref(db, `services/${id}`), {
        stepFiles: updated,
      });

      showToast("File replaced!");
    };

    reader.readAsDataURL(file);
  };

  if (!service) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto text-gray-800 dark:text-white relative">

        {/* TOAST */}
        {toast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl shadow-2xl text-center">
              <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
              <p className="text-lg font-semibold">{toast}</p>
            </div>
          </div>
        )}

        {/* BACK */}
        <button
          onClick={() => navigate("/services")}
          className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Services
        </button>

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold">{service.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Step-by-step procedure guide
          </p>
        </div>

        {/* ADD STEP */}
        {role === "admin" && (
          <div className="mb-8 flex gap-3">
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add new step..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleAddStep}
              className="bg-blue-600 text-white px-5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        )}

        {/* STEPS */}
        <div className="space-y-6 pl-6">

          {service.steps?.map((step, index) => (
            <div key={index} className="relative group">

              {/* NUMBER */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white text-sm flex items-center justify-center rounded-full shadow-lg border-2 border-gray-200  dark:border-gray-900">
                    {index + 1}
                </div>

              {/* CARD */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700">

                {/* IMAGE */}
                {stepImages[index] && (
                    <div className="flex justify-center mb-4">
                        <img
                            src={stepImages[index]}
                            onClick={() => setZoomImage(stepImages[index])}
                            className="w-full max-w-sm max-h-64 object-contain rounded-xl bg-gray-100 dark:bg-gray-700 p-2 shadow-sm cursor-zoom-in"
                        />
                    </div>
                )}

                {(Array.isArray(service.stepFiles?.[index])
                    ? service.stepFiles[index]
                    : service.stepFiles?.[index]
                    ? [service.stepFiles[index]]
                    : []
                  ).map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center justify-between mt-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg"
                    >
                      {/* FILE NAME */}
                      <span className="text-sm truncate max-w-[50%]">
                        {file.name}
                      </span>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-3">

                        {/* DOWNLOAD */}
                        <a
                          href={file.data}
                          download={file.name}
                          className="flex items-center gap-1 text-black text-sm dark:text-white hover:text-white dark:hover:text-white-300 transition"
                        >
                          <Download size={16} />
                        </a>

                        {/* REPLACE */}
                        {role === "admin" && (
                          <label className="cursor-pointer text-black hover:text-yellow-700 transition dark:text-white dark:hover:text-yellow-500 flex items-center gap-1">
                            <Pencil size={16} />
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                handleReplaceFile(e.target.files[0], index, fileIndex)
                              }
                            />
                          </label>
                        )}

                        {/* DELETE */}
                        {role === "admin" && (
                          <button
                            onClick={() => handleDeleteFile(index, fileIndex)}
                            className="text-black hover:text-red-700 transition dark:text-white dark:hover:text-red-500 flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      </div>
                    </div>
                  ))
                }

                {/* TEXT */}
                {editingIndex === index ? (
                  <input
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full border-b bg-transparent outline-none text-lg"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-200 text-lg">
                    {step}
                  </p>
                )}

                {/* ACTIONS */}
                {role === "admin" && (
                  <div className="flex items-center gap-4 mt-4 opacity-90">

                    {editingIndex === index ? (
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="text-green-500 font-medium"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingIndex(index);
                          setEditedText(step);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteStep(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* IMAGE UPLOAD ICON ONLY */}
                    <label className="text-purple-600 hover:text-purple-800 cursor-pointer">
                        <ImagePlus size={18} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                            handleStepImage(e.target.files[0], index)
                            }
                        />
                    </label>
                    
                    {/* FILE UPLOAD ICON ONLY */}
                    <label className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                      <FilePlus size={18} />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleStepFile(e.target.files[0], index)
                        }
                      />
                    </label>

                  </div>
                )}

              </div>
            </div>
          ))}

        </div>
      </div>

        {/* IMAGE ZOOM MODAL */}
        {zoomImage && (
            <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setZoomImage(null)}
            >
                {/* CLOSE BUTTON */}
                <button
                onClick={() => setZoomImage(null)}
                className="absolute top-5 right-5 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition"
                >
                <X size={22} />
                </button>

                {/* IMAGE */}
                <img
                src={zoomImage}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                />
            </div>
            )}

    </div>
  );
}