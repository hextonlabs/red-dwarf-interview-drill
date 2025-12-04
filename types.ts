export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  character: string; // The character asking the question (e.g., "Rimmer", "Cat")
  questionText: string;
  options: AnswerOption[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export enum GameState {
  START,
  LOADING,
  PLAYING,
  GAME_OVER_WIN,
  GAME_OVER_LOSE
}
