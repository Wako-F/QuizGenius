# QuizGenius

An AI-powered quiz generation platform that allows users to create custom quizzes on any topic.

## Overview

QuizGenius empowers users to generate dynamic, personalized quizzes instantly using AI, tailored to their interests and knowledge level. The application leverages large language models (LLMs) to produce on-demand quizzes with customization options, interactivity, and user management features.

## Features

- **AI-Generated Quizzes:** Create quizzes on any topic with customized difficulty levels
- **User Authentication:** Sign in with various authentication methods
- **Quiz Management:** Save, view, and take quizzes
- **Profile Setup:** Customize user profiles and preferences
- **Detailed Analytics:** View quiz attempt history and performance
- **Quiz Audit:** Review detailed information about each quiz question and explanation

## Technologies Used

- **Frontend:** React with Next.js 14 App Router and TailwindCSS
- **Backend:** Firebase Auth, Storage, and Firestore Database
- **AI Integration:** OpenAI, Anthropic, and Replicate using Vercel's AI SDK

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your `.env.local` file with the necessary API keys
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js app router for all pages
- `components/` - Reusable UI components
- `lib/` - Utility functions, hooks, and Firebase configuration
- `types/` - TypeScript type definitions