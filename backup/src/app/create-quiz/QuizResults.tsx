import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateUserProfile, SavedQuiz, QuizQuestion } from "@/lib/firebase/userUtils";

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

interface QuizResultsProps {
  stats: QuizStats;
  onShare: () => void;
  onTryAgain: () => void;
}

export default function QuizResults({ stats, onShare, onTryAgain }: QuizResultsProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Add fallbacks to prevent NaN
  const accuracy = stats.totalQuestions > 0 
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
    : 0;
  
  const timePerQuestion = stats.totalQuestions > 0 
    ? Math.round(stats.timeSpent / stats.totalQuestions)
    : 0;
  
  // Calculate performance score (0-100) with fallbacks
  const performanceScore = Math.round(
    (accuracy * 0.7) + // 70% weight on accuracy
    (Math.min(1, stats.totalQuestions > 0 ? (stats.timeSpent / (stats.totalQuestions * 60)) : 0) * 30) // 30% weight on time
  );

  // Save stats to user profile
  const saveStats = async () => {
    if (!user || !userProfile) return;

    setIsSaving(true);
    try {
      const currentStats = userProfile.stats || {
        quizzesTaken: 0,
        quizzesCreated: 0,
        averageScore: 0,
        learningStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        topicsMastered: 0,
        timeSpent: 0,
        lastQuizDate: null
      };

      // Calculate new average score with fallback
      const totalQuizzes = (currentStats.quizzesTaken || 0) + 1;
      const newAverageScore = totalQuizzes > 0
        ? Math.round(
            ((currentStats.averageScore || 0) * (currentStats.quizzesTaken || 0) + accuracy) / totalQuizzes
          )
        : accuracy;

      // Check if this is a new day for the learning streak
      const lastQuizDate = currentStats.lastQuizDate ? new Date(currentStats.lastQuizDate) : null;
      const today = new Date();
      const isNewDay = !lastQuizDate || 
        lastQuizDate.getDate() !== today.getDate() ||
        lastQuizDate.getMonth() !== today.getMonth() ||
        lastQuizDate.getFullYear() !== today.getFullYear();

      // Update stats with fallbacks for all values
      const updatedStats = {
        quizzesTaken: (currentStats.quizzesTaken || 0) + 1,
        quizzesCreated: currentStats.quizzesCreated || 0,
        averageScore: newAverageScore,
        learningStreak: isNewDay ? (currentStats.learningStreak || 0) + 1 : (currentStats.learningStreak || 0),
        totalQuestions: (currentStats.totalQuestions || 0) + stats.totalQuestions,
        correctAnswers: (currentStats.correctAnswers || 0) + stats.correctAnswers,
        topicsMastered: (currentStats.topicsMastered || 0) + (accuracy >= 80 ? 1 : 0),
        timeSpent: (currentStats.timeSpent || 0) + Math.round(stats.timeSpent / 60), // Convert to minutes
        lastQuizDate: today
      };

      // Create a new saved quiz
      const quizId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const savedQuiz: SavedQuiz = {
        id: quizId,
        topic: stats.topic,
        difficulty: stats.difficulty,
        questions: stats.questions,
        createdAt: today,
        lastAttemptAt: today,
        attempts: [{
          timestamp: today,
          score: accuracy,
          timeSpent: stats.timeSpent
        }]
      };

      // Get current saved quizzes or initialize empty array
      const currentQuizzes = userProfile.savedQuizzes || [];
      const updatedQuizzes = [savedQuiz, ...currentQuizzes];

      // Create activity entry with quiz reference
      const activity = {
        type: 'quiz_taken' as const,
        topic: stats.topic,
        score: accuracy,
        difficulty: stats.difficulty,
        timestamp: today,
        details: `Completed ${stats.difficulty} quiz on ${stats.topic} with ${accuracy}% accuracy`,
        quizId: quizId // Link to the saved quiz
      };

      // Get current activities or initialize empty array
      const currentActivities = userProfile.recentActivity || [];
      const updatedActivities = [activity, ...currentActivities].slice(0, 10);

      // Update user profile
      await updateUserProfile(user.uid, { 
        stats: updatedStats,
        recentActivity: updatedActivities,
        savedQuizzes: updatedQuizzes
      });
      await refreshUserProfile();
    } catch (error) {
      console.error("Error saving stats:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save stats when component mounts
  useEffect(() => {
    saveStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rest of the component remains the same...
} 