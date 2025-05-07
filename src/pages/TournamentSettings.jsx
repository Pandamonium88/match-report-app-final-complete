// src/pages/TournamentSettings.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";

export default function TournamentSettings() {
  const [name, setName] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    const snapshot = await getDocs(collection(db, "tournaments"));
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTournaments(all);
    const active = all.find(t => t.isActive);
    if (active) setActiveId(active.id);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const docRef = await addDoc(collection(db, "tournaments"), {
      name,
      isActive: false,
      createdAt: new Date()
    });
    setName("");
    fetchTournaments();
  };

  const setActiveTournament = async (id) => {
    const snapshot = await getDocs(collection(db, "tournaments"));
    const updates = snapshot.docs.map(docRef =>
      updateDoc(doc(db, "tournaments", docRef.id), {
        isActive: docRef.id === id
      })
    );
    await Promise.all(updates);
    setActiveId(id);
    fetchTournaments();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tournament Settings</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tournament name"
          className="border p-2 mr-2 bg-white dark:bg-gray-800 text-black dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded">
          Create Tournament
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Existing Tournaments</h3>
      <ul className="space-y-2">
        {tournaments.map(t => (
          <li key={t.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded">
            <span>{t.name}</span>
            <button
              onClick={() => setActiveTournament(t.id)}
              className={`px-3 py-1 rounded ${t.id === activeId ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              {t.id === activeId ? "Active" : "Set Active"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}