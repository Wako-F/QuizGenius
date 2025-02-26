"use client";

import { motion } from "framer-motion";
import { User } from "firebase/auth";
import { UserProfile } from "@/lib/firebase/userUtils";
import AvatarPreview from "./AvatarPreview";
import Link from "next/link";

interface CompleteStepProps {
  user: User;
  profile: {
    username: string;
    avatar: {
      face: number;
      eyes: number;
      mouth: number;
      accessory: number;
      colorTheme: number;
    };
    preferences: NonNullable<UserProfile["preferences"]>;
  };
}

export default function CompleteStep({ user, profile }: CompleteStepProps) {
  return (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center"
      >
        <motion.svg
          className="w-12 h-12 text-white"
          viewBox="0 0 24 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            d="M20 6L9 17l-5-5"
          />
        </motion.svg>
      </motion.div>

      {/* Profile Summary */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-center mb-4">
            <AvatarPreview {...profile.avatar} size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Welcome, {profile.username}!
          </h3>
          <p className="text-gray-400">
            Your profile is all set up and ready to go.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 max-w-sm mx-auto"
        >
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-sm text-gray-400">Difficulty</div>
            <div className="text-white font-medium mt-1 capitalize">
              {profile.preferences.difficulty}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-sm text-gray-400">Quiz Length</div>
            <div className="text-white font-medium mt-1">
              {profile.preferences.quizLength} questions
            </div>
          </div>
        </motion.div>

        {/* Interests Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <div className="text-sm text-gray-400">Your Interests</div>
          <div className="flex flex-wrap justify-center gap-2">
            {profile.preferences.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="pt-6 space-y-4"
      >
        <Link
          href="/create-quiz"
          className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition transform hover:scale-105"
        >
          Create Your First Quiz →
        </Link>
        <div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 text-gray-400 hover:text-white transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 