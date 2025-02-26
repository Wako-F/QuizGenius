"use client";

import { useState, useEffect, useCallback } from "react";
import { checkUsernameAvailability, generateUsernameVariations } from "@/lib/firebase/userUtils";
import { User } from "firebase/auth";
import debounce from "lodash/debounce";

interface UsernameStepProps {
  user: User;
  onNext: (username: string) => void;
  onBack: () => void;
}

export default function UsernameStep({ user, onNext, onBack }: UsernameStepProps) {
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Generate initial suggestions based on user's display name
  useEffect(() => {
    if (user.displayName) {
      const variations = generateUsernameVariations(user.displayName);
      setSuggestions(variations);
    }
  }, [user.displayName]);

  const checkAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username) {
        setIsAvailable(null);
        setError("");
        return;
      }

      if (username.length < 3) {
        setIsAvailable(false);
        setError("Username must be at least 3 characters long");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setIsAvailable(false);
        setError("Username can only contain letters, numbers, and underscores");
        return;
      }

      setIsChecking(true);
      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
        setError(available ? "" : "This username is already taken");
      } catch (error) {
        console.error("Error checking username availability:", error);
        setError("Error checking username availability");
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (username) {
      checkAvailability(username);
    }
  }, [username, checkAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAvailable && username) {
      onNext(username);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Choose your username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your username"
            />
            {username && (
              <div className="absolute right-3 top-2.5">
                {isChecking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                ) : isAvailable ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          {username && isAvailable && (
            <p className="mt-2 text-sm text-green-400">This username is available!</p>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !username && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Suggested usernames
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setUsername(suggestion)}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-full text-sm text-gray-300 hover:text-white transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-300 hover:text-white transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isAvailable || !username}
            className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </form>

      <div className="text-sm text-gray-400 space-y-2">
        <p>Username requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least 3 characters long</li>
          <li>Can contain letters, numbers, and underscores</li>
          <li>Must be unique</li>
          <li>Cannot be changed later</li>
        </ul>
      </div>
    </div>
  );
} 