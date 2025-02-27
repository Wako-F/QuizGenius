import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { GauntletScore } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

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
  gauntletScores?: GauntletScore[];
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
    gauntletScores: [], // Initialize empty array for gauntlet scores
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

export async function addGauntletScore(
  uid: string,
  gauntletScore: GauntletScore
): Promise<boolean> {
  try {
    console.log("addGauntletScore called with:", { uid, gauntletScore });
    
    // Get current user profile
    const profile = await getUserProfile(uid);
    console.log("Got user profile:", !!profile);
    
    if (!profile) {
      console.error("Cannot add gauntlet score: Profile not found");
      return false;
    }
    
    // Check if gauntletScores is an object instead of an array and fix it first
    if (profile.gauntletScores && !Array.isArray(profile.gauntletScores)) {
      console.log("Fixing gauntletScores structure before adding new score");
      // Fix the structure by calling ensureUserProfileFields
      const fixed = await ensureUserProfileFields(uid);
      if (fixed) {
        console.log("Structure fixed, retrieving updated profile");
        // Get the updated profile
        const updatedProfile = await getUserProfile(uid);
        if (!updatedProfile) {
          console.error("Failed to get updated profile after structure fix");
          return false;
        }
        // Update our reference to use the fixed profile
        profile.gauntletScores = updatedProfile.gauntletScores;
      } else {
        console.error("Failed to fix gauntletScores structure");
        // Initialize as empty array if fixing failed
        profile.gauntletScores = [];
      }
    }
    
    // Initialize gauntletScores array if it doesn't exist
    const currentScores = profile.gauntletScores || [];
    console.log("Current gauntlet scores:", currentScores.length);
    const isInitializing = !profile.gauntletScores;
    
    // Add new score to array
    const updatedScores = [...currentScores, gauntletScore];
    console.log("Updated scores array:", updatedScores.length);
    
    // Update the profile - use setDoc for initialization, updateDoc otherwise
    if (isInitializing) {
      console.log("Initializing gauntletScores array with setDoc");
      await setDoc(doc(db, "users", uid), {
        ...profile,
        gauntletScores: updatedScores,
        updatedAt: new Date()
      });
    } else {
      console.log("Updating existing gauntletScores array with updateDoc");
      await updateDoc(doc(db, "users", uid), {
        gauntletScores: updatedScores,
        updatedAt: new Date()
      });
    }
    console.log("User profile updated with new gauntlet score");
    
    // Double-check that the score was actually updated
    try {
      const updatedProfile = await getUserProfile(uid);
      
      // Verify gauntletScores is an array
      if (!updatedProfile?.gauntletScores || !Array.isArray(updatedProfile.gauntletScores)) {
        console.error("gauntletScores is still not an array after update");
        return false;
      }
      
      const scoreWasAdded = updatedProfile.gauntletScores.some(
        score => score.id === gauntletScore.id
      );
      
      console.log("Verification - Score was added:", scoreWasAdded);
      
      if (!scoreWasAdded) {
        console.warn("Score appears to not have been saved, trying again");
        // Try one more time with setDoc instead of updateDoc to ensure it writes
        const allUpdates = {
          ...updatedProfile,
          gauntletScores: updatedScores,
          updatedAt: new Date()
        };
        await setDoc(doc(db, "users", uid), allUpdates);
        console.log("Second attempt to update profile complete");
      }
    } catch (verifyError) {
      console.error("Error verifying score update:", verifyError);
    }

    return true;
  } catch (error) {
    console.error("Error adding gauntlet score:", error);
    return false;
  }
}

export async function ensureUserProfileFields(uid: string): Promise<boolean> {
  try {
    console.log("Ensuring user profile fields for:", uid);
    
    // Get current user profile
    const profile = await getUserProfile(uid);
    
    if (!profile) {
      console.error("Cannot ensure profile fields: Profile not found");
      return false;
    }
    
    // Check if any fields need to be initialized
    const updates: Partial<UserProfile> = {};
    let needsUpdate = false;
    
    // Check if gauntletScores is missing or not an array
    if (!profile.gauntletScores) {
      console.log("Initializing missing gauntletScores array");
      updates.gauntletScores = [];
      needsUpdate = true;
    } else if (!Array.isArray(profile.gauntletScores)) {
      // If gauntletScores exists but is not an array (it's an object/map instead)
      console.log("Fixing gauntletScores: Converting from object to array");
      
      // Try to extract any existing scores from the object structure
      const extractedScores: GauntletScore[] = [];
      try {
        // Attempt to extract values from the object structure
        const objectScores = profile.gauntletScores as any;
        
        // Iterate through all keys in the object (like "general knowledge")
        Object.keys(objectScores).forEach(topicKey => {
          if (Array.isArray(objectScores[topicKey])) {
            // If the value is an array, process each item
            objectScores[topicKey].forEach((scoreObj: any) => {
              // Check if it has basic properties we need
              if (scoreObj && typeof scoreObj === 'object') {
                try {
                  // Convert to a valid GauntletScore with required fields
                  const convertedScore: GauntletScore = {
                    id: scoreObj.id || uuidv4(), // Add ID if missing
                    topic: topicKey, // Use the object key as topic
                    difficulty: scoreObj.difficulty || 'medium',
                    score: scoreObj.score || 0,
                    correctAnswers: scoreObj.correctAnswers || 0,
                    questionsAnswered: scoreObj.totalQuestions || 0,
                    strikes: scoreObj.strikes || 0,
                    bestStreak: scoreObj.bestStreak || 0,
                    timeSpent: scoreObj.timeSpent || 0,
                    date: scoreObj.date || Date.now()
                  };
                  extractedScores.push(convertedScore);
                } catch (conversionError) {
                  console.error("Error converting score object:", conversionError);
                }
              }
            });
          }
        });
        
        console.log(`Extracted ${extractedScores.length} scores from object structure`);
      } catch (extractError) {
        console.error("Error extracting scores from object:", extractError);
      }
      
      // Set the fixed array in the updates
      updates.gauntletScores = extractedScores;
      needsUpdate = true;
    }
    
    if (!profile.recentActivity) {
      console.log("Initializing missing recentActivity array");
      updates.recentActivity = [];
      needsUpdate = true;
    }
    
    if (!profile.savedQuizzes) {
      console.log("Initializing missing savedQuizzes array");
      updates.savedQuizzes = [];
      needsUpdate = true;
    }
    
    // Update the profile if needed
    if (needsUpdate) {
      console.log("Updating user profile with initialized fields");
      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    }
    
    console.log("User profile already has all required fields");
    return true;
  } catch (error) {
    console.error("Error ensuring user profile fields:", error);
    return false;
  }
} 