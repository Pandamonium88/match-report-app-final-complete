import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTournament } from "../context/TournamentContext";
import dayjs from "dayjs";

export default function Agenda() {
  const { user } = useAuth();
  const { currentTournament } = useTournament();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        // Must have tournament and user
        if (!currentTournament?.id || !user?.uid) {
          setMatches([]);
          setLoading(false);
          return;
        }

// Base query: only this umpire’s matches by full name
const umpireName = user.displayName;  // assumes you set displayName to "First Last"
let q = query(
  collection(db, `tournaments/${currentTournament.id}/matches`),
  where("umpire", "==", umpireName)
);

        // Date-from filter
        if (filters.dateFrom) {
          const fromDate = dayjs(filters.dateFrom).startOf("day").toDate();
          q = query(q, where("date", ">=", Timestamp.fromDate(fromDate)));
        }

        // Date-to filter
        if (filters.dateTo) {
          const toDate = dayjs(filters.dateTo).endOf("day").toDate();
          q = query(q, where("date", "<=", Timestamp.fromDate(toDate)));
        }

        // Always sort by date; we’ll handle time sorting client-side
        q = query(q, orderBy("date"));

        const snap = await getDocs(q);
        let result = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // convert timestamp to JS Date for formatting
            date: data.date instanceof Timestamp
              ? data.date.toDate()
              : data.date
          };
        });
        // Client-side sort by time string (HH:mm)
        result.sort((a, b) => a.time.localeCompare(b.time));
        setMatches(result);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [
    currentTournament?.id,
    user?.uid,
    filters.dateFrom,
    filters.dateTo
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ dateFrom: "", dateTo: "" });
  };

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-700 dark:text-gray-300">
          Loading your assigned matches...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-black dark:text-white">
        Your Umpiring Assignments
      </h1>

      {currentTournament && (
        <h2 className="text-lg mb-4 dark:text-gray-300">
          Tournament: {currentTournament.name}
        </h2>
      )}

      {/* Filter Section */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">
          Filter Assignments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">
              From Date
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">
              To Date
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            {filters.dateFrom || filters.dateTo
              ? "No assigned matches found for the selected date range."
              : "You currently have no umpiring assignments for this tournament."}
          </p>
          {(filters.dateFrom || filters.dateTo) && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Assignments
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li
              key={match.id}
              className="border rounded-lg p-4 bg-white dark:bg-gray-700 shadow hover:shadow-md transition-shadow"
            >
              <div className="text-md font-semibold dark:text-white">
                {dayjs(match.date).format("dddd, MMM D")} at {match.time}
              </div>
              <div className="text-sm dark:text-gray-300 mt-2 space-y-1">
                <div>
                  <span className="font-medium">Division:</span> {match.division}
                </div>
                <div>
                  <span className="font-medium">Match:</span> {match.home} vs {match.away}
                </div>
                <div>
                  <span className="font-medium">Court:</span> {match.court || "TBD"}
                </div>
                {match.venue && (
                  <div>
                    <span className="font-medium">Venue:</span> {match.venue}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}