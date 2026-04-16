import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import bgImage from "../assets/cvsu imus.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-cover bg-center relative px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        height: "calc(100vh - 80px)"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md 
                   bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
                   p-6 sm:p-8 rounded-xl shadow-lg"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center dark:text-white">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 rounded border text-sm sm:text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 sm:mb-6 p-2.5 sm:p-3 rounded border text-sm sm:text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-xs sm:text-sm mt-4 text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}