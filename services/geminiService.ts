import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

// Helper to validate the structure since we are casting from JSON
const validateQuestions = (data: any): QuizQuestion[] => {
  if (!Array.isArray(data)) return [];
  return data.slice(0, 5).map((q: any) => ({
    character: q.character || "Holly",
    questionText: q.questionText || "Question unavailable.",
    options: Array.isArray(q.options) ? q.options.slice(0, 3) : [],
    feedbackCorrect: q.feedbackCorrect || "Correct.",
    feedbackIncorrect: q.feedbackIncorrect || "Wrong.",
  }));
};

export const generateQuizQuestions = async (): Promise<QuizQuestion[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are Holly, the ship's computer from the TV show Red Dwarf. 
    Generate 5 humorous, short interview questions for Dave Lister, who is applying for random jobs on the ship (e.g., Chicken Soup Nozzle Cleaner, Scutter Supervisor).
    
    Characters involved: Arnold Rimmer, The Cat, Kryten, Holly.
    Tone: Sarcastic, silly, British sci-fi humor, "smeg" slang allowed.
    
    Structure:
    - 5 Questions.
    - Each question must have exactly 3 short options.
    - Only 1 option is loosely "correct" or the most "Lister-like" logic.
    - Provide short, witty feedback for both correct and incorrect answers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate the interview quiz now.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              character: { 
                type: Type.STRING, 
                description: "Name of character asking: Rimmer, Cat, Kryten, or Holly" 
              },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                  },
                  required: ["text", "isCorrect"],
                },
              },
              feedbackCorrect: { type: Type.STRING },
              feedbackIncorrect: { type: Type.STRING },
            },
            required: ["character", "questionText", "options", "feedbackCorrect", "feedbackIncorrect"],
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return validateQuestions(parsed);
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    // Fallback data in case API fails or key is missing, so the app doesn't crash during review
    return [
      {
        character: "Rimmer",
        questionText: "Space Corps Directive 34124 states what?",
        options: [
          { text: "No officer with false teeth should attempt oral sex in zero gravity.", isCorrect: true },
          { text: "Always salute with the left hand on Tuesdays.", isCorrect: false },
          { text: "Never eat gazpacho soup warm.", isCorrect: false }
        ],
        feedbackCorrect: "Precisely, Lister! For once you're not a total smeg head.",
        feedbackIncorrect: "Wrong! You are a total gimboid."
      },
      {
        character: "The Cat",
        questionText: "What is the most important rule of space travel?",
        options: [
          { text: "Check fuel levels.", isCorrect: false },
          { text: "Always look cool, even when exploding.", isCorrect: true },
          { text: "Calculate jump coordinates.", isCorrect: false }
        ],
        feedbackCorrect: "YEAAAAH! You got style, buddy!",
        feedbackIncorrect: "Uncool. Majorly uncool."
      },
      {
        character: "Kryten",
        questionText: "Sir, would you like some toast?",
        options: [
          { text: "No, I want a muffin.", isCorrect: true },
          { text: "Yes, please.", isCorrect: false },
          { text: "Only if it's brown.", isCorrect: false }
        ],
        feedbackCorrect: "Ah, excellent choice Sir. No toast it is.",
        feedbackIncorrect: "The toaster will be most displeased, Sir."
      },
      {
        character: "Holly",
        questionText: "What's the IQ of 6000 PE teachers?",
        options: [
          { text: "6000.", isCorrect: false },
          { text: "The same as a glass of water.", isCorrect: true },
          { text: "Genius level.", isCorrect: false }
        ],
        feedbackCorrect: "Correct. Or the square root of a shoe.",
        feedbackIncorrect: "Wrong. It's actually equivalent to a glow worm."
      },
      {
        character: "Lister",
        questionText: "What's the best way to cure a space hangover?",
        options: [
          { text: "Vitamins and rest.", isCorrect: false },
          { text: "Triple fried egg sandwich with chili sauce and chutney.", isCorrect: true },
          { text: "Jogging.", isCorrect: false }
        ],
        feedbackCorrect: "You beauty! I can taste it already.",
        feedbackIncorrect: "Jogging?! Are you trying to kill me?"
      }
    ];
  }
};
