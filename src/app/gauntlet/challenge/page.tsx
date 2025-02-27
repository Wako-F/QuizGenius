"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "@/lib/firebase/userUtils";
import { updateUserProfile, getUserProfile, addGauntletScore, ensureUserProfileFields } from "@/lib/firebase/userUtils";
import Header from "@/components/Header";
import { GauntletScore } from "@/lib/types/user";
import { v4 as uuidv4 } from "uuid";

interface GauntletState {
  questions: QuizQuestion[];
  topic: string;
  difficulty: string;
  correctAnswers: number;
  wrongAnswers: number;
  strikes: number;
  timeLeft: number;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswerSubmitted: boolean;
  gameOver: boolean;
  streak: number;
  bestStreak: number;
  score: number;
  showFeedback: boolean;
  feedbackType: "correct" | "wrong" | null;
  questionsAnswered: number;
  startTime: number;
  isLoading: boolean;
  isGeneratingMore: boolean;
}

export default function GauntletChallenge() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [state, setState] = useState<GauntletState>({
    questions: [],
    topic: "",
    difficulty: "medium",
    correctAnswers: 0,
    wrongAnswers: 0,
    strikes: 0,
    timeLeft: 180, // 3 minutes
    currentQuestionIndex: 0,
    selectedAnswer: null,
    isAnswerSubmitted: false,
    gameOver: false,
    streak: 0,
    bestStreak: 0,
    score: 0,
    showFeedback: false,
    feedbackType: null,
    questionsAnswered: 0,
    startTime: Date.now(),
    isLoading: true,
    isGeneratingMore: false
  });

  // Load initial questions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuestions = localStorage.getItem('gauntletQuestions');
      const savedTopic = localStorage.getItem('gauntletTopic');
      const savedDifficulty = localStorage.getItem('gauntletDifficulty');
      
      if (savedQuestions && savedTopic) {
        try {
          const parsedQuestions = JSON.parse(savedQuestions);
          setState(prev => ({
            ...prev,
            questions: parsedQuestions,
            topic: savedTopic,
            difficulty: savedDifficulty || "medium",
            isLoading: false
          }));
        } catch (error) {
          console.error("Error parsing saved questions:", error);
          router.push('/gauntlet');
        }
      } else {
        // No questions found, redirect back to setup
        router.push('/gauntlet');
      }
    }
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (state.isLoading || state.gameOver) return;

    if (state.timeLeft <= 0) {
      handleGauntletComplete();
      return;
    }

    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeLeft: prev.timeLeft - 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.timeLeft, state.isLoading, state.gameOver]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!state.isAnswerSubmitted && !state.gameOver) {
      setState(prev => ({
        ...prev,
        selectedAnswer: answer
      }));
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (state.selectedAnswer && !state.isAnswerSubmitted && !state.gameOver) {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;
      
      let newStreak = state.streak;
      let newBestStreak = state.bestStreak;
      let newScore = state.score;
      
      if (isCorrect) {
        newStreak += 1;
        newBestStreak = Math.max(newBestStreak, newStreak);
        
        // Score calculation: base points + streak bonus + time bonus
        const basePoints = 100;
        const streakBonus = Math.min(newStreak * 10, 100); // Cap streak bonus at 100
        const timeBonus = Math.round(state.timeLeft / 180 * 50); // Up to 50 points for time
        
        newScore += basePoints + streakBonus + timeBonus;
      } else {
        newStreak = 0;
      }
      
      setState(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
        strikes: !isCorrect ? prev.strikes + 1 : prev.strikes,
        streak: newStreak,
        bestStreak: newBestStreak,
        score: newScore,
        isAnswerSubmitted: true,
        feedbackType: isCorrect ? "correct" : "wrong",
        showFeedback: true
      }));
      
      // Show feedback, then proceed to next question
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showFeedback: false
        }));
        
        if (!isCorrect && state.strikes + 1 >= 3) {
          // Game over if we reached 3 strikes
          handleGauntletComplete();
        } else {
          handleNextQuestion();
        }
      }, 1000);
    }
  };

  // Generate more questions when needed
  const generateMoreQuestions = useCallback(async () => {
    if (state.isGeneratingMore) return;
    
    setState(prev => ({
      ...prev,
      isGeneratingMore: true
    }));
    
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: state.topic,
          difficulty: state.difficulty,
          numberOfQuestions: 5, // Generate 5 more questions
          preferredStyle: "mixed",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate more questions");
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        questions: [...prev.questions, ...data.questions],
        isGeneratingMore: false
      }));
    } catch (error) {
      console.error("Error generating more questions:", error);
      setState(prev => ({
        ...prev,
        isGeneratingMore: false
      }));
    }
  }, [state.topic, state.difficulty, state.isGeneratingMore]);

  // Move to next question, potentially generating more questions if needed
  const handleNextQuestion = useCallback(() => {
    // Keep track of seen questions to prevent repetition
    const nextQuestion = () => {
      setState(prev => {
        // Create a set of indices that have already been displayed
        const seenIndices = prev.questionsAnswered > 0 
          ? JSON.parse(localStorage.getItem('gauntletSeenQuestions') || '[]') 
          : [];
        
        // Find questions that haven't been seen yet
        const unseenIndices = prev.questions
          .map((_, index) => index)
          .filter(index => !seenIndices.includes(index));
        
        // If no unseen questions available, force generation of new ones
        if (unseenIndices.length === 0) {
          return {
            ...prev,
            selectedAnswer: null,
            isAnswerSubmitted: false,
            isGeneratingMore: true
          };
        }
        
        // Select a random unseen question
        const randomIndex = Math.floor(Math.random() * unseenIndices.length);
        const nextQuestionIndex = unseenIndices[randomIndex];
        
        // Add this question to seen questions
        const updatedSeenIndices = [...seenIndices, nextQuestionIndex];
        localStorage.setItem('gauntletSeenQuestions', JSON.stringify(updatedSeenIndices));
        
        // If we're running low on unseen questions, generate more in the background
        if (unseenIndices.length < 5) {
          // We'll trigger question generation after state update
          setTimeout(() => generateMoreQuestions(), 0);
        }
        
        return {
          ...prev,
          currentQuestionIndex: nextQuestionIndex,
          selectedAnswer: null,
          isAnswerSubmitted: false
        };
      });
    };
    
    // Generate more questions if we're running low
    if (state.isGeneratingMore) {
      setState(prev => ({
        ...prev,
        selectedAnswer: null,
        isAnswerSubmitted: false
      }));
      return;
    }
    
    nextQuestion();
  }, [state.questions, state.isGeneratingMore, generateMoreQuestions]);

  // Handle end of gauntlet
  const handleGauntletComplete = async () => {
    console.log("Completing gauntlet and saving stats");
    // Clear seen questions on game completion
    localStorage.removeItem('gauntletSeenQuestions');
    
    setState(prev => ({
      ...prev,
      gameOver: true
    }));
    
    // Save current state as results
    const results = {
      score: state.score,
      correctAnswers: state.correctAnswers,
      wrongAnswers: state.wrongAnswers,
      strikes: state.strikes,
      questionsAnswered: state.questionsAnswered,
      timeSpent: 180 - state.timeLeft,
      topic: state.topic,
      difficulty: state.difficulty,
      bestStreak: state.bestStreak
    };
    
    // Save results to localStorage for results page
    localStorage.setItem('gauntletResults', JSON.stringify(results));
    console.log("Saved results to localStorage:", results);
    
    // Save to user profile if logged in
    if (user) {
      try {
        console.log("User logged in, saving gauntlet score to profile");
        
        // Ensure user profile has all required fields before proceeding
        console.log("Checking user profile fields");
        await ensureUserProfileFields(user.uid);
        
        // Create a new gauntlet score record
        const gauntletScore: GauntletScore = {
          id: uuidv4(),
          topic: state.topic,
          difficulty: state.difficulty,
          score: state.score,
          correctAnswers: state.correctAnswers,
          questionsAnswered: state.questionsAnswered,
          strikes: state.strikes,
          bestStreak: state.bestStreak,
          timeSpent: 180 - state.timeLeft,
          date: Date.now()
        };
        
        console.log("Adding gauntlet score:", gauntletScore);
        // Add gauntlet score using the dedicated function
        const scoreAdded = await addGauntletScore(user.uid, gauntletScore);
        
        if (!scoreAdded) {
          console.error("Failed to add gauntlet score");
        } else {
          console.log("Gauntlet score added successfully");
        }
        
        // Get current user profile for adding activity
        const currentProfile = await getUserProfile(user.uid);
        console.log("Current profile retrieved for activity:", !!currentProfile);
        
        if (!currentProfile) {
          console.error("Failed to get user profile");
          return;
        }
        
        // Also add to recent activity
        const newActivity = {
          id: uuidv4(),
          type: 'quiz_taken' as const,
          topic: state.topic,
          score: state.score,
          correctAnswers: state.correctAnswers,
          totalQuestions: state.questionsAnswered,
          difficulty: 'gauntlet', // Set explicitly to gauntlet for proper identification
          timestamp: new Date(), // Use Date object as expected by the interface
          details: `Gauntlet Challenge: ${state.correctAnswers} correct, score: ${state.score}`
        };
        
        // Check if recentActivity exists, initialize if not
        let currentActivity = currentProfile.recentActivity || [];
        if (!Array.isArray(currentActivity)) {
          currentActivity = [];
        }
        
        const updatedActivity = [
          newActivity,
          ...currentActivity.slice(0, 9) // Keep last 10 activities
        ];
        
        // Update user profile with new activity
        console.log("Updating user profile with new activity");
        await updateUserProfile(user.uid, {
          recentActivity: updatedActivity
        });
        
        // Refresh user profile to update displayed stats
        console.log("Before refreshing user profile");
        await refreshUserProfile();
        console.log("After refreshing user profile");
        console.log("Profile refresh complete - userProfile:", userProfile);
        
        // Set a flag to ensure the gauntlet page will refresh
        sessionStorage.setItem('gauntletCompleted', 'true');
      } catch (error) {
        console.error('Error saving gauntlet results:', error);
      }
    }
    
    // Add a small delay before navigating to ensure profile refresh is complete
    console.log("Adding delay before navigation to ensure profile is refreshed");
    setTimeout(() => {
      console.log("Navigation delay complete, going to results page");
      // Set a flag for results page to know a gauntlet was just completed
      sessionStorage.setItem('justCompletedGauntlet', 'true');
      // Navigate to results page
      router.push('/gauntlet/results');
    }, 2000); // 2 second delay to ensure Firebase update is complete
  };

  // Shortcut for ESC key to end gauntlet early
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !state.gameOver) {
        handleGauntletComplete();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameOver]);

  // If still loading questions
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Get current question
  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Gauntlet Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-yellow-400">⚡</span> Gauntlet Challenge
            </h2>
            <p className="text-gray-400 mt-1">
              Topic: {state.topic} • Difficulty: {state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${state.timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {formatTime(state.timeLeft)}
              </div>
              <p className="text-gray-400 text-xs mt-1">Time Left</p>
            </div>
            <div className="w-px h-10 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{state.score}</div>
              <p className="text-gray-400 text-xs mt-1">Score</p>
            </div>
            <button
              onClick={handleGauntletComplete}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-sm transition-colors"
            >
              End Early
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-400">
              {state.correctAnswers}
            </div>
            <p className="text-gray-400 text-sm">Correct</p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">
              {state.streak}
            </div>
            <p className="text-gray-400 text-sm">Current Streak</p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map(index => (
                <div 
                  key={index}
                  className={`w-6 h-6 rounded-full ${
                    index < state.strikes 
                      ? 'bg-red-500' 
                      : 'bg-gray-700'
                  } flex items-center justify-center text-xs`}
                >
                  {index < state.strikes && "✖"}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">Strikes</p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {state.bestStreak}
            </div>
            <p className="text-gray-400 text-sm">Best Streak</p>
          </div>
        </div>
        
        {/* Question Card */}
        <motion.div
          key={state.currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 relative overflow-hidden mb-6"
        >
          {/* Feedback Overlay */}
          <AnimatePresence>
            {state.showFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex items-center justify-center ${
                  state.feedbackType === "correct" ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <div className={`text-5xl font-bold ${
                  state.feedbackType === "correct" ? "text-green-400" : "text-red-400"
                }`}>
                  {state.feedbackType === "correct" ? "CORRECT!" : "WRONG!"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Number */}
          <div className="mb-4 text-sm font-medium text-gray-400">
            Question #{state.questionsAnswered + 1}
          </div>

          {/* Question */}
          <h3 className="text-xl font-medium text-white mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
              const isSelected = state.selectedAnswer === optionLetter;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(optionLetter)}
                  disabled={state.isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="font-bold mr-2">{optionLetter}.</span> {option}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnswerSubmit}
              disabled={!state.selectedAnswer || state.isAnswerSubmitted}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {state.isGeneratingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Loading next...</span>
                </div>
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </motion.div>
        
        {/* Progress Bar */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Questions Answered: {state.questionsAnswered}</span>
            <span>Accuracy: {state.questionsAnswered > 0 ? Math.round((state.correctAnswers / state.questionsAnswered) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${state.timeLeft / 180 * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </main>
  );
} 