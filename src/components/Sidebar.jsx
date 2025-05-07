import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LogOut, Sun, Moon, CalendarCheck2, Calendar, ScrollText, Scroll,
  LucideGaugeCircle, Settings, Info, PersonStanding, HardDriveUpload,
  ChevronDown, ChevronUp
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Added missing import
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onToggleTheme, darkMode }) {
  const [open, setOpen] = useState(true); 
  const [adminOpen, setAdminOpen] = useState(false); // Added missing state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const { user, role } = useAuth();

  const commonLinks = [
    { label: "Dashboard", to: "/dashboard", icon: <LucideGaugeCircle size={20} /> },
    { label: "Agenda", to: "/agenda", icon: <Calendar size={20} /> },
    { label: "Match Report", to: "/match-report", icon: <ScrollText size={20} /> },
    { label: "Umpire Report", to: "/umpire-report", icon: <Scroll size={20} /> },
  ];

  const adminLinks = [
    { label: "Analytics", to: "/analytics", icon: <Info size={20} /> },
    { label: "Manage Users", to: "/admin/users", icon: <PersonStanding size={20} /> },
    { label: "Upload Draw", to: "/admin/upload", icon: <HardDriveUpload size={20} /> },
    { label: "Umpire Appointments", to: "/admin/appointments", icon: <CalendarCheck2 size={20} /> },
  ];

  const settingsLinks = [
    { label: "Tournament Admin", to: "/settings/tournamentadmin", icon: <Settings size={20} /> },
    { label: "My Details", to: "/settings/details", icon: <Moon size={20} /> },
  ];

  const renderLinks = (links) =>
    links.map((link) => (
      <li key={link.to}>
        <Link 
          to={link.to}
          className={`flex items-center gap-2 p-2 rounded transition-colors ${
            location.pathname === link.to
              ? "bg-green-700 text-white"
              : "hover:bg-green-100 dark:hover:bg-green-900"
          }`}
        >
          {link.icon}
          {open && <span>{link.label}</span>}
        </Link>
      </li>
    ));

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r dark:border-gray-700 transition-all ${open ? "w-64" : "w-16"}`}>
      <div className="flex items-center justify-center p-4">
        <img src="/logo.png" alt="Cricket Australia" className="h-30 object-contain" />
        {user && user.displayName && (
          <div className="text-center text-sm text-green-700 dark:text-green-300 font-semibold mb-2">
            Hello, {user.displayName}
          </div>
        )}
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 self-end mr-2 text-xs bg-green-600 text-white rounded"
      >
        {open ? "←" : "→"}
      </button>

      <ul className="space-y-1 p-2">{renderLinks(commonLinks)}</ul>

      {role === "admin" && (
        <>
          <div className="px-2">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex items-center justify-between w-full p-2 rounded bg-green-100 dark:bg-green-800"
            >
              <span className="flex items-center gap-2">
                <Settings size={20} />
                {open && "Admin"}
              </span>
              {open && (adminOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
          </div>
          {adminOpen && <ul className="space-y-1 px-2">{renderLinks(adminLinks)}</ul>}
        </>
      )}

      <div className="px-2 mt-4">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-between w-full p-2 rounded bg-green-100 dark:bg-green-800"
        >
          <span className="flex items-center gap-2">
            <Settings size={20} />
            {open && "Settings"}
          </span>
          {open && (settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>
      </div>
      {settingsOpen && <ul className="space-y-1 px-2">{renderLinks(settingsLinks)}</ul>}

      <div className="mt-auto mb-4 flex flex-col gap-2 items-center">
        <button onClick={onToggleTheme} className="p-2 hover:scale-110 text-green-600 dark:text-green-300">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => signOut(auth).then(() => (window.location.href = "/login"))}
          className="p-2 hover:scale-110 text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}