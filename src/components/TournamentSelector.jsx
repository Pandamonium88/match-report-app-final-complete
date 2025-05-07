// src/components/TournamentSelector.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function TournamentSelector({ onSelect }) {
  const [tournaments, setTournaments] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const loadTournaments = async () => {
      const snapshot = await getDocs(collection(db, "tournaments"));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(all);
      const active = all.find(t => t.isActive);
      if (active) {
        setActiveId(active.id);
        if (onSelect) onSelect(active.id);
      }
    };
    loadTournaments();
  }, []);

  return (
    <select
      value={activeId}
      onChange={(e) => {
        setActiveId(e.target.value);
        if (onSelect) onSelect(e.target.value);
      }}
      className="p-2 border rounded dark:bg-gray-800 dark:text-white"
    >
      {tournaments.map(t => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}