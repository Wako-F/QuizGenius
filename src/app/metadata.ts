import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuizGenius - AI-Powered Quiz Platform",
  description: "Create personalized quizzes instantly using AI. Perfect for students, educators, and lifelong learners.",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  },
}; 