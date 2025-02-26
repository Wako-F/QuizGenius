export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizAttempt {
  timestamp: number;
  score: number;
  timeSpent: number;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  attempts?: QuizAttempt[];
} 