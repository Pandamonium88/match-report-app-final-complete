// AppShell.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children, role }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("theme") === "dark" || 
             (!localStorage.getItem("theme") && 
              window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen">
      <Sidebar role={role} darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
      <main className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}