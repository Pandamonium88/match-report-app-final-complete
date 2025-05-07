// TournamentAdmin.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import TournamentSelector from "./TournamentSelector";

export default function TournamentAdmin() {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "tournaments"), orderBy("created", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTournaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleAddTournament = async () => {
    if (!newTournament.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "tournaments"), {
        name: newTournament.trim(),
        created: new Date(),
        isActive: false
      });
      setNewTournament("");
    } catch (error) {
      console.error("Error adding tournament:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tournament Administration</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <input
            className="border p-2 rounded w-full dark:bg-gray-700 dark:border-gray-600"
            value={newTournament}
            onChange={(e) => setNewTournament(e.target.value)}
            placeholder="Enter new tournament name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTournament()}
          />
          <button 
            onClick={handleAddTournament} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>

        <TournamentSelector />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Tournaments</h3>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tournaments.map((t) => (
            <li key={t.id} className="py-3 flex justify-between items-center">
              <span>{t.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(t.created?.toDate?.() || t.created).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}