import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  HeartHandshake,
  GraduationCap,
  Activity,
  Stethoscope,
  Briefcase,
  Plus,
  Trash2,
} from "lucide-react";

import { db, auth } from "../firebase/config";
import { ref, onValue, push, set, get, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export default function Services() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [role, setRole] = useState("user");

  // =========================
  // GET USER ROLE
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await get(ref(db, `users/${user.uid}`));
        if (snap.exists()) {
          setRole(snap.val().role || "user");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // FETCH SERVICES
  // =========================
  useEffect(() => {
    const servicesRef = ref(db, "services");

    const unsubscribe = onValue(servicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, value]) => ({
          id,
          ...value,
        }));
        setServices(data);
      } else {
        setServices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // ADD SERVICE (ADMIN ONLY)
  // =========================
  const handleAddService = async () => {
    const name = prompt("Service title:");
    if (!name) return;

    const description = prompt("Service description:");
    if (!description) return;

    const newRef = push(ref(db, "services"));

    await set(newRef, {
      title: name,
      description,
      steps: [],
    });
  };

  // =========================
  // DELETE SERVICE (ADMIN ONLY)
  // =========================
  const deleteService = async (e, id) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) return;

    try {
      await remove(ref(db, `services/${id}`));
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  return (
    <div className="p-6 md:p-10 text-gray-800 dark:text-gray-100">

      {/* Header */}
      <div className="mb-10 text-center relative">
        <h1 className="text-4xl font-bold mb-2">
          Student Development Services
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Access support, programs, and opportunities designed for students
        </p>

        {/* ADMIN ADD BUTTON */}
        {role === "admin" && (
          <button
            onClick={handleAddService}
            className="absolute right-0 top-0 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Service
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => navigate(`/services/${service.id}`)}
            className="group relative cursor-pointer p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-blue-500"
          >
            {/* DELETE BUTTON (ADMIN ONLY) */}
            {role === "admin" && (
              <button
                onClick={(e) => deleteService(e, service.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}

            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
              {service.title}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {service.description}
            </p>
          </div>
        ))}
      </div>
      
    </div>
  );
}