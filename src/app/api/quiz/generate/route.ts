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

For each question, provide:
1. A clear question
2. Four options labeled as A, B, C, D
3. The correct answer letter
4. A brief explanation

Format your response as a valid JSON array of objects. Here's an example of the expected format:
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

Generate ${numberOfQuestions} questions in this exact format. Make sure the response is a valid JSON array.`;

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
      // Try to extract JSON if it's wrapped in markdown or other text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse questions:", e);
      throw new Error("Failed to parse the generated questions");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format: questions should be a non-empty array");
    }

    // Validate question format
    questions.forEach((q, i) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.explanation) {
        throw new Error(`Invalid question format at index ${i}`);
      }
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
} 