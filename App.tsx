import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from './services/geminiService';
import { GameState, QuizQuestion } from './types';
import CharacterPanel from './components/CharacterPanel';
import QuizButton from './components/QuizButton';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Question State
  const [revealed, setRevealed] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startGame = async () => {
    setGameState(GameState.LOADING);
    try {
      const qs = await generateQuizQuestions();
      setQuestions(qs);
      setCurrentQIndex(0);
      setScore(0);
      resetQuestionState();
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Failed to load", error);
      // Even if failed, we might have fallback data from service
      setGameState(GameState.START);
    }
  };

  const resetQuestionState = () => {
    setRevealed(false);
    setSelectedOptionIndex(null);
    setFeedback(null);
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleAnswer = (index: number) => {
    if (selectedOptionIndex !== null) return; // Prevent double click

    setSelectedOptionIndex(index);
    const isCorrect = questions[currentQIndex].options[index].isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(questions[currentQIndex].feedbackCorrect);
    } else {
      setFeedback(questions[currentQIndex].feedbackIncorrect);
    }
  };

  const handleNext = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      // Game Over
      if (score === questions.length) {
        setGameState(GameState.GAME_OVER_WIN);
      } else {
        setGameState(GameState.GAME_OVER_LOSE);
      }
    }
  };

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black/80">
      <h1 className="mb-8 text-6xl font-black tracking-tighter text-red-600 uppercase drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse">
        Red Dwarf<br/>Recruitment
      </h1>
      <p className="max-w-md mb-8 text-xl text-red-200 font-mono border-l-4 border-red-600 pl-4 bg-black/50 p-4">
        "Listen up, you smeeeeeg heeeead! We need crew. Are you qualified to scrape the chicken soup nozzle? Prove it."
      </p>
      <QuizButton onClick={startGame} className="text-2xl px-12 py-6">
        Begin Interview
      </QuizButton>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 mb-4 border-4 border-t-red-500 border-r-transparent border-b-red-500 border-l-transparent rounded-full animate-spin"></div>
      <p className="text-xl text-red-400 blink">ACCESSING HOLLY'S DATABASE...</p>
    </div>
  );

  const renderPlaying = () => {
    const question = questions[currentQIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 border-b border-red-900 pb-2">
          <span className="text-red-500 font-bold">Q{currentQIndex + 1}/{questions.length}</span>
          <span className="text-red-500 font-bold">SCORE: {score}</span>
        </div>

        <CharacterPanel name={question.character} />

        {/* Question Box */}
        <div className="bg-gray-800/80 p-6 rounded border border-red-800 w-full mb-6 shadow-lg text-center min-h-[120px] flex items-center justify-center">
          <h2 className="text-2xl text-white font-medium">{question.questionText}</h2>
        </div>

        {/* Actions Area */}
        <div className="w-full space-y-4">
          {!revealed && (
            <div className="flex justify-center mt-8">
              <QuizButton onClick={handleReveal} variant="danger" className="w-full max-w-sm animate-bounce">
                Reveal Answers
              </QuizButton>
            </div>
          )}

          {revealed && (
            <div className="grid grid-cols-1 gap-4">
              {question.options.map((opt, idx) => {
                let btnVariant: 'primary' | 'secondary' | 'danger' = 'secondary';
                // Show colors after selection
                if (selectedOptionIndex !== null) {
                    if (idx === selectedOptionIndex) {
                        btnVariant = opt.isCorrect ? 'primary' : 'danger'; // Primary is red (good in RD theme actually means standard, but lets use red for selected)
                        // Actually, let's strictly follow standard UI feedback logic but mapped to Red Dwarf colors
                        // Red Dwarf Red = Standard. 
                        // Let's manually style for clarity.
                    }
                }

                // Custom logic for button styling based on state
                let styleClass = "border-gray-600";
                if (selectedOptionIndex !== null) {
                  if (opt.isCorrect) styleClass = "bg-green-900 border-green-500 text-green-100 ring-2 ring-green-500";
                  else if (idx === selectedOptionIndex) styleClass = "bg-red-900 border-red-500 text-red-100 ring-2 ring-red-500";
                  else styleClass = "opacity-40";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOptionIndex !== null}
                    className={`p-4 text-left border-2 rounded transition-all text-lg font-bold flex items-center ${styleClass} ${selectedOptionIndex === null ? 'hover:bg-gray-700 hover:border-red-400' : ''} bg-gray-900`}
                  >
                    <span className="mr-4 bg-black text-red-500 px-2 py-1 rounded text-sm">{String.fromCharCode(65 + idx)}</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback & Next */}
          {feedback && (
            <div className="mt-8 p-4 bg-black border-l-4 border-yellow-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-yellow-400 text-xl font-bold italic mb-4">"{feedback}"</p>
              <div className="flex justify-end">
                <QuizButton onClick={handleNext}>
                  {currentQIndex < questions.length - 1 ? "Next Question >" : "Finish Interview >"}
                </QuizButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const isWin = gameState === GameState.GAME_OVER_WIN;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black/90">
        <h2 className={`text-5xl font-bold mb-6 ${isWin ? 'text-green-500' : 'text-red-600'}`}>
          {isWin ? "HIRED!" : "REJECTED"}
        </h2>

        {isWin ? (
           <div className="relative mb-8 p-4 border-4 border-yellow-500 rounded bg-gray-800 rotate-2">
             <img src="https://picsum.photos/seed/dance/400/300" alt="Disco" className="rounded border-2 border-white opacity-80 mix-blend-hard-light" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl animate-bounce">🕺</span>
             </div>
             <p className="mt-4 text-yellow-400 text-xl font-bold">CELEBRATORY DISCO MODE ACTIVATED!</p>
           </div>
        ) : (
          <div className="mb-8">
             <div className="text-6xl mb-4">🤦‍♂️</div>
             <p className="text-red-400 text-2xl font-bold border-4 border-red-600 p-4 rounded bg-red-950/30">
               "You are a total Smeg Head."
             </p>
          </div>
        )}

        <p className="text-gray-400 mb-8 text-lg">
          You scored {score} out of {questions.length}.
        </p>

        <QuizButton onClick={() => setGameState(GameState.START)}>
          Try Again
        </QuizButton>
      </div>
    );
  };

  // Main Render Switch
  return (
    <div className="bg-[url('https://picsum.photos/seed/space/1920/1080')] bg-cover bg-center min-h-screen text-gray-200 overflow-x-hidden">
      <div className="min-h-screen bg-black/85 backdrop-blur-sm">
        {gameState === GameState.START && renderStart()}
        {gameState === GameState.LOADING && renderLoading()}
        {gameState === GameState.PLAYING && renderPlaying()}
        {(gameState === GameState.GAME_OVER_WIN || gameState === GameState.GAME_OVER_LOSE) && renderResult()}
      </div>
    </div>
  );
};

export default App;
