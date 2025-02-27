export interface QuizActivity {
  id: string;
  type: 'quiz-taken' | 'achievement' | 'streak' | 'topic-mastered';
  topic?: string;
  score?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  difficulty?: string;
  timestamp: number; // Unix timestamp
  details?: string;
  quizId?: string; // Reference to the saved quiz
}

export interface SavedQuiz {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: any[];
  createdAt: number; // Unix timestamp
  lastPlayed?: number; // Unix timestamp
  timesPlayed?: number;
  bestScore?: number;
}

export interface GauntletScore {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  correctAnswers: number;
  questionsAnswered: number;
  strikes: number;
  bestStreak: number;
  timeSpent: number;
  date: number; // timestamp
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
  avatar?: {
    face: number;
    eyes: number;
    mouth: number;
    accessory: number;
    colorTheme: number;
  };
  preferences?: {
    difficulty: "easy" | "medium" | "hard" | "expert";
    quizLength: string;
    timeLimit: "none" | "relaxed" | "standard" | "challenge";
    interests: string[];
  };
  stats?: {
    quizzesTaken: number;
    quizzesCreated: number;
    averageScore: number;
    learningStreak: number;
    lastQuizDate?: number; // Unix timestamp
    totalQuestions: number;
    correctAnswers: number;
    topicsMastered: number;
    timeSpent: number; // in minutes
  };
  recentActivity?: QuizActivity[];
  savedQuizzes?: SavedQuiz[];
  gauntletScores?: GauntletScore[];
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
} 