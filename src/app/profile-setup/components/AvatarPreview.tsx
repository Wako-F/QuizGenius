"use client";

import { avatarOptions } from "@/lib/constants/avatarOptions";
import { motion } from "framer-motion";

interface AvatarPreviewProps {
  face: number;
  eyes: number;
  mouth: number;
  accessory: number;
  colorTheme: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarPreview({
  face,
  eyes,
  mouth,
  accessory,
  colorTheme,
  size = 'md'
}: AvatarPreviewProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-32 h-32 text-2xl'
  };

  const accessoryOffsets = {
    sm: '-top-3',
    md: '-top-4',
    lg: '-top-8'
  };

  const theme = avatarOptions.colorThemes[colorTheme];
  const accessoryContent = avatarOptions.accessories[accessory];

  return (
    <motion.div
      className={[
        "relative rounded-full",
        sizeClasses[size],
        theme.bg,
        theme.text,
        "flex items-center justify-center transition-colors duration-300",
        "hover:scale-105 transform transition-transform"
      ].join(" ")}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Accessory */}
        {accessoryContent !== "none" && (
          <motion.div
            className={`absolute w-full text-center ${accessoryOffsets[size]}`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {accessoryContent}
          </motion.div>
        )}
        
        {/* Face */}
        <motion.div
          key={`face-${face}-${eyes}-${mouth}-${size}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex flex-col items-center justify-center leading-none"
        >
          <motion.div
            initial={{ y: 2 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {avatarOptions.eyes[eyes]}
          </motion.div>
          <motion.div
            initial={{ y: -2 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {avatarOptions.mouths[mouth]}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
} 