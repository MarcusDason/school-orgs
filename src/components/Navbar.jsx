import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  Moon,
  Sun,
  Building2,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Navbar({ darkMode, setDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  const navigate = useNavigate();

  useEffect(() => {
    if (menuRef.current) {
      setMaxHeight(isOpen ? `${menuRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 py-2 px-4 md:py-2 md:px-3 rounded-lg transition-colors
     ${
       isActive
         ? "bg-blue-600 text-white"
         : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
     }`;

  return (
    <nav className="sticky top-0 z-50 p-4 flex items-center justify-between relative bg-white dark:bg-gray-800 shadow-md">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Building2 className="dark:text-white text-black" />
        <h1 className="font-bold text-2xl px-2 text-gray-800 dark:text-white">
          School Orgs
        </h1>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/organizations" className={linkClass}>
          <Users size={20} />
          Organizations
        </NavLink>

        {/* 🌙 Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* 🚪 Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Mobile Icons */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} />
          )}
        </button>

        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X size={24} className="text-black dark:text-white" />
          ) : (
            <Menu size={24} className="text-black dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        style={{ maxHeight }}
        className="absolute top-full left-0 w-full overflow-hidden transition-[max-height] duration-300 bg-white dark:bg-gray-800 md:hidden"
      >
        <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/organizations"
          className={linkClass}
          onClick={() => setIsOpen(false)}
        >
          <Users size={20} />
          Organizations
        </NavLink>

        {/* Logout Mobile */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 py-2 px-4 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}