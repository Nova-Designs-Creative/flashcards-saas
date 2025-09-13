import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { CreateFlashcardSetRequest, CreateFlashcardSetResponse } from "@/lib/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// List of available models to try (in order of preference)
const AVAILABLE_MODELS = [
  "llama-3.3-70b-versatile",  // Best quality - newest 70B model
  "openai/gpt-oss-120b",      // Largest model available
  "llama-3.1-8b-instant",     // Fastest model
  "openai/gpt-oss-20b",       // Good balance of speed/quality
];

async function createChatCompletion(messages: Array<{ role: string; content: string }>, systemPrompt: string, userPrompt: string) {
  let lastError: unknown;
  
  for (const model of AVAILABLE_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      return completion;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Model ${model} failed:`, errorMessage);
      lastError = error;
      
      // Type guard for API errors
      const isAPIError = (err: unknown): err is { status?: number; message?: string } => {
        return typeof err === 'object' && err !== null;
      };
      
      // If it's not a model decommissioned error, throw immediately
      if (isAPIError(error) && (error.status !== 400 || !error.message?.includes('decommissioned'))) {
        throw error;
      }
      
      // Continue to next model if this one is decommissioned
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateFlashcardSetRequest = await request.json();
    const { title, description, notes } = body;

    // Validate input
    if (!title?.trim() || !notes?.trim() || notes.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Title and notes (minimum 50 characters) are required" 
        },
        { status: 400 }
      );
    }

    // Get user's current usage and tier info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("tier, flashcards_generated_this_month, monthly_limit")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User profile not found. Please try logging out and logging back in." 
        },
        { status: 404 }
      );
    }

    // Check usage limits
    const remainingQuota = userData.monthly_limit - userData.flashcards_generated_this_month;

    if (remainingQuota <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly flashcard limit reached. Upgrade to premium for unlimited generation!",
          usage: {
            generated_this_month: userData.flashcards_generated_this_month,
            monthly_limit: userData.monthly_limit,
            remaining: remainingQuota,
          }
        },
        { status: 429 }
      );
    }

    // Generate flashcards using OpenAI
    const systemPrompt = `You are an expert educational content creator. Your task is to analyze study notes and create high-quality flashcards that promote active recall and effective learning.

Instructions:
1. Create between 5-20 flashcards based on the content length and complexity
2. Focus on key concepts, definitions, processes, and important details
3. Make questions specific and unambiguous
4. Ensure answers are concise but complete
5. Vary question types: definitions, examples, comparisons, applications
6. Use clear, educational language
7. Prioritize the most important information

Return your response as a JSON array of objects with this exact structure:
[
  {
    "question": "Clear, specific question that tests understanding",
    "answer": "Comprehensive but concise answer",
    "difficulty": 1-5 (1=basic recall, 5=complex application)
  }
]

Important: Return ONLY the JSON array, no additional text or explanation.`;

    const userPrompt = `Create flashcards from these study notes:

Title: ${title}
${description ? `Description: ${description}` : ''}

Notes:
${notes}`;

    let generatedFlashcards;
    
    try {
      const completion = await createChatCompletion([], systemPrompt, userPrompt);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response from Groq");
      }

      // Parse the JSON response
      try {
        generatedFlashcards = JSON.parse(responseContent);
      } catch {
        console.error("Failed to parse Groq response:", responseContent);
        throw new Error("Invalid response format from AI");
      }

      if (!Array.isArray(generatedFlashcards) || generatedFlashcards.length === 0) {
        throw new Error("No flashcards generated from the provided notes");
      }
    } catch (groqError: unknown) {
      console.error("Groq API Error:", groqError);
      
      // Type guard for API errors
      const isAPIError = (err: unknown): err is { status?: number; message?: string } => {
        return typeof err === 'object' && err !== null;
      };
      
      // Handle specific Groq errors
      if (isAPIError(groqError) && groqError.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Groq rate limit exceeded. Please wait a moment and try again. Groq has generous free limits that reset frequently." 
          },
          { status: 429 }
        );
      } else if (isAPIError(groqError) && groqError.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid Groq API key. Please check your environment configuration." 
          },
          { status: 500 }
        );
      } else {
        const errorMessage = isAPIError(groqError) ? groqError.message : 'Unknown error';
        return NextResponse.json(
          { 
            success: false, 
            error: `Groq API error: ${errorMessage}` 
          },
          { status: 500 }
        );
      }
    }

    // Create flashcard set in database
    const { data: flashcardSet, error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        original_notes: notes.trim(),
        flashcard_count: generatedFlashcards.length,
      })
      .select()
      .single();

    if (setError) {
      throw new Error("Failed to create flashcard set");
    }

    // Insert individual flashcards
    const flashcardsToInsert = generatedFlashcards.map((card: any) => ({
      set_id: flashcardSet.id,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || 1,
    }));

    const { error: flashcardsError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert);

    if (flashcardsError) {
      // If flashcard insertion fails, clean up the set
      await supabase.from("flashcard_sets").delete().eq("id", flashcardSet.id);
      throw new Error("Failed to create flashcards");
    }

    // Update user's usage count
    const newGeneratedCount = userData.flashcards_generated_this_month + generatedFlashcards.length;
    await supabase
      .from("users")
      .update({ 
        flashcards_generated_this_month: newGeneratedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    const response: CreateFlashcardSetResponse = {
      success: true,
      flashcard_set: flashcardSet,
      usage: {
        generated_this_month: newGeneratedCount,
        monthly_limit: userData.monthly_limit,
        remaining: userData.monthly_limit - newGeneratedCount,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating flashcards:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}