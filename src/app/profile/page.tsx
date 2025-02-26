"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarPreview from "../profile-setup/components/AvatarPreview";
import { avatarOptions } from "@/lib/constants/avatarOptions";
import { learningPreferences } from "@/lib/constants/learningPreferences";
import { UserProfile, updateUserProfile } from "@/lib/firebase/userUtils";
import Link from "next/link";
import Header from "@/components/Header";

type EditSection = "avatar" | "preferences" | null;

type Preferences = NonNullable<UserProfile["preferences"]>;

const defaultAvatar = {
  face: 0,
  eyes: 0,
  mouth: 0,
  accessory: 0,
  colorTheme: 0
};

export default function Profile() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [avatar, setAvatar] = useState(userProfile?.avatar || defaultAvatar);
  const [preferences, setPreferences] = useState<Preferences>(userProfile?.preferences || {
    difficulty: "medium",
    quizLength: "10-20",
    timeLimit: "standard",
    interests: []
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleSaveAvatar = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, { avatar });
      await refreshUserProfile();
      setEditingSection(null);
    } catch (error) {
      console.error("Error saving avatar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, { preferences });
      await refreshUserProfile();
      setEditingSection(null);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (type: keyof typeof avatar, value: number) => {
    setAvatar(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const cycle = (current: number, max: number, forward: boolean = true) => {
    if (forward) {
      return (current + 1) % max;
    }
    return current === 0 ? max - 1 : current - 1;
  };

  const formatDate = (date: any) => {
    if (!date) return "Unknown";
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 ring-4 ring-gray-700 mx-auto mb-6">
                <AvatarPreview {...(userProfile.avatar || defaultAvatar)} size="lg" />
              </div>
              <button
                onClick={() => setEditingSection("avatar")}
                className="absolute bottom-4 right-0 p-2 bg-gray-800 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {userProfile.username}
            </h1>
            <p className="text-gray-400">
              Member since {formatDate(userProfile.createdAt)}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">
                {userProfile.stats?.quizzesTaken || 0}
              </div>
              <div className="text-sm text-gray-400">Quizzes Taken</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">
                {userProfile.stats?.quizzesCreated || 0}
              </div>
              <div className="text-sm text-gray-400">Quizzes Created</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">
                {userProfile.stats?.averageScore || 0}%
              </div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">
                {userProfile.stats?.learningStreak || 0}
              </div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-white">Quiz Preferences</h2>
                <p className="text-gray-400 text-sm mt-1">Customize your quiz experience</p>
              </div>
              <button
                onClick={() => setEditingSection("preferences")}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Difficulty Level</div>
                <div className="text-white font-medium capitalize">
                  {userProfile.preferences?.difficulty || "Medium"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Quiz Length</div>
                <div className="text-white font-medium">
                  {userProfile.preferences?.quizLength || "10-20"} questions
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Time Limit</div>
                <div className="text-white font-medium capitalize">
                  {userProfile.preferences?.timeLimit || "Standard"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.preferences?.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <AnimatePresence>
        {editingSection === "avatar" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-8"
            onClick={() => setEditingSection(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-gray-700 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Edit Avatar</h2>
              
              <div className="space-y-8">
                {/* Avatar Preview */}
                <div className="flex justify-center">
                  <AvatarPreview {...avatar} size="lg" />
                </div>

                {/* Customization Controls */}
                <div className="space-y-6">
                  {/* Eyes Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Eyes</label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleChange("eyes", cycle(avatar.eyes, avatarOptions.eyes.length, false))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        ←
                      </button>
                      <div className="text-2xl min-w-[60px] text-center">
                        {avatarOptions.eyes[avatar.eyes]}
                      </div>
                      <button
                        onClick={() => handleChange("eyes", cycle(avatar.eyes, avatarOptions.eyes.length))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Mouth Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mouth</label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleChange("mouth", cycle(avatar.mouth, avatarOptions.mouths.length, false))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        ←
                      </button>
                      <div className="text-2xl min-w-[60px] text-center">
                        {avatarOptions.mouths[avatar.mouth]}
                      </div>
                      <button
                        onClick={() => handleChange("mouth", cycle(avatar.mouth, avatarOptions.mouths.length))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Accessory Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Accessory</label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleChange("accessory", cycle(avatar.accessory, avatarOptions.accessories.length, false))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        ←
                      </button>
                      <div className="text-2xl min-w-[60px] text-center">
                        {avatarOptions.accessories[avatar.accessory]}
                      </div>
                      <button
                        onClick={() => handleChange("accessory", cycle(avatar.accessory, avatarOptions.accessories.length))}
                        className="p-2 hover:bg-gray-700 rounded-full transition"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Color Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
                    <div className="flex flex-wrap justify-center gap-2">
                      {avatarOptions.colorThemes.map((theme, index) => (
                        <button
                          key={theme.name}
                          onClick={() => handleChange("colorTheme", index)}
                          className={`w-8 h-8 rounded-full ${theme.bg} ${
                            avatar.colorTheme === index ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800" : ""
                          }`}
                          title={theme.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Randomize Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setAvatar({
                          face: Math.floor(Math.random() * avatarOptions.faces.length),
                          eyes: Math.floor(Math.random() * avatarOptions.eyes.length),
                          mouth: Math.floor(Math.random() * avatarOptions.mouths.length),
                          accessory: Math.floor(Math.random() * avatarOptions.accessories.length),
                          colorTheme: Math.floor(Math.random() * avatarOptions.colorThemes.length),
                        });
                      }}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition flex items-center gap-2"
                    >
                      <span>🎲</span> Randomize
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingSection === "preferences" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-8"
            onClick={() => setEditingSection(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-gray-700 relative my-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Edit Preferences</h2>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {learningPreferences.difficulties.map((difficulty) => (
                      <button
                        key={difficulty.value}
                        type="button"
                        onClick={() => setPreferences(prev => ({
                          ...prev,
                          difficulty: difficulty.value as Preferences["difficulty"]
                        }))}
                        className={`p-3 rounded-xl border transition-all ${
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Quiz Length
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {learningPreferences.quizLengths.map((length) => (
                      <button
                        key={length.value}
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, quizLength: length.value }))}
                        className={`p-3 rounded-xl border transition-all ${
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Time Limit
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {learningPreferences.timeLimits.map((timeLimit) => (
                      <button
                        key={timeLimit.value}
                        type="button"
                        onClick={() => setPreferences(prev => ({
                          ...prev,
                          timeLimit: timeLimit.value as Preferences["timeLimit"]
                        }))}
                        className={`p-3 rounded-xl border transition-all ${
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Areas of Interest <span className="text-gray-500">(Select at least 3)</span>
                  </label>
                  <div className="space-y-3">
                    {learningPreferences.interests.map((category) => (
                      <div
                        key={category.category}
                        className="border border-gray-700 rounded-xl overflow-hidden"
                      >
                        <div className="p-3 bg-gray-800/30">
                          <div className="font-medium text-white">{category.category}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {category.topics.map((topic) => (
                              <button
                                key={topic}
                                onClick={() => {
                                  setPreferences(prev => ({
                                    ...prev,
                                    interests: prev.interests.includes(topic)
                                      ? prev.interests.filter(t => t !== topic)
                                      : [...prev.interests, topic]
                                  }));
                                }}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                  preferences.interests.includes(topic)
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                }`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700 bg-gray-800">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving || preferences.interests.length < 3}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
} 