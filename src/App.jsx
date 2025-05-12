import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db, submitScore, fetchLeaderboard } from "./firebase";

const choices = ["rock", "paper", "scissors"];
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("");
  const [resultKey, setResultKey] = useState(0);
  const [leaderboard, setLeaderboard] = useState({});
  const [globalBoard, setGlobalBoard] = useState([]);

  useEffect(() => {
    const storedName = Cookies.get("playerName");
    const storedBoard = Cookies.get("leaderboard");
    if (storedName) setName(storedName);
    if (storedBoard) setLeaderboard(JSON.parse(storedBoard));

    // Load global leaderboard
    fetchLeaderboard(db).then(setGlobalBoard);
  }, []);

  const updateLeaderboard = (winInc = 0, lossInc = 0, tieInc = 0) => {
    const updated = {
      ...leaderboard,
      [name]: {
        wins: (leaderboard[name]?.wins || 0) + winInc,
        losses: (leaderboard[name]?.losses || 0) + lossInc,
        ties: (leaderboard[name]?.ties || 0) + tieInc,
      },
    };
    setLeaderboard(updated);
    Cookies.set("leaderboard", JSON.stringify(updated));

    submitScore(db, name, winInc, lossInc, tieInc);
    fetchLeaderboard(db).then(setGlobalBoard);
  };

  const play = (choice) => {
    const comp = choices[Math.floor(Math.random() * 3)];
    setUserChoice(choice);
    setComputerChoice(comp);

    if (choice === comp) {
      setResult("It's a tie!");
      updateLeaderboard(0, 0, 1);
    } else if (
      (choice === "rock" && comp === "scissors") ||
      (choice === "paper" && comp === "rock") ||
      (choice === "scissors" && comp === "paper")
    ) {
      setResult("You win!");
      updateLeaderboard(1, 0, 0);
    } else {
      setResult("You lose!");
      updateLeaderboard(0, 1, 0);
    }

    setResultKey(Date.now());
  };

  const saveName = () => {
    if (!nameInput.trim()) return;
    setName(nameInput.trim());
    Cookies.set("playerName", nameInput.trim());
  };

  const resetPlayer = () => {
    const updated = { ...leaderboard };
    delete updated[name];
    setLeaderboard(updated);
    Cookies.set("leaderboard", JSON.stringify(updated));
    setResult("");
    setUserChoice(null);
    setComputerChoice(null);
  };

  const resetLeaderboard = () => {
    setLeaderboard({});
    Cookies.remove("leaderboard");
  };

  const logout = () => {
    Cookies.remove("playerName");
    setName("");
    setUserChoice(null);
    setComputerChoice(null);
    setResult("");
  };

  const getIcon = (choice) => {
    switch (choice) {
      case "rock": return "🪨";
      case "paper": return "📄";
      case "scissors": return "✂️";
      default: return "";
    }
  };

  if (!name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <p className="text-xs text-yellow-400 mb-2">
          Firebase project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET'}
        </p>
        <h1 className="text-3xl font-bold mb-4">Enter Your Name</h1>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="px-4 py-2 text-black rounded mb-2"
          placeholder="Your name"
        />
        <button
          onClick={saveName}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Start Game
        </button>
      </div>
    );
  }

  const { wins = 0, losses = 0, ties = 0 } = leaderboard[name] || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <p className="text-xs text-yellow-400 mb-2">
        Firebase project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET'}
      </p>

      <h1 className="text-3xl font-bold mb-2">Rock Paper Scissors</h1>
      <p className="mb-4">Welcome, <span className="font-semibold">{name}</span></p>

      <div className="flex space-x-4 mb-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => play(choice)}
            className="bg-blue-600 px-6 py-3 rounded capitalize flex flex-col items-center w-24 h-24 justify-center space-y-1 transform transition-transform duration-200 hover:scale-110 hover:rotate-3 hover:shadow-lg"
          >
            <span className="text-2xl">{getIcon(choice)}</span>
            <span className="text-sm">{choice}</span>
          </button>
        ))}
      </div>

      {userChoice && computerChoice && (
        <div className="text-center mb-4">
          <p>
            You chose: <span className="text-2xl">{getIcon(userChoice)}</span> {capitalize(userChoice)}
          </p>
          <p>
            Computer chose: <span className="text-2xl">{getIcon(computerChoice)}</span> {capitalize(computerChoice)}
          </p>
          <p
            key={resultKey}
            className="mt-2 font-semibold text-xl opacity-0 scale-90 animate-fadeIn"
          >
            {result}
          </p>
        </div>
      )}

      <div className="text-center mb-4">
        <p>🏆 Wins: {wins}</p>
        <p>💥 Losses: {losses}</p>
        <p>🤝 Ties: {ties}</p>
      </div>

      <button onClick={resetPlayer} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 mb-2">
        Reset My Stats
      </button>

      <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800 mb-4">
        Switch Player
      </button>

      <h2 className="text-xl font-bold mt-6 mb-2">🏅 Local Leaderboard</h2>
      <ul className="mb-4">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => (b.wins - b.losses) - (a.wins - a.losses))
          .map(([player, score]) => (
            <li key={player} className="text-sm">
              {player}: {score.wins}W / {score.losses}L / {score.ties}T &nbsp;
              <span className="text-yellow-400 font-semibold">(Net: {score.wins - score.losses})</span>
            </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">🌍 Global Leaderboard</h2>
      <ul className="mb-4">
        {globalBoard.map((player) => (
          <li key={player.name} className="text-sm">
            {player.name}: {player.wins}W / {player.losses}L / {player.ties}T
            <span className="text-yellow-400 font-semibold ml-2">
              (Net: {player.wins - player.losses})
            </span>
          </li>
        ))}
      </ul>

      <button onClick={resetLeaderboard} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
        Reset Leaderboard
      </button>
    </div>
  );
}

