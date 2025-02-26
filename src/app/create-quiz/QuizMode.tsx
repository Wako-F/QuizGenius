import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { QuizQuestion } from "@/lib/firebase/userUtils";

interface QuizModeProps {
  questions: QuizQuestion[];
  topic: string;
  difficulty: string;
  onComplete: (stats: QuizStats) => void;
  savedQuizId?: string; // Optional ID if this is a saved quiz
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[]; // Add questions to stats
}

export default function QuizMode({ questions, topic, difficulty, onComplete, savedQuizId }: QuizModeProps) {
  const { userProfile } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Set time based on difficulty and user preferences
    const baseTime = userProfile?.preferences?.timeLimit === "relaxed" ? 90 : 60;
    const multiplier = {
      easy: 1,
      medium: 0.8,
      hard: 0.6,
      expert: 0.5
    }[difficulty] || 0.8;
    return Math.round(baseTime * questions.length * multiplier);
  });
  const [startTime] = useState(Date.now());

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleQuizComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer && !isAnswerSubmitted) {
      const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
      setIsAnswerSubmitted(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onComplete({
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent,
      topic,
      difficulty,
      questions // Pass the questions back
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-gray-400 mt-1">
            Topic: {topic} • Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${timeLeft < 30 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-gray-400 mt-1">Time Remaining</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
      >
        <h3 className="text-xl font-medium text-white mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const optionLetter = option.charAt(0);
            const isSelected = selectedAnswer === optionLetter;
            const isCorrect = isAnswerSubmitted && optionLetter === currentQuestion.correctAnswer;
            const isWrong = isAnswerSubmitted && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(optionLetter)}
                disabled={isAnswerSubmitted}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? isAnswerSubmitted
                      ? isCorrect
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-red-500 bg-red-500/10 text-red-400"
                      : "border-indigo-500 bg-indigo-500/10 text-white"
                    : isAnswerSubmitted && isCorrect
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700"
          >
            <p className="text-gray-300">
              <span className="text-indigo-400 font-medium">Explanation: </span>
              {currentQuestion.explanation}
            </p>
          </motion.div>
        )}

        <div className="mt-6 flex justify-end">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-all"
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {correctAnswers}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
          </div>
          <p className="text-gray-400 text-sm">Correct Answers</p>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {Math.round((correctAnswers / (currentQuestionIndex + (isAnswerSubmitted ? 1 : 0))) * 100) || 0}%
          </div>
          <p className="text-gray-400 text-sm">Accuracy</p>
        </div>
      </div>
    </motion.div>
  );
} 