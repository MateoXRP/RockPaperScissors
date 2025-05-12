import { useState } from "react";

const choices = ["rock", "paper", "scissors"];

export default function App() {
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("");

  const play = (choice) => {
    const comp = choices[Math.floor(Math.random() * 3)];
    setUserChoice(choice);
    setComputerChoice(comp);

    if (choice === comp) setResult("It's a tie!");
    else if (
      (choice === "rock" && comp === "scissors") ||
      (choice === "paper" && comp === "rock") ||
      (choice === "scissors" && comp === "paper")
    ) setResult("You win!");
    else setResult("You lose!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Rock Paper Scissors</h1>
      <div className="space-x-4 mb-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => play(choice)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {choice}
          </button>
        ))}
      </div>
      {userChoice && computerChoice && (
        <div className="text-center">
          <p>You chose: {userChoice}</p>
          <p>Computer chose: {computerChoice}</p>
          <p className="mt-2 font-semibold text-xl">{result}</p>
        </div>
      )}
    </div>
  );
}

