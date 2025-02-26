"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import QuizMode from "./QuizMode";
import QuizResults from "./QuizResults";
import { QuizQuestion } from "@/lib/firebase/userUtils";

interface FormState {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  numberOfQuestions: number;
  preferredStyle: "conceptual" | "practical" | "mixed";
  timeLimit?: number;
}

type QuizState = "form" | "quiz" | "results";

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export default function CreateQuiz() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const quizId = searchParams.get('quizId');

  const [quizState, setQuizState] = useState<QuizState>("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  const [formState, setFormState] = useState<FormState>({
    topic: "",
    difficulty: userProfile?.preferences?.difficulty || "medium",
    numberOfQuestions: parseInt(userProfile?.preferences?.quizLength?.split("-")[0] || "10"),
    preferredStyle: "mixed"
  });

  // Handle retry mode
  useEffect(() => {
    if (mode === 'retry' && quizId && userProfile?.savedQuizzes) {
      const savedQuiz = userProfile.savedQuizzes.find(q => q.id === quizId);
      if (savedQuiz) {
        setFormState(prev => ({
          ...prev,
          topic: savedQuiz.topic,
          difficulty: savedQuiz.difficulty as "easy" | "medium" | "hard" | "expert",
          numberOfQuestions: savedQuiz.questions.length
        }));
        setGeneratedQuestions(savedQuiz.questions);
        setQuizState("quiz");
      }
    }
  }, [mode, quizId, userProfile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setGeneratedQuestions(data.questions);
      setQuizState("quiz");
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    setQuizState("results");
    // If we're in retry mode, clear the URL parameters to prevent auto-restart
    if (mode === 'retry') {
      router.push('/create-quiz');
    }
  };

  const handleShare = async () => {
    // TODO: Implement sharing to community
    console.log("Sharing to community...");
  };

  const handleTryAgain = () => {
    setQuizState("form");
    setGeneratedQuestions(null);
    setQuizStats(null);
    setFormState(prev => ({ ...prev, topic: "" }));
    // Clear the URL parameters
    router.push('/create-quiz');
  };

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
      
      <div className="container mx-auto px-4 py-24">
        {quizState === "form" && (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              {/* Header Section with Visual Emphasis */}
              <div className="relative px-8 pt-12 pb-8 border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
                <h1 className="text-4xl font-bold text-white mb-3">
                  {mode === 'retry' ? 'Retry Quiz' : 'Create a Quiz'}
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl">
                  {mode === 'retry' 
                    ? 'Test your knowledge again with the same questions'
                    : 'Generate an AI-powered quiz tailored to your specifications'
                  }
                </p>
              </div>

              {/* Main Form Section */}
              <div className="p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Topic Input with Enhanced Visual Feedback */}
                  <div className="space-y-4">
                    <label htmlFor="topic" className="block text-lg font-medium text-white">
                      What would you like to learn about?
                      <span className="ml-1 text-sm text-gray-400">(required)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="topic"
                        value={formState.topic}
                        onChange={(e) => setFormState(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="Enter a topic (e.g., 'Ancient Rome', 'Basic JavaScript')"
                        className="w-full px-5 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                        readOnly={mode === 'retry'}
                      />
                      {formState.topic && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Quiz Configuration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty Selection */}
                    <div className="space-y-4">
                      <label htmlFor="difficulty" className="block text-lg font-medium text-white">
                        Difficulty Level
                      </label>
                      <div className="relative">
                        <select
                          id="difficulty"
                          value={formState.difficulty}
                          onChange={(e) => setFormState(prev => ({ ...prev, difficulty: e.target.value as FormState['difficulty'] }))}
                          className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-500"
                          disabled={mode === 'retry'}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                          <option value="expert">Expert</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-indigo-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div className="space-y-4">
                      <label htmlFor="numberOfQuestions" className="block text-lg font-medium text-white">
                        Number of Questions
                      </label>
                      <div className="relative">
                        <select
                          id="numberOfQuestions"
                          value={formState.numberOfQuestions}
                          onChange={(e) => setFormState(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                          className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-500"
                          disabled={mode === 'retry'}
                        >
                          <option value="5">5 Questions</option>
                          <option value="10">10 Questions</option>
                          <option value="15">15 Questions</option>
                          <option value="20">20 Questions</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-indigo-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-4 md:col-span-2">
                      <label htmlFor="timeLimit" className="block text-lg font-medium text-white">
                        Time Limit
                      </label>
                      <div className="relative">
                        <select
                          id="timeLimit"
                          value={formState.timeLimit || 'none'}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormState(prev => ({
                              ...prev,
                              timeLimit: value === 'none' ? undefined : parseInt(value)
                            }));
                          }}
                          className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-500"
                          disabled={mode === 'retry'}
                        >
                          <option value="none">No time limit</option>
                          <option value="300">5 minutes</option>
                          <option value="600">10 minutes</option>
                          <option value="900">15 minutes</option>
                          <option value="1200">20 minutes</option>
                          <option value="1800">30 minutes</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-indigo-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Style with Visual Indicators */}
                  <div className="space-y-4">
                    <label htmlFor="preferredStyle" className="block text-lg font-medium text-white">
                      Quiz Style
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormState(prev => ({ ...prev, preferredStyle: 'conceptual' }))}
                        className={`p-4 rounded-xl border ${
                          formState.preferredStyle === 'conceptual'
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-gray-600 bg-gray-900/50 text-gray-400'
                        } transition-all hover:border-indigo-500/50`}
                        disabled={mode === 'retry'}
                      >
                        <div className="text-center">
                          <span className="text-2xl mb-2">🧠</span>
                          <p className="font-medium">Conceptual</p>
                          <p className="text-sm opacity-75">Theory-based</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState(prev => ({ ...prev, preferredStyle: 'practical' }))}
                        className={`p-4 rounded-xl border ${
                          formState.preferredStyle === 'practical'
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-gray-600 bg-gray-900/50 text-gray-400'
                        } transition-all hover:border-indigo-500/50`}
                        disabled={mode === 'retry'}
                      >
                        <div className="text-center">
                          <span className="text-2xl mb-2">⚡</span>
                          <p className="font-medium">Practical</p>
                          <p className="text-sm opacity-75">Application-based</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState(prev => ({ ...prev, preferredStyle: 'mixed' }))}
                        className={`p-4 rounded-xl border ${
                          formState.preferredStyle === 'mixed'
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-gray-600 bg-gray-900/50 text-gray-400'
                        } transition-all hover:border-indigo-500/50`}
                        disabled={mode === 'retry'}
                      >
                        <div className="text-center">
                          <span className="text-2xl mb-2">🎯</span>
                          <p className="font-medium">Mixed</p>
                          <p className="text-sm opacity-75">Both styles</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button with Loading State */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isGenerating || !formState.topic.trim()}
                      className="w-full relative px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      {isGenerating ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                          <span>{mode === 'retry' ? 'Starting Quiz...' : 'Generating Quiz...'}</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {mode === 'retry' ? 'Start Quiz' : 'Generate Quiz'}
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {quizState === "quiz" && generatedQuestions && (
          <QuizMode
            questions={generatedQuestions}
            topic={formState.topic}
            difficulty={formState.difficulty}
            onComplete={handleQuizComplete}
            savedQuizId={quizId || undefined}
          />
        )}

        {quizState === "results" && quizStats && (
          <QuizResults
            stats={quizStats}
            onShare={handleShare}
            onTryAgain={handleTryAgain}
            isRetryMode={mode === 'retry'}
            existingQuizId={quizId || undefined}
          />
        )}
      </div>
    </main>
  );
} 