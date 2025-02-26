"use client";

import { useState } from "react";
import { learningPreferences } from "@/lib/constants/learningPreferences";
import { motion } from "framer-motion";
import { User } from "firebase/auth";
import { UserProfile } from "@/lib/firebase/userUtils";

interface PreferencesStepProps {
  user: User;
  initialPreferences: NonNullable<UserProfile["preferences"]>;
  onNext: (preferences: NonNullable<UserProfile["preferences"]>) => void;
  onBack: () => void;
}

export default function PreferencesStep({
  user,
  initialPreferences,
  onNext,
  onBack,
}: PreferencesStepProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(preferences);
  };

  const toggleInterest = (topic: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(topic)
        ? prev.interests.filter(t => t !== topic)
        : [...prev.interests, topic],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Difficulty Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Preferred Difficulty
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {learningPreferences.difficulties.map((difficulty) => (
            <button
              key={difficulty.value}
              type="button"
              onClick={() => setPreferences(prev => ({ ...prev, difficulty: difficulty.value }))}
              className={`p-4 rounded-xl border transition-all ${
                preferences.difficulty === difficulty.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <div className="font-medium text-white">{difficulty.label}</div>
              <div className="text-sm text-gray-400 mt-1">{difficulty.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Length Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Quiz Length
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {learningPreferences.quizLengths.map((length) => (
            <button
              key={length.value}
              type="button"
              onClick={() => setPreferences(prev => ({ ...prev, quizLength: length.value }))}
              className={`p-4 rounded-xl border transition-all ${
                preferences.quizLength === length.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <div className="font-medium text-white">{length.label}</div>
              <div className="text-sm text-gray-400 mt-1">{length.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Limit Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Time Limit Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {learningPreferences.timeLimits.map((timeLimit) => (
            <button
              key={timeLimit.value}
              type="button"
              onClick={() => setPreferences(prev => ({ ...prev, timeLimit: timeLimit.value }))}
              className={`p-4 rounded-xl border transition-all ${
                preferences.timeLimit === timeLimit.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <div className="font-medium text-white">{timeLimit.label}</div>
              <div className="text-sm text-gray-400 mt-1">{timeLimit.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interests Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Areas of Interest <span className="text-gray-500">(Select at least 3)</span>
        </label>
        <div className="space-y-3">
          {learningPreferences.interests.map((category) => (
            <motion.div
              key={category.category}
              className="border border-gray-700 rounded-xl overflow-hidden"
              animate={{ height: expandedCategory === category.category ? "auto" : "64px" }}
            >
              <button
                type="button"
                onClick={() => setExpandedCategory(
                  expandedCategory === category.category ? null : category.category
                )}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition"
              >
                <span className="font-medium text-white">{category.category}</span>
                <span className="text-gray-400">
                  {preferences.interests.filter(t => category.topics.includes(t)).length} selected
                </span>
              </button>
              {expandedCategory === category.category && (
                <div className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleInterest(topic)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          preferences.interests.includes(topic)
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-300 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={preferences.interests.length < 3}
          className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </form>
  );
} 