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
  const [globalBoard, setGlobalBoard] = useState([]);
  const [playerStats, setPlayerStats] = useState({ wins: 0, losses: 0, ties: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const storedName = Cookies.get("playerName");
    if (storedName) setName(storedName);
    fetchLeaderboard(db).then(setGlobalBoard);
  }, []);

  useEffect(() => {
    const found = globalBoard.find((entry) => entry.name === name);
    if (found) setPlayerStats(found);
  }, [globalBoard, name]);

  const updateLeaderboard = (winInc = 0, lossInc = 0, tieInc = 0) => {
    const updated = {
      name,
      wins: playerStats.wins + winInc,
      losses: playerStats.losses + lossInc,
      ties: playerStats.ties + tieInc,
    };
    setPlayerStats(updated);
    submitScore(db, name, winInc, lossInc, tieInc);
    fetchLeaderboard(db).then(setGlobalBoard);
  };

  const play = (choice) => {
    setUserChoice(choice);
    setComputerChoice(null);
    setResult("");
    setIsAnimating(true);

    let counter = 0;
    const animationSequence = [100, 150, 200, 250, 300, 400, 500, 600];

    const playAnimationStep = () => {
      const tempChoice = choices[Math.floor(Math.random() * 3)];
      setComputerChoice(tempChoice);
      counter++;
      if (counter < animationSequence.length) {
        setTimeout(playAnimationStep, animationSequence[counter]);
      } else {
        const finalChoice = choices[Math.floor(Math.random() * 3)];
        setComputerChoice(finalChoice);
        finalizeGame(choice, finalChoice);
        setIsAnimating(false);
      }
    };

    playAnimationStep();
  };

  const finalizeGame = (user, comp) => {
    if (!comp) return;

    if (user === comp) {
      setResult("It's a tie!");
      updateLeaderboard(0, 0, 1);
    } else if (
      (user === "rock" && comp === "scissors") ||
      (user === "paper" && comp === "rock") ||
      (user === "scissors" && comp === "paper")
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
        <h1 className="text-3xl font-bold mb-2 text-center">Play Rock, Paper, Scissors!</h1>
        <div className="text-4xl mb-4">🪨 📄 ✂️</div>
        <h2 className="text-xl font-semibold mb-2">Enter Your Name</h2>
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

  const { wins = 0, losses = 0, ties = 0 } = playerStats;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-2">Rock Paper Scissors</h1>
      <p className="mb-4">Welcome, <span className="font-semibold">{name}</span></p>

      <div className="flex space-x-4 mb-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => !isAnimating && play(choice)}
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

      <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800 mb-4">
        Switch Player
      </button>

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
    </div>
  );
}

