"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { ensureUserProfileFields } from "@/lib/firebase/userUtils";

interface GauntletResults {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  strikes: number;
  questionsAnswered: number;
  timeSpent: number;
  topic: string;
  difficulty: string;
  bestStreak: number;
}

// A simple function to determine rank based on score
const getRankFromScore = (score: number) => {
  if (score >= 1000) return "Legendary Master";
  if (score >= 800) return "Grandmaster";
  if (score >= 600) return "Expert Challenger";
  if (score >= 400) return "Skilled Quizzer";
  if (score >= 200) return "Knowledge Seeker";
  return "Novice";
};

// Format time as MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function GauntletResultsPage() {
  const router = useRouter();
  const { user, refreshUserProfile } = useAuth();
  const [results, setResults] = useState<GauntletResults | null>(null);
  const [rank, setRank] = useState<string>("Novice Challenger");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load results from localStorage
      const savedResults = localStorage.getItem('gauntletResults');
      
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults);
          setResults(parsedResults);
          
          // Determine rank based on score
          const rank = getRankFromScore(parsedResults.score);
          setRank(rank);
        } catch (error) {
          console.error("Error parsing saved results:", error);
          router.push('/gauntlet');
        }
      } else {
        // No results found, redirect back
        router.push('/gauntlet');
      }
      
      setIsLoading(false);
    }
  }, [router]);
  
  if (isLoading || !results) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  const handleTryAgain = async () => {
    console.log("Going back to gauntlet page...");
    try {
      // Check and ensure all required fields in the user profile
      if (user) {
        console.log("Ensuring user profile fields before navigation");
        await ensureUserProfileFields(user.uid);
      }
      
      // Refresh user profile before navigating
      await refreshUserProfile();
      console.log("User profile refreshed, navigating to gauntlet page");
      
      // Set a flag in sessionStorage to indicate we're coming from results page
      sessionStorage.setItem('fromGauntletResults', 'true');
      
      router.push('/gauntlet');
    } catch (error) {
      console.error("Error refreshing profile:", error);
      sessionStorage.setItem('fromGauntletResults', 'true');
      router.push('/gauntlet');
    }
  };
  
  const handleShareTwitter = () => {
    const text = `I just scored ${results.score} points in the ${results.topic} Gauntlet Challenge on QuizGenius! Can you beat my score? #QuizGenius #GauntletChallenge`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  // Calculate metrics
  const accuracy = results.questionsAnswered > 0 
    ? Math.round((results.correctAnswers / results.questionsAnswered) * 100) 
    : 0;
    
  const questionsPerMinute = results.timeSpent > 0 
    ? Math.round((results.questionsAnswered / results.timeSpent) * 60) 
    : 0;
    
  const averageTimePerQuestion = results.questionsAnswered > 0
    ? (results.timeSpent / results.questionsAnswered).toFixed(1)
    : '0';
    
  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-indigo-400 mb-2">
                Gauntlet Complete!
              </h1>
              <p className="text-2xl font-bold text-yellow-400 mb-4">
                {rank}
              </p>
              <p className="text-gray-400">
                You survived the {results.difficulty} gauntlet on {results.topic}
              </p>
            </div>
            
            {/* Score Display */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8 text-center">
              <div className="text-6xl font-bold text-indigo-400 mb-2">
                {results.score}
              </div>
              <p className="text-gray-300">FINAL SCORE</p>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-white">
                  {results.questionsAnswered}
                </div>
                <p className="text-gray-400 text-sm">Questions Answered</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {results.correctAnswers}
                </div>
                <p className="text-gray-400 text-sm">Correct Answers</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {results.strikes}/3
                </div>
                <p className="text-gray-400 text-sm">Strikes</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-white">
                  {accuracy}%
                </div>
                <p className="text-gray-400 text-sm">Accuracy</p>
              </div>
            </div>
            
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Time Stats */}
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-3">Time Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Time</span>
                    <span className="text-white font-medium">{formatTime(results.timeSpent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Questions Per Minute</span>
                    <span className="text-white font-medium">{questionsPerMinute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Time Per Question</span>
                    <span className="text-white font-medium">{averageTimePerQuestion}s</span>
                  </div>
                </div>
              </div>
              
              {/* Streak Stats */}
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-3">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Best Streak</span>
                    <span className="text-indigo-400 font-medium">{results.bestStreak} in a row</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-white font-medium">{accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Remaining Time</span>
                    <span className="text-white font-medium">
                      {results.timeSpent < 180 ? formatTime(180 - results.timeSpent) : "0:00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 mb-8">
              <h3 className="text-lg font-medium text-white mb-3">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Base Points (100 per correct answer)</span>
                  <span className="text-green-400 font-medium">+{results.correctAnswers * 100}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Streak Bonuses</span>
                  <span className="text-indigo-400 font-medium">
                    +{results.score - (results.correctAnswers * 100)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                  <span className="text-white font-medium">Final Score</span>
                  <span className="text-2xl font-bold text-indigo-400">{results.score}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleTryAgain}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
              >
                Try Again
              </button>
              
              <button
                onClick={handleShareTwitter}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Share on Twitter
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          
          {/* Rank Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 text-center"
          >
            <h2 className="text-xl font-bold text-white mb-4">Achievement Unlocked</h2>
            <div className="inline-block bg-gray-800/50 rounded-xl p-4 border border-indigo-500/30">
              <div className="text-4xl mb-2">
                {rank === "Legendary Master" && "🏆"}
                {rank === "Grandmaster" && "🎖️"}
                {rank === "Expert Challenger" && "🥇"}
                {rank === "Skilled Quizzer" && "🏅"}
                {rank === "Knowledge Seeker" && "🎯"}
                {rank === "Novice Challenger" && "🎮"}
              </div>
              <p className={`font-bold ${
                rank === "Legendary Master" ? "text-yellow-400" :
                rank === "Grandmaster" ? "text-indigo-400" :
                rank === "Expert Challenger" ? "text-blue-400" :
                rank === "Skilled Quizzer" ? "text-green-400" :
                rank === "Knowledge Seeker" ? "text-purple-400" :
                "text-gray-400"
              }`}>
                {rank}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {rank === "Legendary Master" && "Elite status - you've mastered the gauntlet!"}
                {rank === "Grandmaster" && "Impressive knowledge and quick thinking!"}
                {rank === "Expert Challenger" && "You're becoming a quiz expert!"}
                {rank === "Skilled Quizzer" && "You're developing impressive quiz skills!"}
                {rank === "Knowledge Seeker" && "You're on your way to mastery!"}
                {rank === "Novice Challenger" && "Everyone starts somewhere. Keep practicing!"}
              </p>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400">Keep taking gauntlet challenges to improve your rank!</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleTryAgain}
                  className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors"
                >
                  Challenge Again
                </button>
                <button
                  onClick={() => router.push('/gauntlet/ranks')}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  View All Ranks
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div className="mt-10 flex justify-center space-x-4">
        <button 
          onClick={handleTryAgain} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Gauntlet
        </button>
      </div>
    </main>
  );
} 