# Getting Started with QuizGenius

This guide will help you get the QuizGenius application up and running on your local machine.

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- A Firebase account (for authentication and database)

## Installation

1. Clone the repository or download the source code.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Rename `.env.local.example` to `.env.local` if you haven't already
   - Fill in your Firebase credentials and API keys

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Cleanup

After consolidating the project, there may be temporary files that need to be removed:

1. Stop the development server
2. Run the cleanup script:
   ```bash
   ./cleanup.ps1
   ```

## Features

- Create AI-generated quizzes on any topic
- Customize difficulty levels and number of questions
- Save quizzes to your profile
- Review quiz attempts and performance metrics
- View detailed explanations for answers

## Troubleshooting

- If you encounter any issues with the API, make sure your API keys are correctly set in the `.env.local` file
- For Firebase authentication issues, verify your Firebase configuration settings

## Additional Resources

- [README.md](./README.md) - Project overview
- [Product Requirements Document](./Product%20Requirements%20Document%20(PRD).txt) - Detailed specifications 