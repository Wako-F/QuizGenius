"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UsernameStep from "./components/UsernameStep";
import AvatarStep from "./components/AvatarStep";
import PreferencesStep from "./components/PreferencesStep";
import CompleteStep from "./components/CompleteStep";
import { createUserProfile, UserProfile } from "@/lib/firebase/userUtils";

type SetupStep = "welcome" | "username" | "avatar" | "preferences" | "complete";

type FormData = {
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

export default function ProfileSetup() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>("welcome");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    avatar: {
      face: 0,
      eyes: 0,
      mouth: 0,
      accessory: 0,
      colorTheme: 0
    },
    preferences: {
      difficulty: "medium",
      quizLength: "10-20",
      timeLimit: "standard",
      interests: []
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const steps = {
    welcome: {
      title: "Welcome to QuizGenius! 👋",
      subtitle: "Let's set up your profile in a few quick steps"
    },
    username: {
      title: "Choose Your Username",
      subtitle: "This is how other learners will know you"
    },
    avatar: {
      title: "Create Your Avatar",
      subtitle: "Express yourself with a unique look"
    },
    preferences: {
      title: "Set Your Preferences",
      subtitle: "Customize your learning experience"
    },
    complete: {
      title: "You're All Set!",
      subtitle: "Your profile is ready to go"
    }
  };

  const getProgressWidth = () => {
    switch (currentStep) {
      case "welcome": return "20%";
      case "username": return "40%";
      case "avatar": return "60%";
      case "preferences": return "80%";
      case "complete": return "100%";
      default: return "0%";
    }
  };

  const handleUsernameSubmit = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    setCurrentStep("avatar");
  };

  const handleAvatarSubmit = (avatar: typeof formData.avatar) => {
    setFormData(prev => ({ ...prev, avatar }));
    setCurrentStep("preferences");
  };

  const handlePreferencesSubmit = async (preferences: typeof formData.preferences) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create user profile in Firestore
      await createUserProfile(user, {
        ...formData,
        preferences,
      });
      setFormData(prev => ({ ...prev, preferences }));
      setCurrentStep("complete");
    } catch (error) {
      console.error("Error creating user profile:", error);
      setError("There was an error saving your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: getProgressWidth() }}
        />
      </div>

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full">
          {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-400 text-lg">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Step Content */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              {currentStep === "welcome" && (
                <WelcomeStep 
                  user={user}
                  onNext={() => setCurrentStep("username")}
                />
              )}
              {currentStep === "username" && (
                <UsernameStep
                  user={user}
                  onNext={handleUsernameSubmit}
                  onBack={() => setCurrentStep("welcome")}
                />
              )}
              {currentStep === "avatar" && (
                <AvatarStep
                  user={user}
                  onNext={handleAvatarSubmit}
                  onBack={() => setCurrentStep("username")}
                />
              )}
              {currentStep === "preferences" && (
                <PreferencesStep
                  user={user}
                  initialPreferences={formData.preferences}
                  onNext={handlePreferencesSubmit}
                  onBack={() => setCurrentStep("avatar")}
                />
              )}
              {currentStep === "complete" && (
                <CompleteStep
                  user={user}
                  profile={formData}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function WelcomeStep({ user, onNext }: { user: any; onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 rounded-full bg-indigo-500/20 mx-auto mb-6 flex items-center justify-center">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-20 h-20 rounded-full"
          />
        ) : (
          <span className="text-4xl">
            {user.displayName?.[0] || user.email?.[0]}
          </span>
        )}
      </div>
      <h3 className="text-xl text-white mb-2">
        Hi, {user.displayName || user.email}!
      </h3>
      <p className="text-gray-400 mb-8">
        We're excited to have you join our community of learners. Let's personalize your experience!
      </p>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition transform hover:scale-105"
      >
        Let's Get Started →
      </button>
    </div>
  );
} 