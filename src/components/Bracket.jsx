// components/Bracket.jsx

export default function Bracket({ matches }) {
  // Group matches into rounds (basic logic)
  const rounds = [];

  let currentRound = [...matches];

  while (currentRound.length > 0) {
    rounds.push(currentRound);
    currentRound = currentRound.slice(0, Math.ceil(currentRound.length / 2));
  }

  return (
    <div className="flex gap-6 overflow-x-auto p-4">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="flex flex-col gap-6">
          <h3 className="text-center font-semibold dark:text-white">
            Round {roundIndex + 1}
          </h3>

          {round.map((match, idx) => (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow min-w-[150px]"
            >
              <p className="text-sm font-medium dark:text-white">
                {match.player1 || "TBD"}
              </p>
              <p className="text-sm font-medium dark:text-white">
                {match.player2 || "TBD"}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}