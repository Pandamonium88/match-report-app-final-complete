import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useTournament } from "../context/TournamentContext";
import dayjs from "dayjs";

// helper to map divisions to background colors
function getDivisionClass(division) {
  switch (division) {
    case 'MEN':
      return 'bg-blue-600';
    case 'WOMEN':
      return 'bg-pink-600';
    case '22/U Boys':
      return 'bg-green-600';
    case '22/U Girls':
      return 'bg-yellow-600';
    default:
      return 'bg-gray-700';
  }
}

export default function UmpireAppointments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);
  // fixed cell size and responsive font
  const cellDimensions = { width: '150px', height: '100px' };
  const responsiveFont = { fontSize: 'clamp(1rem, 1vw, 1rem)' };
  // header and time column height
  const headerDimensions = { width: '30px', height: '40px' };
  const {currentTournament, tournaments, setCurrentTournament } = useTournament();
  const [matches, setMatches] = useState([]);
  const [umpires, setUmpires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningUmpire, setAssigningUmpire] = useState(null);
  const [editingUmpire, setEditingUmpire] = useState(null);
  const [umpireEditForm, setUmpireEditForm] = useState({
    firstName: '',
    lastName: '',
    nickname: ''
  });
  const [filters, setFilters] = useState({
    division: '',
    dateFrom: '',
    dateTo: '',
    umpireStatus: ''
  });
  const [editingEnabled, setEditingEnabled] = useState(false);
  useEffect(() => {
    if (!currentTournament && tournaments.length > 0) {
      // Try to auto-select the first tournament if none is selected
      setCurrentTournament(tournaments[0]);
    }
  }, [tournaments, setCurrentTournament]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentTournament?.id) {
          setLoading(false);
          return;
        }

        let matchesQuery = collection(db, `tournaments/${currentTournament.id}/matches`);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          matchesQuery = query(matchesQuery, where("date", ">=", Timestamp.fromDate(fromDate)));
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesQuery = query(matchesQuery, where("date", "<=", Timestamp.fromDate(toDate)));
        }

        if (filters.division) {
          matchesQuery = query(matchesQuery, where("division", "==", filters.division));
        }

        if (filters.umpireStatus === 'assigned') {
          matchesQuery = query(matchesQuery, where("umpireId", "!=", ""));
        } else if (filters.umpireStatus === 'unassigned') {
          matchesQuery = query(matchesQuery, where("umpireId", "==", ""));
        }

        const [matchesSnapshot, umpiresSnapshot] = await Promise.all([
          getDocs(matchesQuery),
          getDocs(query(collection(db, "users"), where("role", "==", "umpire")))
        ]);

        const matchesData = matchesSnapshot.docs.map(doc => {
          const data = doc.data();
          let date;
          
          try {
            date = data.date?.toDate?.() || data.date;
            if (date instanceof Timestamp) date = date.toDate();
          } catch (e) {
            console.error("Error parsing date:", e);
            date = new Date();
          }

          return {
            id: doc.id,
            ...data,
            date,
            time: data.time || "00:00"
          };
        });

        const umpiresData = umpiresSnapshot.docs.map(doc => ({
          id: doc.id,
          firstName: doc.data().firstName || '',
          lastName: doc.data().lastName || '',
          nickname: doc.data().nickname || null,
          ...doc.data()
        }));

        setMatches(matchesData);
        setUmpires(umpiresData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTournament?.id, filters]);

  const handleAssignUmpire = async (matchId, umpireId) => {
    try {
      setAssigningUmpire(matchId);
      const umpire = umpires.find(u => u.id === umpireId);
      if (!umpire || !currentTournament?.id) return;

      const displayName = umpire.nickname || `${umpire.firstName} ${umpire.lastName}`;

      await updateDoc(
        doc(db, `tournaments/${currentTournament.id}/matches`, matchId),
        { umpire: displayName, umpireId: umpire.id }
      );

      setMatches(prev => 
        prev.map(m => 
          m.id === matchId 
            ? { ...m, umpire: displayName, umpireId: umpire.id } 
            : m
        )
      );
    } catch (err) {
      console.error("Error assigning umpire:", err);
      setError("Failed to assign umpire");
    } finally {
      setAssigningUmpire(null);
    }
  };

  // Modal form state for add/edit game
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    court: "",
    division: "",
    home: "",
    away: "",
  });

  // Open modal for add or edit game
  const handleAddGame = (date, time, court) => {
    setGameToEdit({
      id: null,
      date,
      time,
      court,
      division: "",
      home: "",
      away: "",
    });
    setEditForm({
      date: dayjs(date).format("YYYY-MM-DD"),
      time: time || "",
      court: court || "",
      division: "",
      home: "",
      away: "",
    });
    setModalOpen(true);
  };

  const handleEditGame = (match) => {
    setGameToEdit(match);
    setEditForm({
      date: dayjs(match.date).format("YYYY-MM-DD"),
      time: match.time || "",
      court: match.court || "",
      division: match.division || "",
      home: match.home || "",
      away: match.away || "",
    });
    setModalOpen(true);
  };

  // Save game (add or update)
  const handleSaveGame = async () => {
    if (!currentTournament?.id) return;
    try {
      if (gameToEdit && gameToEdit.id) {
        // Update existing
        const matchRef = doc(db, `tournaments/${currentTournament.id}/matches`, gameToEdit.id);
        await updateDoc(matchRef, {
          division: editForm.division,
          home: editForm.home,
          away: editForm.away,
          date: Timestamp.fromDate(new Date(editForm.date)),
          time: editForm.time,
          court: editForm.court,
        });
        setMatches(prev => prev.map(m =>
          m.id === gameToEdit.id
            ? { ...m,
                division: editForm.division,
                home: editForm.home,
                away: editForm.away,
                date: new Date(editForm.date),
                time: editForm.time,
                court: editForm.court,
              }
            : m
        ));
      } else {
        // Add new
        const newMatch = {
          date: Timestamp.fromDate(new Date(editForm.date)),
          time: editForm.time,
          court: editForm.court,
          division: editForm.division,
          home: editForm.home,
          away: editForm.away,
          umpire: "",
          umpireId: "",
        };
        const ref = await addDoc(
          collection(db, `tournaments/${currentTournament.id}/matches`),
          newMatch
        );
        setMatches(prev => [...prev, { id: ref.id, ...newMatch, date: new Date(editForm.date) }]);
      }
      setModalOpen(false);
      setGameToEdit(null);
    } catch (err) {
      console.error("Error saving game:", err);
      setError("Failed to save game");
    }
  };

  const handleEditUmpire = (umpire) => {
    setEditingUmpire(umpire);
    setUmpireEditForm({
      firstName: umpire.firstName,
      lastName: umpire.lastName,
      nickname: umpire.nickname || ''
    });
  };

  const handleUpdateUmpire = async () => {
    try {
      if (!editingUmpire) return;
      
      await updateDoc(doc(db, "users", editingUmpire.id), {
        firstName: umpireEditForm.firstName,
        lastName: umpireEditForm.lastName,
        nickname: umpireEditForm.nickname || null
      });

      setUmpires(prev => 
        prev.map(u => 
          u.id === editingUmpire.id 
            ? { 
                ...u, 
                firstName: umpireEditForm.firstName,
                lastName: umpireEditForm.lastName,
                nickname: umpireEditForm.nickname || null
              } 
            : u
        )
      );
      
      setEditingUmpire(null);
    } catch (err) {
      console.error("Error updating umpire:", err);
      setError("Failed to update umpire");
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      division: '',
      dateFrom: '',
      dateTo: '',
      umpireStatus: ''
    });
  };

  if (loading && currentTournament) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-gray-800">
        <div className="text-black dark:text-white">Loading matches for {currentTournament.name}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-200 dark:bg-red-900 rounded text-black dark:text-white">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-white text-red-900 rounded"
        >
          Retry
        </button>
      </div>
    );
  }


  const divisions = [...new Set(matches.map(match => match.division))];


  // build a global, sorted list of all courts in this tournament
  const allCourts = Array.from(
    new Set(matches.map(m => m.court).filter(Boolean))
  ).sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] || '0', 20);
    const nb = parseInt(b.match(/\d+/)?.[0] || '0', 20);
    return na - nb;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <label className="text-white mr-2">Current Tournament:</label>
        <select
          className="p-2 rounded bg-white text-black"
          value={currentTournament?.id || ""}
          onChange={e => {
            const sel = tournaments.find(t => t.id === e.target.value);
            setCurrentTournament(sel);
          }}
        >
          <option value="">Select...</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl underline font-bold text-white">
          Umpire Appointments for {currentTournament?.name || "No Tournament Selected"}
        </h2>
        <button
          onClick={() => setEditingEnabled(prev => !prev)}
          className={`px-4 py-2 rounded text-white ${editingEnabled ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {editingEnabled ? 'Done Editing' : 'Edit Umpires'}
        </button>
      </div>


      {/* Filter Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Match Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Division</label>
            <select
              name="division"
              value={filters.division}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-white text-black"
            >
              <option value="">All Divisions</option>
              {divisions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white text-sm mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Umpire Status</label>
            <select
              name="umpireStatus"
              value={filters.umpireStatus}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-white text-black"
            >
              <option value="">All</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-white">
          <p>No matches found matching your criteria.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {Object.entries(
            matches.reduce((acc, match) => {
              const dateKey = dayjs(match.date).format("YYYY-MM-DD");
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(match);
              return acc;
            }, {})
          )
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, dateMatches]) => {
              // Use the global allCourts list for all dates
              const courts = allCourts;
              const times = [...new Set(dateMatches.map(m => m.time))].sort();
              return (
                <div key={date} className="mb-8">
                  <div className="bg-gray-100 p-3 rounded-t-lg dark:bg-gray-700">
                    <h3 className="text-xl font-semibold text-white dark:text-white">
                      {dayjs(date).format("dddd, D MMMM YYYY")}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto bg-white dark:bg-gray-800 rounded-lg">
                      <thead>
                        <tr>
                          <th
                            className="p-3 text-black dark:text-white font-medium text-center"
                            style={headerDimensions}
                          >
                            Time
                          </th>
                          {courts.map((court) => (
                            <th
                              key={court}
                              className="p-3 text-black dark:text-white font-medium text-center"
                              style={headerDimensions}
                            >
                              {court}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {times.map((time) => (
                          <tr key={time} className="border-t border-gray-700">
                            <td
                              className="p-3 text-black dark:text-white font-medium text-center"
                              style={headerDimensions}
                            >
                              {time}
                            </td>
                            {courts.map((court) => {
                              const match = dateMatches.find(
                                (m) => m.time === time && m.court === court
                              );
                              return (
                                <td
                                  key={court}
                                  className="p-2 align-top"
                                  style={cellDimensions}
                                >
                                  <div
                                    className={`${getDivisionClass(match?.division)} p-2 rounded flex flex-col justify-between h-full w-full`}
                                    style={responsiveFont}
                                  >
                                    {match && (
                                      <div className="text-xs font-bold text-white mb-1">
                                        {match.division}
                                      </div>
                                    )}
                                    {match && (
                                      <div className="text-white text-lg font-semibold mb-1">
                                        {`${match.home || 'TBD'} vs ${match.away || 'TBD'}`}
                                      </div>
                                    )}
                                    {match && (
                                      <select
                                        className="w-full p-2 rounded bg-white text-black"
                                        value={match.umpireId || ""}
                                        onChange={(e) =>
                                          handleAssignUmpire(match.id, e.target.value)
                                        }
                                        disabled={!editingEnabled || assigningUmpire === match.id}
                                      >
                                        {assigningUmpire === match.id ? (
                                          <option>Assigning...</option>
                                        ) : (
                                          <>
                                            <option value="">
                                              {match.umpire || 'Select Umpire'}
                                            </option>
                                            {umpires.map((umpire) => (
                                              <option key={umpire.id} value={umpire.id}>
                                                {umpire.nickname ||
                                                  `${umpire.firstName} ${umpire.lastName}`}
                                              </option>
                                            ))}
                                          </>
                                        )}
                                      </select>
                                    )}
                                    {editingEnabled && (
                                      match ? (
                                        <button
                                          onClick={() => {
                                            setGameToEdit(match);
                                            setEditForm({
                                              date: dayjs(match.date).format("YYYY-MM-DD"),
                                              time: match.time || "",
                                              court: match.court || "",
                                              division: match.division || "",
                                              home: match.home || "",
                                              away: match.away || "",
                                            });
                                            setModalOpen(true);
                                          }}
                                          className="mt-1 text-xs text-white underline"
                                        >
                                          Edit Game
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setGameToEdit({
                                              id: null,
                                              date,
                                              time,
                                              court,
                                              division: "",
                                              home: "",
                                              away: "",
                                            });
                                            setEditForm({
                                              date: dayjs(date).format("YYYY-MM-DD"),
                                              time: time || "",
                                              court: court || "",
                                              division: "",
                                              home: "",
                                              away: "",
                                            });
                                            setModalOpen(true);
                                          }}
                                          className="mt-1 text-xs text-white underline"
                                        >
                                          Add Game
                                        </button>
                                      )
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
        </>
      )}
      {/* Modal for Add/Edit Game */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {gameToEdit && gameToEdit.id ? "Edit Game" : "Add Game"}
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveGame();
              }}
            >
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.date}
                  onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.time}
                  onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Court</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.court}
                  onChange={e => setEditForm(f => ({ ...f, court: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Division</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.division}
                  onChange={e => setEditForm(f => ({ ...f, division: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Home</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.home}
                  onChange={e => setEditForm(f => ({ ...f, home: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Away</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  value={editForm.away}
                  onChange={e => setEditForm(f => ({ ...f, away: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded"
                  onClick={() => {
                    setModalOpen(false);
                    setGameToEdit(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}