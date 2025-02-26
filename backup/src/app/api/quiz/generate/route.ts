import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.AWAN_LLM_API_KEY;
    console.log("API Key available:", !!apiKey);

    if (!apiKey) {
      console.error("Environment variable AWAN_LLM_API_KEY is not set");
      return NextResponse.json(
        { error: "API configuration error. Please check server configuration." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topic, difficulty, numberOfQuestions, preferredStyle } = body;

    console.log("Generating quiz for topic:", topic);

    const prompt = `You are a quiz generator. Create a ${difficulty} difficulty quiz about ${topic} with ${numberOfQuestions} multiple choice questions.

Each question MUST have EXACTLY:
1. A clear question
2. EXACTLY four options labeled as A, B, C, D
3. The correct answer must be one of: A, B, C, or D
4. A brief explanation

Format your response as a valid JSON array of objects with this EXACT format:
[
  {
    "question": "What is the capital of France?",
    "options": [
      "A) London",
      "B) Paris",
      "C) Berlin",
      "D) Madrid"
    ],
    "correctAnswer": "B",
    "explanation": "Paris is the capital and largest city of France."
  }
]

IMPORTANT: 
- Each question MUST have EXACTLY 4 options
- Options MUST be labeled A), B), C), D)
- correctAnswer MUST be one of: A, B, C, D
- Generate ${numberOfQuestions} questions in this exact format
- Response must be a valid JSON array`;

    const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-70B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator that creates educational multiple-choice questions. Always respond with valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AwanLLM API error:", errorData);
      throw new Error(`AwanLLM API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data.choices[0].message.content);

    let questions;
    try {
      const content = data.choices[0].message.content;
      // Clean up the content
      const cleanedContent = content
        .replace(/```json\s*|\s*```/g, '') // Remove markdown code blocks
        .replace(/,(\s*[}\]])/g, '$1')     // Remove trailing commas
        .replace(/\n\s*"explanation":\s*"([^"]*?)(?:\n|$)/g, (match, p1) => 
          `"explanation": "${p1.replace(/\n/g, ' ').trim()}"`) // Fix multiline explanations
        .replace(/,\s*]/g, ']');           // Remove trailing commas in arrays

      // Try to extract JSON if it's wrapped in other text
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(cleanedContent);
      }
    } catch (e) {
      console.error("Failed to parse questions:", e);
      throw new Error("Failed to parse the generated questions");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format: questions should be a non-empty array");
    }

    // Fix and validate questions
    const validQuestions = questions.map((q, i) => {
      // Ensure question has all required fields
      if (!q.question || !Array.isArray(q.options) || !q.correctAnswer || !q.explanation) {
        throw new Error(`Invalid question format at index ${i}: missing required fields`);
      }

      // Ensure at least 2 options
      if (q.options.length < 2) {
        throw new Error(`Invalid question format at index ${i}: must have at least 2 options`);
      }

      // Ensure options are properly labeled
      const validOptions = q.options.map((opt, j) => {
        const label = String.fromCharCode(65 + j); // A, B, C, D
        if (!opt.startsWith(`${label})`)) {
          return `${label}) ${opt.replace(/^[A-D]\)?\s*/, '')}`;
        }
        return opt;
      });

      // Ensure correctAnswer is valid
      let validAnswer = q.correctAnswer.trim().toUpperCase();
      if (!validOptions.some(opt => opt.startsWith(`${validAnswer})`))) {
        // If invalid answer, default to the first option
        validAnswer = 'A';
      }

      return {
        question: q.question,
        options: validOptions,
        correctAnswer: validAnswer,
        explanation: q.explanation
      };
    });

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
} 