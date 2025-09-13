import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Test the API with a minimal request
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Hello" }
      ],
      max_tokens: 10,
    });

    return NextResponse.json({
      success: true,
      message: "Groq API is working correctly",
      model: "llama-3.3-70b-versatile",
      response: completion.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error("Groq API Test Error:", error);

    let errorMessage = "Unknown error";
    let statusCode = 500;

    if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Groq has generous free limits that reset frequently.";
      statusCode = 429;
    } else if (error.status === 401) {
      errorMessage = "Invalid API key";
      statusCode = 401;
    } else if (error.status === 403) {
      errorMessage = "Forbidden - check your account status";
      statusCode = 403;
    } else {
      errorMessage = error.message || "API request failed";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        status: error.status,
        details: error.message,
      },
      { status: statusCode }
    );
  }
}