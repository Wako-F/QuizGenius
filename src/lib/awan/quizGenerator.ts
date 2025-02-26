interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizGenerationParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  numberOfQuestions: number;
  preferredStyle?: "conceptual" | "practical" | "mixed";
}

export async function generateQuiz(params: QuizGenerationParams): Promise<QuizQuestion[]> {
  try {
    const response = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate quiz");
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
} 