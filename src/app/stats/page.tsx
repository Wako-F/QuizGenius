"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";

// Helper function to format dates properly
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  let date: Date;
  
  // Handle different timestamp formats
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    // Try to parse as ISO string or timestamp
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed)) {
      return 'Invalid date';
    }
    date = new Date(parsed);
  } else {
    // Handle other cases like Firestore timestamps
    try {
      // Try to convert to date if it has toDate() method (Firestore timestamp)
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else {
        return 'Invalid date';
      }
    } catch (e) {
      return 'Invalid date';
    }
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format the date
  return date.toLocaleDateString();
};

const StatCard = ({ title, value, description, icon }: { 
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {description && (
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="text-indigo-400">
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function Stats() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Add refresh when component mounts to ensure latest data
  useEffect(() => {
    if (user && !loading) {
      console.log("Stats page - refreshing user profile to get latest data");
      refreshUserProfile().catch(error => {
        console.error("Error refreshing user profile on stats page:", error);
      });
    }
  }, [user, loading, refreshUserProfile]);

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const stats = userProfile.stats || {
    quizzesTaken: 0,
    quizzesCreated: 0,
    averageScore: 0,
    learningStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    topicsMastered: 0,
    timeSpent: 0
  };

  // Calculate additional metrics
  const accuracyRate = stats.totalQuestions > 0 
    ? ((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1) 
    : '0.0';
  
  const timeSpentHours = (stats.timeSpent / 60).toFixed(1);

  // Calculate gauntlet stats
  const gauntletScores = userProfile.gauntletScores || [];
  const totalGauntletChallenges = gauntletScores.length;
  const bestGauntletScore = gauntletScores.length > 0
    ? Math.max(...gauntletScores.map(score => score.score))
    : 0;
  const averageGauntletScore = gauntletScores.length > 0
    ? Math.round(gauntletScores.reduce((sum, score) => sum + score.score, 0) / gauntletScores.length)
    : 0;
  const totalGauntletPoints = gauntletScores.length > 0
    ? gauntletScores.reduce((sum, score) => sum + score.score, 0)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">My Statistics</h1>
            <p className="text-gray-400">Track your learning progress and achievements</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Quizzes Taken"
              value={stats.quizzesTaken}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />

            <StatCard
              title="Average Score"
              value={`${stats.averageScore}%`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />

            <StatCard
              title="Learning Streak"
              value={`${stats.learningStreak} days`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />

            <StatCard
              title="Topics Mastered"
              value={stats.topicsMastered}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
            />
          </div>

          {/* Detailed Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <span className="text-white">{accuracyRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${accuracyRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Questions Answered</span>
                    <span className="text-white">{stats.totalQuestions}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <div className="flex-1 bg-gray-700 rounded-lg p-2">
                      <span className="text-green-400">{stats.correctAnswers} correct</span>
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-lg p-2">
                      <span className="text-red-400">{stats.totalQuestions - stats.correctAnswers} incorrect</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Time Spent Learning</span>
                    <span className="text-white">{timeSpentHours} hours</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievement Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Achievement Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Quiz Master</span>
                    <span className="text-white">{stats.quizzesTaken}/50 quizzes</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(stats.quizzesTaken / 50) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Knowledge Seeker</span>
                    <span className="text-white">{stats.topicsMastered}/10 topics</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(stats.topicsMastered / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Dedication</span>
                    <span className="text-white">{stats.learningStreak}/30 days</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(stats.learningStreak / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gauntlet Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-yellow-400">⚡</span> Gauntlet Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Challenges</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{totalGauntletChallenges}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Best Score</p>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">{bestGauntletScore}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{averageGauntletScore}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{totalGauntletPoints}</p>
                </div>
              </div>
              
              {gauntletScores.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Recent Gauntlet Performances</h3>
                  <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-6 gap-2 text-sm text-gray-400 p-3 border-b border-gray-700">
                      <div className="col-span-2">Topic</div>
                      <div>Score</div>
                      <div>Correct</div>
                      <div>Streak</div>
                      <div>Date</div>
                    </div>
                    {gauntletScores
                      .sort((a, b) => {
                        // Safe sorting that handles invalid dates
                        const dateA = a.date ? a.date : 0;
                        const dateB = b.date ? b.date : 0;
                        return dateB - dateA;
                      })
                      .slice(0, 5)
                      .map(score => (
                        <div key={score.id} className="grid grid-cols-6 gap-2 p-3 border-b border-gray-700 text-sm hover:bg-gray-700/30">
                          <div className="col-span-2 text-white">{score.topic}</div>
                          <div className="text-indigo-400 font-medium">{score.score}</div>
                          <div>{score.correctAnswers}/{score.questionsAnswered}</div>
                          <div>{score.bestStreak}</div>
                          <div>{formatDate(score.date)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 