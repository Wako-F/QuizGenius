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
  isRetryMode?: boolean;
  existingQuizId?: string;
}

export default function QuizResults({ stats, onShare, onTryAgain, isRetryMode, existingQuizId }: QuizResultsProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
  const timePerQuestion = Math.round(stats.timeSpent / stats.totalQuestions);
  
  // Calculate performance score (0-100)
  const performanceScore = Math.round(
    (accuracy * 0.7) + // 70% weight on accuracy
    (Math.min(1, (stats.timeSpent / (stats.totalQuestions * 60))) * 30) // 30% weight on time
  );

  // Save stats to user profile
  const saveStats = async () => {
    if (!user || !userProfile) return;

    setIsSaving(true);
    try {
      // Initialize or get current stats
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

      // Type assertion to help TypeScript understand the structure
      type UserStats = typeof currentStats;

      // Get current timestamp
      const now = new Date();
      const currentTimestamp = now.getTime();
      
      // Check if this is a new day for the learning streak (use proper 24-hour check)
      let shouldIncrementStreak = false;
      
      // Convert last quiz date to timestamp, handling various formats
      let lastQuizTimestamp = 0;
      
      // Using type assertion to avoid TypeScript errors with "never" type
      const typedStats = currentStats as UserStats;

      if (typedStats.lastQuizDate) {
        if (typedStats.lastQuizDate instanceof Date) {
          lastQuizTimestamp = typedStats.lastQuizDate.getTime();
        } else if (typeof typedStats.lastQuizDate === 'number') {
          lastQuizTimestamp = typedStats.lastQuizDate;
        } else {
          try {
            // Try parsing as string
            const parsedDate = new Date(typedStats.lastQuizDate as any);
            if (!isNaN(parsedDate.getTime())) {
              lastQuizTimestamp = parsedDate.getTime();
            }
          } catch (e) {
            console.error("Error parsing lastQuizDate:", e);
          }
        }
      }
      
      // Determine if we should increment the streak
      if (lastQuizTimestamp === 0) {
        // First quiz or invalid date, start a new streak
        shouldIncrementStreak = true;
      } else {
        // Calculate time difference in hours
        const hoursDiff = (currentTimestamp - lastQuizTimestamp) / (1000 * 60 * 60);
        
        // Consider it a new day for streak if more than 20 hours have passed
        if (hoursDiff >= 20) {
          shouldIncrementStreak = true;
          
          // Reset streak if it's been more than 48 hours
          if (hoursDiff > 48) {
            console.log("Streak reset: It's been more than 48 hours since the last quiz");
            typedStats.learningStreak = 0;
          }
        }
      }

      // Update stats - don't increment quizzesTaken for retries
      const updatedStats = {
        quizzesTaken: isRetryMode ? currentStats.quizzesTaken : (currentStats.quizzesTaken || 0) + 1,
        quizzesCreated: currentStats.quizzesCreated || 0,
        averageScore: Math.round(
          ((currentStats.averageScore * currentStats.quizzesTaken) + accuracy) / (isRetryMode ? currentStats.quizzesTaken : (currentStats.quizzesTaken || 0) + 1)
        ) || 0,
        learningStreak: shouldIncrementStreak ? (currentStats.learningStreak || 0) + 1 : (currentStats.learningStreak || 0),
        totalQuestions: (currentStats.totalQuestions || 0) + (isRetryMode ? 0 : stats.totalQuestions),
        correctAnswers: (currentStats.correctAnswers || 0) + (isRetryMode ? 0 : stats.correctAnswers),
        topicsMastered: (currentStats.topicsMastered || 0) + (accuracy >= 80 && !isRetryMode ? 1 : 0),
        timeSpent: (currentStats.timeSpent || 0) + Math.round(stats.timeSpent / 60), // Convert to minutes
        lastQuizDate: now // Store as Date object 
      };

      // Initialize arrays if they don't exist
      const currentQuizzes = Array.isArray(userProfile.savedQuizzes) ? userProfile.savedQuizzes : [];
      const currentActivities = Array.isArray(userProfile.recentActivity) ? userProfile.recentActivity : [];
      
      let updatedQuizzes = [...currentQuizzes];
      let updatedActivities = [...currentActivities];

      if (isRetryMode && existingQuizId) {
        // Update existing quiz with new attempt
        const quizIndex = updatedQuizzes.findIndex(quiz => quiz.id === existingQuizId);
        if (quizIndex !== -1) {
          updatedQuizzes[quizIndex] = {
            ...updatedQuizzes[quizIndex],
            lastAttemptAt: now,
            attempts: [
              {
                timestamp: now,
                score: accuracy,
                timeSpent: stats.timeSpent
              },
              ...(updatedQuizzes[quizIndex].attempts || [])
            ]
          };
        }
      } else {
        // Create a new saved quiz
        const quizId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const savedQuiz: SavedQuiz = {
          id: quizId,
          topic: stats.topic,
          difficulty: stats.difficulty,
          questions: stats.questions,
          createdAt: now,
          lastAttemptAt: now,
          attempts: [{
            timestamp: now,
            score: accuracy,
            timeSpent: stats.timeSpent
          }]
        };
        updatedQuizzes = [savedQuiz, ...updatedQuizzes];
      }

      // Create activity entry
      const activity = {
        type: 'quiz_taken' as const,
        topic: stats.topic,
        score: accuracy,
        difficulty: stats.difficulty,
        timestamp: now,
        details: `${isRetryMode ? 'Retried' : 'Completed'} ${stats.difficulty} quiz on ${stats.topic} with ${accuracy}% accuracy`,
        quizId: isRetryMode ? existingQuizId : updatedQuizzes[0].id
      };

      updatedActivities = [activity, ...updatedActivities].slice(0, 10);

      // Update user profile with all fields
      await updateUserProfile(user.uid, { 
        stats: updatedStats,
        recentActivity: updatedActivities,
        savedQuizzes: updatedQuizzes
      });
      
      // Refresh the user profile to get the latest data
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

  // Determine performance level
  const getPerformanceLevel = () => {
    if (performanceScore >= 90) return { text: "Outstanding!", color: "text-indigo-400" };
    if (performanceScore >= 80) return { text: "Excellent!", color: "text-blue-400" };
    if (performanceScore >= 70) return { text: "Great Job!", color: "text-green-400" };
    if (performanceScore >= 60) return { text: "Good Effort!", color: "text-yellow-400" };
    return { text: "Keep Practicing!", color: "text-orange-400" };
  };

  const performance = getPerformanceLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h2 className={`text-4xl font-bold ${performance.color} mb-2`}>
            {performance.text}
          </h2>
          <p className="text-gray-400">
            You've completed the {stats.difficulty} quiz on {stats.topic}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.correctAnswers}/{stats.totalQuestions}
            </div>
            <p className="text-gray-400 text-sm">Correct Answers</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">
              {accuracy}%
            </div>
            <p className="text-gray-400 text-sm">Accuracy</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">
              {Math.floor(stats.timeSpent / 60)}:{(stats.timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-gray-400 text-sm">Time Taken</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">
              {timePerQuestion}s
            </div>
            <p className="text-gray-400 text-sm">Avg. Time per Question</p>
          </div>
        </div>

        {/* Performance Meter */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Performance Score</span>
            <span>{performanceScore}/100</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${performanceScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Achievement Unlocked (if applicable) */}
        {accuracy >= 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-500/10 border border-indigo-500/50 rounded-xl p-4 mb-8 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="text-indigo-400 font-medium">Achievement Unlocked!</h3>
              <p className="text-gray-300 text-sm">
                {accuracy === 100 ? "Perfect Score" : "High Performer"} - {stats.topic} Master
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onTryAgain}
            className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
          >
            Try Another Quiz
          </button>
          <button
            onClick={onShare}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            Share to Community
          </button>
        </div>
      </div>
    </motion.div>
  );
} 