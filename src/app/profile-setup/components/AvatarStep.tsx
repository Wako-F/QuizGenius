"use client";

import { useState } from "react";
import { avatarOptions } from "@/lib/constants/avatarOptions";
import AvatarPreview from "./AvatarPreview";
import { motion } from "framer-motion";
import { User } from "firebase/auth";

interface AvatarStepProps {
  user: User;
  onNext: (avatar: { face: number; eyes: number; mouth: number; accessory: number; colorTheme: number }) => void;
  onBack: () => void;
}

export default function AvatarStep({ user, onNext, onBack }: AvatarStepProps) {
  const [avatar, setAvatar] = useState({
    face: 0,
    eyes: 0,
    mouth: 0,
    accessory: 0,
    colorTheme: 0,
  });

  const handleRandomize = () => {
    setAvatar({
      face: Math.floor(Math.random() * avatarOptions.faces.length),
      eyes: Math.floor(Math.random() * avatarOptions.eyes.length),
      mouth: Math.floor(Math.random() * avatarOptions.mouths.length),
      accessory: Math.floor(Math.random() * avatarOptions.accessories.length),
      colorTheme: Math.floor(Math.random() * avatarOptions.colorThemes.length),
    });
  };

  const handleChange = (type: keyof typeof avatar, value: number) => {
    setAvatar(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const cycle = (current: number, max: number, forward: boolean = true) => {
    if (forward) {
      return (current + 1) % max;
    }
    return current === 0 ? max - 1 : current - 1;
  };

  return (
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
            onClick={handleRandomize}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition flex items-center gap-2"
          >
            <span>🎲</span> Randomize
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-300 hover:text-white transition"
        >
          Back
        </button>
        <button
          onClick={() => onNext(avatar)}
          className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
} 