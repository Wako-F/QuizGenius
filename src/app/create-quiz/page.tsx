"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/Header";
import { QuizQuestion, updateUserProfile, getUserProfile } from "@/lib/firebase/userUtils";
import QuizMode from "./QuizMode";
import QuizResults from "./QuizResults";
import Link from "next/link";

interface FormState {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  numberOfQuestions: number;
  preferredStyle: "conceptual" | "practical" | "mixed";
  timeLimit?: number;
}

// Define quiz states for the main page flow
type QuizState = "form" | "quiz" | "results";

// Interface for quiz statistics
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
  const quizId = searchParams.get('id');
  
  // State for form, quiz, and results
  const [quizState, setQuizState] = useState<QuizState>("form");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    topic: "",
    difficulty: "medium",
    numberOfQuestions: 10,
    preferredStyle: "mixed",
  });

  // Effect for retry mode
  useEffect(() => {
    if (mode === 'retry' && quizId && userProfile) {
      const savedQuiz = userProfile.savedQuizzes?.find(q => q.id === quizId);
      if (savedQuiz) {
        // Pre-fill the form with saved quiz data
        setFormState({
          topic: savedQuiz.topic,
          difficulty: savedQuiz.difficulty as "easy" | "medium" | "hard" | "expert",
          numberOfQuestions: savedQuiz.questions.length,
          preferredStyle: "mixed",
        });
        setGeneratedQuestions(savedQuiz.questions);
      }
    }
  }, [mode, quizId, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.topic) {
      console.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    
    try {
      // In retry mode, we already have the questions
      if (mode === 'retry' && generatedQuestions) {
        setQuizState("quiz");
        setIsGenerating(false);
        return;
      }
      
      // Generate new questions using API
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      
      if (!response.ok) throw new Error('Failed to generate quiz');
      
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setQuizState("quiz");
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      console.error('Error generating quiz. Please try again.');
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
      
      <div className="container mx-auto px-4 pt-24 pb-12">
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

              {/* Form Content */}
              <div className="px-8 py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Quiz Topic */}
                  <div className="space-y-4">
                    <label htmlFor="topic" className="block text-lg font-medium text-white">
                      Quiz Topic
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="topic"
                        placeholder="Enter a specific topic or subject..."
                        value={formState.topic}
                        onChange={(e) => setFormState(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        disabled={mode === 'retry'}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Be specific to get better questions (e.g. "React Hooks" instead of just "JavaScript")
                    </p>
                  </div>

                  {/* Quiz Details Grid Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty */}
                    <div className="space-y-4">
                      <label htmlFor="difficulty" className="block text-lg font-medium text-white">
                        Difficulty
                      </label>
                      <div className="relative">
                        <select
                          id="difficulty"
                          value={formState.difficulty}
                          onChange={(e) => setFormState(prev => ({ ...prev, difficulty: e.target.value as any }))}
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
                          <option value="5">5 questions</option>
                          <option value="10">10 questions</option>
                          <option value="15">15 questions</option>
                          <option value="20">20 questions</option>
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
                          <span className="text-2xl mb-2">🔄</span>
                          <p className="font-medium">Mixed</p>
                          <p className="text-sm opacity-75">Balanced approach</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isGenerating || !formState.topic}
                      className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Quiz...
                        </div>
                      ) : mode === 'retry' ? 'Start Quiz' : 'Generate Quiz'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {quizState === "quiz" && generatedQuestions && (
          <div className="max-w-4xl mx-auto">
            <QuizMode
              questions={generatedQuestions}
              topic={formState.topic}
              difficulty={formState.difficulty}
              onComplete={handleQuizComplete}
              savedQuizId={quizId || undefined}
            />
          </div>
        )}

        {quizState === "results" && quizStats && (
          <div className="max-w-4xl mx-auto">
            <QuizResults
              stats={quizStats}
              onShare={handleShare}
              onTryAgain={handleTryAgain}
            />
          </div>
        )}
      </div>
    </main>
  );
} 