// src/context/TournamentContext.js

import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// 1. Create the Context
export const TournamentContext = createContext();

// 2. Provider Component
export function TournamentProvider({ children }) {
  const [tournaments, setTournaments] = useState([]);
  const [currentTournament, setCurrentTournament] = useState(null);

  useEffect(() => {
    // Listen to ALL tournaments, ordered by name
    const q = query(collection(db, "tournaments"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(all);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentTournament && tournaments.length > 0) {
      const activeOne = tournaments.find((t) => t.active === true);
      setCurrentTournament(activeOne || tournaments[0]);
    }
  }, [tournaments, currentTournament]);

  return (
    <TournamentContext.Provider
      value={{ tournaments, currentTournament, setCurrentTournament }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

// 3. Custom hook for easy consumption
export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error(
      "useTournament must be used within a TournamentProvider"
    );
  }
  return ctx;
}