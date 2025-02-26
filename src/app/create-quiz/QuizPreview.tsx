import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizPreviewProps {
  questions: Question[];
  onSave: () => void;
  onEdit: () => void;
  onTryAgain: () => void;
}

export default function QuizPreview({ questions, onSave, onEdit, onTryAgain }: QuizPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Preview Quiz</h2>
        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            className="px-4 py-2 text-gray-300 hover:text-white transition"
          >
            Generate Again
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Edit Questions
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition"
          >
            Save Quiz
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-4">
                  {question.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = option.startsWith(question.correctAnswer + ")");
                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? "border-green-500/50 bg-green-500/10"
                            : "border-gray-700 bg-gray-800/50"
                        }`}
                      >
                        <p className={`${isCorrect ? "text-green-400" : "text-gray-300"}`}>
                          {option}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400">
                    <span className="text-indigo-400 font-medium">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 