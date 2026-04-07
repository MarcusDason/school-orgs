import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { get, ref } from "firebase/database";

export default function CompetitionDetail() {
  const { orgId, eventId, compIndex } = useParams();
  const [competition, setCompetition] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompetition() {
      try {
        const snapshot = await get(ref(db, `organizations/${orgId}/events/${eventId}`));
        if (snapshot.exists()) {
          const event = snapshot.val();
          const comp = event.competitions ? event.competitions[compIndex] : null;
          setCompetition(comp || null);
          setPlayers(comp?.players || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompetition();
  }, [orgId, eventId, compIndex]);

  if (loading) return <p>Loading...</p>;
  if (!competition) return <p>Competition not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <Link to={`/organizations/${orgId}/events/${eventId}`} className="text-blue-600 hover:underline">← Back to Event</Link>

      <h1 className="text-3xl font-bold mt-4 text-white dark:text-white">{competition.name}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{competition.type || "Tournament"}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">Players</h2>
        {players.length > 0 ? (
          <ul className="space-y-2">
            {players.map((player, index) => (
              <li key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between">
                <span className="text-gray-900 dark:text-white">{player.name}</span>
                <span className="text-gray-600 dark:text-gray-300">{player.score ?? "-"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">No players yet.</p>
        )}
      </div>
    </div>
  );
}