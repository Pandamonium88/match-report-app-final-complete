import { useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';

export default function TournamentAdmin() {
  const { tournaments, currentTournament, setCurrentTournament } = useTournament();

  const handleSetActive = async (tournamentId) => {
    const newActive = tournaments.find(t => t.id === tournamentId);
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      status: 'active',
      lastModified: new Date()
    });
    setCurrentTournament(newActive);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tournament Management</h2>
      <div className="space-y-2">
        {tournaments.map(t => (
          <div key={t.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span>
              {t.name} 
              {t.status === 'active' && (
                <span className="ml-2 text-green-600">(Active)</span>
              )}
            </span>
            <button
              onClick={() => handleSetActive(t.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded"
              disabled={t.status === 'active'}
            >
              {t.status === 'active' ? 'Active' : 'Set Active'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}