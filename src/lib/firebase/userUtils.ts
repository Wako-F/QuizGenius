import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  createdAt: Date;
  lastAttemptAt?: Date;
  attempts?: {
    timestamp: Date;
    score: number;
    timeSpent: number;
  }[];
}

export interface QuizActivity {
  type: 'quiz_taken' | 'quiz_created' | 'achievement_earned';
  topic?: string;
  score?: number;
  difficulty?: string;
  timestamp: Date;
  details?: string;
  quizId?: string; // Reference to the saved quiz
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
    lastQuizDate?: Date;
    totalQuestions: number;
    correctAnswers: number;
    topicsMastered: number;
    timeSpent: number; // in minutes
  };
  recentActivity?: QuizActivity[];
  savedQuizzes?: SavedQuiz[];
  createdAt: Date;
  updatedAt: Date;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;
  
  const usernameQuery = query(
    collection(db, "usernames"),
    where("username", "==", username.toLowerCase())
  );
  
  const querySnapshot = await getDocs(usernameQuery);
  return querySnapshot.empty;
}

export async function createUserProfile(
  user: User,
  profile: Partial<UserProfile>
): Promise<void> {
  const { uid } = user;
  const now = new Date();
  
  // Create the main user profile
  const userProfile: UserProfile = {
    uid,
    username: profile.username!,
    displayName: user.displayName || profile.username!,
    email: user.email!,
    photoURL: user.photoURL || undefined,
    avatar: profile.avatar,
    preferences: profile.preferences || {
      difficulty: "medium",
      quizLength: "10-20",
      timeLimit: "standard",
      interests: [],
    },
    stats: {
      quizzesTaken: 0,
      quizzesCreated: 0,
      averageScore: 0,
      learningStreak: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      topicsMastered: 0,
      timeSpent: 0
    },
    savedQuizzes: [], // Initialize empty array for saved quizzes
    recentActivity: [], // Initialize empty array for recent activity
    createdAt: now,
    updatedAt: now,
  };

  // Save the user profile
  await setDoc(doc(db, "users", uid), userProfile);
  
  // Reserve the username
  await setDoc(doc(db, "usernames", profile.username!.toLowerCase()), {
    uid,
    username: profile.username!.toLowerCase(),
    createdAt: now,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
}

export function generateUsernameVariations(baseName: string): string[] {
  const variations: string[] = [];
  const randomNum = () => Math.floor(Math.random() * 1000);
  
  // Remove spaces and special characters
  const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  variations.push(cleanName);
  variations.push(cleanName + randomNum());
  variations.push(cleanName + "_" + randomNum());
  variations.push(cleanName + randomNum() + randomNum());
  
  return variations;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const now = new Date();
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: now
  });
} 