"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { QuizQuestion } from "@/lib/firebase/userUtils";
import Link from "next/link";
import { GauntletScore } from "@/lib/types/user";
import { ensureUserProfileFields } from "@/lib/firebase/userUtils";

// Function to get available topics
const getAvailableTopics = async (): Promise<string[]> => {
  // For simplicity, return a static list of topics
  return [
    "General Knowledge",
    "Science",
    "History",
    "Geography",
    "Entertainment",
    "Sports",
    "Technology"
  ];
};

export default function GauntletPage() {
  const router = useRouter();
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  
  // State variables
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium");
  const [isStartingGauntlet, setIsStartingGauntlet] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [topScores, setTopScores] = useState<GauntletScore[]>([]);
  
  // Popular topics - used as fallback
  const popularTopics = [
    "General Knowledge",
    "Science",
    "History", 
    "Geography",
    "Entertainment",
    "Sports",
    "Technology"
  ];
  
  // Load topics when component mounts
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const fetchedTopics = await getAvailableTopics();
        setTopics(['all', ...fetchedTopics]);
        setLoadingTopics(false);
      } catch (error) {
        console.error("Failed to load topics:", error);
        setLoadingTopics(false);
      }
    };
    
    loadTopics();
  }, []);
  
  // Refresh user profile when component mounts
  useEffect(() => {
    console.log("GauntletPage - Component mounted, user:", !!user);
    if (user) {
      console.log("GauntletPage - Refreshing user profile");
      
      // First ensure all required fields exist in the profile
      ensureUserProfileFields(user.uid).then(fieldsUpdated => {
        console.log("Profile fields check complete, updated:", fieldsUpdated);
        
        // Then refresh the user profile
        return refreshUserProfile();
      }).then(() => {
        console.log("GauntletPage - User profile refreshed");
      }).catch(error => {
        console.error("Error processing user profile:", error);
      });
      
      // Check if we're coming from results page and force a full page refresh if needed
      if (typeof window !== 'undefined') {
        const fromResults = sessionStorage.getItem('fromGauntletResults');
        if (fromResults === 'true') {
          console.log("Coming from results page, forcing full refresh");
          sessionStorage.removeItem('fromGauntletResults');
          window.location.reload();
        }
      }
    }
  }, [user, refreshUserProfile]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);
  
  // Function to get and update top scores
  const getAndUpdateTopScores = () => {
    console.log("Gauntlet page - userProfile:", userProfile);
    console.log("Gauntlet page - gauntletScores:", userProfile?.gauntletScores);
    
    if (!userProfile?.gauntletScores) {
      console.log("No gauntlet scores found");
      setTopScores([]);
      return;
    }
    
    // Handle both array and object formats of gauntletScores
    let scoresToSort: GauntletScore[] = [];
    
    if (Array.isArray(userProfile.gauntletScores)) {
      // Already in correct format
      scoresToSort = [...userProfile.gauntletScores];
      console.log("gauntletScores is an array with", scoresToSort.length, "entries");
    } else {
      // It's an object/map, try to extract scores
      console.log("gauntletScores is an object, attempting to extract scores");
      try {
        const objectScores = userProfile.gauntletScores as any;
        
        // Iterate through all keys (like "general knowledge")
        Object.keys(objectScores).forEach(topicKey => {
          if (Array.isArray(objectScores[topicKey])) {
            objectScores[topicKey].forEach((scoreObj: any) => {
              if (scoreObj && typeof scoreObj === 'object' && scoreObj.score) {
                // Create a compatible score object
                const score: GauntletScore = {
                  id: scoreObj.id || "legacy-" + Math.random().toString(36).substring(7),
                  topic: topicKey,
                  difficulty: scoreObj.difficulty || "medium",
                  score: scoreObj.score || 0,
                  correctAnswers: scoreObj.correctAnswers || 0,
                  questionsAnswered: scoreObj.totalQuestions || scoreObj.questionsAnswered || 0,
                  strikes: scoreObj.strikes || 0,
                  bestStreak: scoreObj.bestStreak || 0,
                  timeSpent: scoreObj.timeSpent || 0,
                  date: scoreObj.date || Date.now()
                };
                scoresToSort.push(score);
              }
            });
          }
        });
        
        console.log("Extracted", scoresToSort.length, "scores from object structure");
        
        // If we've fixed this profile, trigger automatic profile repair
        if (scoresToSort.length > 0 && user) {
          console.log("Attempting to repair profile gauntletScores structure");
          ensureUserProfileFields(user.uid).then(updated => {
            if (updated) {
              console.log("Profile structure repaired");
              refreshUserProfile();
            }
          }).catch(error => {
            console.error("Failed to repair profile:", error);
          });
        }
      } catch (error) {
        console.error("Error processing gauntletScores object:", error);
      }
    }
    
    if (scoresToSort.length === 0) {
      setTopScores([]);
      return;
    }
    
    // Sort gauntlet scores by score in descending order and take top 10
    const sortedScores = scoresToSort
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      
    console.log("Gauntlet page - topScores:", sortedScores);
    setTopScores(sortedScores);
  };
  
  // Update top scores when userProfile changes
  useEffect(() => {
    if (userProfile) {
      getAndUpdateTopScores();
    }
  }, [userProfile]);

  // Loading state
  if (loadingTopics || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Function to start a gauntlet challenge
  const startGauntlet = async () => {
    setIsStartingGauntlet(true);
    
    const topicToUse = selectedTopic === "custom" ? customTopic : selectedTopic;
    
    if (!topicToUse) {
      setIsStartingGauntlet(false);
      return;
    }
    
    try {
      // Clear any previously seen questions
      localStorage.removeItem('gauntletSeenQuestions');
      
      // Generate questions directly with the API
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topicToUse,
          difficulty: difficulty,
          numberOfQuestions: 15, // Initial batch of questions
          preferredStyle: "mixed",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }
      
      const data = await response.json();
      
      // Store the generated questions in localStorage so GauntletChallenge can access them
      localStorage.setItem('gauntletQuestions', JSON.stringify(data.questions));
      localStorage.setItem('gauntletTopic', topicToUse);
      localStorage.setItem('gauntletDifficulty', difficulty);
      
      // Navigate to the challenge page
      router.push('/gauntlet/challenge');
    } catch (error) {
      console.error(error);
    } finally {
      setIsStartingGauntlet(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-yellow-400">⚡</span> Gauntlet Mode
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Test your knowledge against the clock with our most intense challenge. 
            Answer as many questions as you can before time runs out or you get three strikes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Start a Gauntlet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Start a Gauntlet Challenge</h2>
              
              {/* Topic Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Select a Topic</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {topics.map((topic, index) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                        selectedTopic === topic
                        ? 'bg-indigo-500/30 border-indigo-500 text-white border'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 border hover:bg-gray-700/50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTopic("custom")}
                    className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                      selectedTopic === "custom"
                      ? 'bg-indigo-500/30 border-indigo-500 text-white border'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 border hover:bg-gray-700/50'
                    }`}
                  >
                    Custom Topic
                  </button>
                </div>
                
                {selectedTopic === "custom" && (
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter any topic..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                )}
              </div>
              
              {/* Difficulty Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Select Difficulty</h3>
                <div className="grid grid-cols-4 gap-3">
                  {["easy", "medium", "hard", "expert"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level as any)}
                      className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                        difficulty === level
                        ? 'bg-indigo-500/30 border-indigo-500 text-white border'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 border hover:bg-gray-700/50'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rules Section */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">How Gauntlet Mode Works</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 text-xl">⏱️</span>
                    <div>
                      <span className="text-white font-medium">Time Limit:</span>
                      <p className="text-gray-300">You have 3 minutes to answer as many questions as you can.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 text-xl">❌</span>
                    <div>
                      <span className="text-white font-medium">Three Strikes:</span>
                      <p className="text-gray-300">Get three answers wrong and your challenge ends.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 text-xl">🔄</span>
                    <div>
                      <span className="text-white font-medium">Unlimited Questions:</span>
                      <p className="text-gray-300">Questions keep coming until time runs out or you get three strikes.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 text-xl">🎯</span>
                    <div>
                      <span className="text-white font-medium">Score Points:</span>
                      <p className="text-gray-300">
                        Each correct answer earns points. Build streaks for bonus points!
                        <Link href="/gauntlet/ranks" className="text-indigo-400 hover:text-indigo-300 ml-1 inline-block">
                          View rank details →
                        </Link>
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Start Button */}
              <button
                onClick={startGauntlet}
                disabled={!selectedTopic || (selectedTopic === "custom" && !customTopic) || isStartingGauntlet}
                className={`w-full py-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                  !selectedTopic || (selectedTopic === "custom" && !customTopic) || isStartingGauntlet
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isStartingGauntlet ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Preparing Challenge...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">⚡</span>
                    <span>Start Gauntlet Challenge</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your High Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-yellow-400">🏆</span> Your High Scores
                </h2>
              </div>
              
              {topScores.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {topScores.map((score, index) => (
                    <div 
                      key={score.topic} 
                      className={`px-6 py-4 ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-yellow-400 text-lg">👑</span>}
                            <p className="text-white font-medium">{score.topic}</p>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            {score.correctAnswers} correct • {score.strikes} strikes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-400 font-bold text-2xl">{score.score}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(score.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-400">You haven't completed any Gauntlet challenges yet.</p>
                </div>
              )}
              
              <div className="px-6 py-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  <span className="text-indigo-400">Tip:</span> If you don't see your latest scores, try completing a challenge and returning to this page.
                </p>
              </div>
            </motion.div>

            {/* Achievement Ranks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 px-6 py-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Achievement Ranks</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-yellow-400 text-2xl">🏆</div>
                  <div>
                    <p className="text-yellow-400 font-bold">Legendary Master</p>
                    <p className="text-gray-400 text-sm">Score 1000+ points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-indigo-400 text-2xl">🎖️</div>
                  <div>
                    <p className="text-indigo-400 font-bold">Grandmaster</p>
                    <p className="text-gray-400 text-sm">Score 800+ points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-blue-400 text-2xl">🥇</div>
                  <div>
                    <p className="text-blue-400 font-bold">Expert Challenger</p>
                    <p className="text-gray-400 text-sm">Score 600+ points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-green-400 text-2xl">🏅</div>
                  <div>
                    <p className="text-green-400 font-bold">Skilled Quizzer</p>
                    <p className="text-gray-400 text-sm">Score 400+ points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-purple-400 text-2xl">🎯</div>
                  <div>
                    <p className="text-purple-400 font-bold">Knowledge Seeker</p>
                    <p className="text-gray-400 text-sm">Score 200+ points</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 