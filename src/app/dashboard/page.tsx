"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Quiz Card */}
          <Link href="/create-quiz" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-indigo-500/50 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
              <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-400 transition-colors">
                Create New Quiz
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Generate a personalized quiz using AI, tailored to your interests and knowledge level.
              </p>
              <div className="inline-flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Get Started
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          </Link>

          {/* My Quizzes Card */}
          <Link href="/my-quizzes" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-purple-500/50 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-400 transition-colors">
                My Quizzes
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                View your quiz history, saved quizzes, and track your progress over time.
              </p>
              <div className="inline-flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                View History
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          </Link>

          {/* Community Quizzes Card */}
          <Link href="/community" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-700 hover:border-pink-500/50 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
              <div className="w-12 h-12 bg-pink-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-pink-400 transition-colors">
                Community Quizzes
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Explore and take quizzes created by the community. Share your own and earn reputation.
              </p>
              <div className="inline-flex items-center text-pink-400 group-hover:text-pink-300 transition-colors">
                Explore
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm font-medium">Quizzes Taken</h4>
                <p className="text-2xl font-bold text-white mt-1">{userProfile?.stats?.quizzesTaken || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm font-medium">Average Score</h4>
                <p className="text-2xl font-bold text-white mt-1">{userProfile?.stats?.averageScore || 0}%</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm font-medium">Learning Streak</h4>
                <p className="text-2xl font-bold text-white mt-1">{userProfile?.stats?.learningStreak || 0} days</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm font-medium">Topics Mastered</h4>
                <p className="text-2xl font-bold text-white mt-1">{userProfile?.stats?.topicsMastered || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          {userProfile?.recentActivity && userProfile.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {userProfile.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.timestamp.toString() + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 ${
                    activity.type === 'quiz_taken' && activity.quizId ? 'cursor-pointer hover:bg-gray-800/70' : ''
                  }`}
                  onClick={() => {
                    if (activity.type === 'quiz_taken' && activity.quizId) {
                      const savedQuiz = userProfile?.savedQuizzes?.find(q => q.id === activity.quizId);
                      if (savedQuiz) {
                        router.push(`/quiz/${activity.quizId}`);
                      }
                    }
                  }}
                >
                  {/* Activity Icon */}
                  <div className={`p-3 rounded-lg ${
                    activity.type === 'quiz_taken' 
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : activity.type === 'achievement_earned'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {activity.type === 'quiz_taken' ? (
                      <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {activity.quizId && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    ) : activity.type === 'achievement_earned' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1">
                    <p className="text-white group-hover:text-indigo-400 transition-colors">
                      {activity.details}
                      {activity.type === 'quiz_taken' && activity.quizId && (
                        <span className="ml-2 text-sm text-indigo-400">(Click to retry)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Score Badge (if applicable) */}
                  {activity.type === 'quiz_taken' && activity.score !== undefined && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activity.score >= 80 ? 'bg-green-500/10 text-green-400' :
                      activity.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {activity.score}%
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p>No recent activity yet. Start by taking or creating a quiz!</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
} 