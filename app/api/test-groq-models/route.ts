import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TEST_MODELS = [
  // ✅ Currently Working Models
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant", 
  "meta-llama/llama-guard-4-12b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound",
  "groq/compound-mini",
  
  // ❌ Deprecated Models (for testing)
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768", 
  "gemma2-9b-it",
  "llama-3.1-70b-versatile"
];

export async function GET() {
  const results = [];
  
  for (const model of TEST_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      });
      
      results.push({
        model,
        status: "✅ Working",
        response: completion.choices[0]?.message?.content || "No response"
      });
    } catch (error: any) {
      results.push({
        model,
        status: "❌ Failed",
        error: error.message || "Unknown error"
      });
    }
  }
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    models: results
  });
}