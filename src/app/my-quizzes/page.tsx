"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MyQuizzes() {
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

  const savedQuizzes = userProfile?.savedQuizzes || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Quizzes</h1>
            <p className="text-gray-400">Review your quiz history and track your progress</p>
          </div>

          {/* Quiz List */}
          {savedQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {savedQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{quiz.topic}</h3>
                      <p className="text-gray-400 mb-4">
                        Difficulty: {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} • 
                        Questions: {quiz.questions.length} •
                        Last Attempt: {new Date(quiz.lastAttemptAt || quiz.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* Attempt History */}
                      {quiz.attempts && quiz.attempts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Recent Attempts:</p>
                          <div className="flex flex-wrap gap-2">
                            {quiz.attempts.slice(0, 3).map((attempt, index) => (
                              <div
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  attempt.score >= 80 ? 'bg-green-500/10 text-green-400' :
                                  attempt.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}
                              >
                                {attempt.score}%
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => router.push(`/create-quiz?mode=retry&quizId=${quiz.id}`)}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
              <p className="text-gray-400 mb-6">Start your learning journey by taking your first quiz!</p>
              <Link
                href="/create-quiz"
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors inline-flex items-center gap-2"
              >
                Create Your First Quiz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 