import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db , auth} from "../firebase/config";
import { ref, onValue, off ,get} from "firebase/database";
import OrgCard from "../components/OrgCard";
import { Plus, CheckCircle } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

export default function Organizations() {
  const [role, setRole] = useState("user");

  const [orgs, setOrgs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}`));
        if (snapshot.exists()) {
          setRole(snapshot.val().role);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    }
  });

  return () => unsubscribe();
}, []);


  useEffect(() => {
    const orgRef = ref(db, "organizations");

    // ✅ Load cached (lightweight only)
    try {
      const cached = localStorage.getItem("orgs");
      if (cached) {
        setOrgs(JSON.parse(cached));
        setLoading(false);
      }
    } catch (err) {
      console.warn("Failed to read cache:", err);
    }

    setLoading(true);

    const unsubscribe = onValue(
      orgRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = Object.entries(snapshot.val()).map(
            ([id, value]) => ({
              id,
              ...value,
            })
          );

          setOrgs(data);

          // ✅ SAVE LIGHTWEIGHT VERSION ONLY
          try {
            const lightweightData = data.map((org) => ({
              id: org.id,
              name: org.name,
              members: org.members || 0,
              yearFounded: org.yearFounded || "Unknown",
              image: org.image || "", // ⚠️ must be URL, not base64
            }));

            localStorage.setItem(
              "orgs",
              JSON.stringify(lightweightData)
            );
          } catch (err) {
            console.warn("Storage full, skipping cache:", err);
          }
        } else {
          setOrgs([]);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching organizations:", error);
        setLoading(false);
      }
    );


  }, []);

  // ✅ Delete
  const handleDeleteOrg = (deletedOrgId) => {
    setOrgs((prev) =>
      prev.filter((org) => org.id !== deletedOrgId)
    );
    setSuccessMsg("Organization deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 1000);
  };

  // ✅ Update
  const handleUpdateOrg = async (updatedOrg) => {
    setUpdateLoading(true);

    try {
      setOrgs((prev) =>
        prev.map((org) =>
          org.id === updatedOrg.id ? updatedOrg : org
        )
      );

      setSuccessMsg(
        `Organization "${updatedOrg.name}" updated successfully!`
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to update organization:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // ✅ Categories
  const categories = [
    "All",
    ...Array.from(
      new Set(orgs.map((org) => org.name).filter(Boolean))
    ),
  ];

  // ✅ Filter
  const filteredOrgs =
    selectedCategory === "All"
      ? orgs
      : orgs.filter((org) => org.name === selectedCategory);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      {/* ✅ Success Modal */}
      {successMsg && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-xl p-8 text-center font-semibold text-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            {successMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold mb-2 mt-3 dark:text-white">
          All Organizations
        </h1>
        {role === "admin" && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center"
            onClick={() => navigate("/add-organization")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Organization
            
          </button>
        )}
      </div>

      <p className="mb-7 text-gray-600 dark:text-gray-300">
        Browse and explore all school organizations
      </p>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full border transition
              ${
                selectedCategory === category
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        // ✅ Skeleton Loader
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-40 bg-gray-300 dark:bg-gray-700 rounded-xl"
            />
          ))}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300 mt-10">
          No organizations found.
        </p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrgs.map((org, index) => (
            <OrgCard
              key={org.id}
              index={index}
              org={{
                ...org,
                yearFounded: org.yearFounded || "Unknown",
                members: org.members || 0,
              }}
                onDelete={role === "admin" ? handleDeleteOrg : null}
                onUpdate={role === "admin" ? handleUpdateOrg : null}
            />
          ))}
        </div>
      )}

      {/* Update Loader */}
      {updateLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
        </div>
      )}
    </div>
  );
}