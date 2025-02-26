"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import { SavedQuiz } from "@/lib/firebase/userUtils";

export default function QuizDetails({ params }: { params: { id: string } }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (userProfile?.savedQuizzes) {
      const savedQuiz = userProfile.savedQuizzes.find(q => q.id === params.id);
      if (savedQuiz) {
        setQuiz(savedQuiz);
      } else {
        router.push("/my-quizzes");
      }
    }
  }, [user, userProfile, params.id, router, loading]);

  if (loading || !user || !quiz) {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            {/* Quiz Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {quiz.topic}
                </h1>
                <button
                  onClick={() => router.push(`/create-quiz?mode=retry&quizId=${quiz.id}`)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Retry Quiz
                </button>
              </div>
              <p className="text-gray-400">
                Difficulty: {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} • 
                Questions: {quiz.questions.length}
              </p>
            </div>

            {/* Attempt History */}
            {quiz.attempts && quiz.attempts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Attempt History</h2>
                <div className="space-y-4">
                  {quiz.attempts.map((attempt, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="text-gray-300">
                          {new Date(attempt.timestamp).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-400">
                          Time spent: {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        attempt.score >= 80 ? 'bg-green-500/10 text-green-400' :
                        attempt.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {attempt.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Review */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Questions</h2>
              {quiz.questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                >
                  <p className="text-white mb-4">
                    <span className="text-indigo-400 font-medium">Q{index + 1}:</span> {question.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          String.fromCharCode(65 + optIndex) === question.correctAnswer
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-gray-700/50 text-gray-300'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-400">
                      <span className="text-indigo-400 font-medium">Explanation: </span>
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Back Button */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/my-quizzes')}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                Back to My Quizzes
              </button>
              <button
                onClick={() => router.push(`/quiz/${quiz.id}/audit`)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
              >
                View Detailed Audit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 