"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarPreview from "@/app/profile-setup/components/AvatarPreview";

export default function Header() {
  const { user, userProfile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const trigger = document.getElementById('user-dropdown-trigger');
      if (
        dropdown &&
        trigger &&
        !dropdown.contains(event.target as Node) &&
        !trigger.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold relative overflow-hidden transition-all duration-300 group-hover:scale-110">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative z-10">Q</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            QuizGenius
          </h1>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                id="user-dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition group bg-gray-800/50 rounded-full pr-4 pl-1 py-1 border border-gray-700/50 hover:border-indigo-500/50"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50 transition-all">
                  {userProfile?.avatar ? (
                    <AvatarPreview {...userProfile.avatar} size="sm" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {userProfile?.username || user.email?.split('@')[0]}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15 }}
                    id="user-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 py-1 z-50"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 ring-2 ring-gray-700">
                          {userProfile?.avatar ? (
                            <AvatarPreview {...userProfile.avatar} size="md" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-lg font-medium">
                                {user.email?.[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {userProfile?.username || user.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="bg-gray-700/30 rounded-lg p-2">
                          <p className="text-gray-400">Quizzes Taken</p>
                          <p className="text-white font-medium">{userProfile?.stats?.quizzesTaken || 0}</p>
                        </div>
                        <div className="bg-gray-700/30 rounded-lg p-2">
                          <p className="text-gray-400">Avg. Score</p>
                          <p className="text-white font-medium">{userProfile?.stats?.averageScore || '-'}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <Link
                        href="/stats"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        My Stats
                      </Link>
                      <Link
                        href="/preferences"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Preferences
                      </Link>
                    </div>

                    <div className="border-t border-gray-700 pt-1 mt-1">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 text-sm w-full text-red-400 hover:text-red-300 hover:bg-gray-700/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 