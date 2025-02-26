"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { motion } from "framer-motion";

interface QuizAuditContentProps {
  quizId: string;
}

export default function QuizAuditContent({ quizId }: QuizAuditContentProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (userProfile?.savedQuizzes) {
      const savedQuiz = userProfile.savedQuizzes.find(q => q.id === quizId);
      if (savedQuiz) {
        setQuiz(savedQuiz);
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, userProfile, quizId, router, loading]);

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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Quiz Review: {quiz.topic}
              </h1>
              <p className="text-gray-400">
                Difficulty: {quiz.difficulty} • Questions: {quiz.questions.length}
              </p>
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-gray-300">Attempt History:</p>
                  {quiz.attempts.map((attempt: any, index: number) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
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
              )}
            </div>

            <div className="space-y-8">
              {quiz.questions.map((question: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-4">
                        {question.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {question.options.map((option: string, optionIndex: number) => {
                          const isCorrect = option.startsWith(question.correctAnswer);
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrect
                                  ? 'border-green-500/50 bg-green-500/10'
                                  : 'border-gray-700 bg-gray-800/50'
                              }`}
                            >
                              <p className={isCorrect ? 'text-green-400' : 'text-gray-300'}>
                                {option}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-sm text-gray-400">
                          <span className="text-indigo-400 font-medium">Explanation: </span>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 