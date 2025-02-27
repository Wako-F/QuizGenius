"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Link from "next/link";

export default function GauntletRanksPage() {
  const router = useRouter();
  
  const ranks = [
    {
      name: "Legendary Master",
      icon: "🏆",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      pointsRequired: 1000,
      description: "Elite status achieved by only the most knowledgeable players. Your mastery of topics is truly impressive!"
    },
    {
      name: "Grandmaster",
      icon: "🎖️",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      pointsRequired: 800,
      description: "You've demonstrated exceptional understanding and quick thinking skills under pressure."
    },
    {
      name: "Expert Challenger",
      icon: "🥇",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      pointsRequired: 600,
      description: "You've honed your knowledge in various subjects and respond quickly to challenging questions."
    },
    {
      name: "Skilled Quizzer",
      icon: "🏅",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      pointsRequired: 400,
      description: "You're developing impressive quiz skills with a good balance of speed and accuracy."
    },
    {
      name: "Knowledge Seeker",
      icon: "🎯",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      pointsRequired: 200,
      description: "You're consistently improving and building a foundation of knowledge across topics."
    },
    {
      name: "Novice Challenger",
      icon: "🎮",
      color: "text-gray-400",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30",
      pointsRequired: 0,
      description: "Everyone starts somewhere! Keep practicing to improve your rank."
    }
  ];
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-400 mb-2">
              Gauntlet Ranks
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Challenge yourself in Gauntlet Mode to earn points and climb the ranks.
              The more questions you answer correctly and the longer your streak, the more points you'll earn!
            </p>
          </div>
          
          {/* Rank Cards */}
          <div className="space-y-6 mb-8">
            {ranks.map((rank, index) => (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${rank.bgColor} rounded-xl p-6 border ${rank.borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${rank.color} p-3 bg-gray-800/50 rounded-lg`}>
                    {rank.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className={`text-2xl font-bold ${rank.color}`}>
                        {rank.name}
                      </h2>
                      <div className="bg-gray-800/60 px-3 py-1 rounded-full text-sm font-medium text-white">
                        {rank.pointsRequired}+ points
                      </div>
                    </div>
                    
                    <p className="text-gray-300">
                      {rank.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Scoring Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">How Scoring Works</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-400 mb-2">Base Points</h3>
                <p className="text-gray-300">
                  Each correct answer earns you 100 base points.
                </p>
              </div>
              
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h3 className="text-lg font-medium text-indigo-400 mb-2">Streak Bonuses</h3>
                <p className="text-gray-300 mb-3">
                  Answer consecutive questions correctly to earn bonus points:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>2 in a row</span>
                    <span className="font-medium text-indigo-300">+20 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>3 in a row</span>
                    <span className="font-medium text-indigo-300">+30 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>4 in a row</span>
                    <span className="font-medium text-indigo-300">+40 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>5+ in a row</span>
                    <span className="font-medium text-indigo-300">+50 points per answer</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-400 mb-2">Speed Bonus</h3>
                <p className="text-gray-300">
                  The faster you answer, the more points you'll earn. Quick answers can earn up to 
                  30% more points per question!
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Challenge Now Button */}
          <div className="text-center">
            <Link href="/gauntlet">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-600/20"
              >
                Take the Gauntlet Challenge
              </motion.button>
            </Link>
            
            <p className="mt-4 text-gray-400">
              Challenge yourself to reach the Legendary Master rank!
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 