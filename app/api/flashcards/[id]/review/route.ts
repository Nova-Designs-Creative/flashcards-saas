import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const flashcardId = id;
    const { correct } = await request.json();

    if (typeof correct !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Correct must be a boolean value" },
        { status: 400 }
      );
    }

    // Verify the flashcard belongs to the user
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .select(`
        id,
        times_reviewed,
        times_correct,
        set_id,
        flashcard_sets!inner (
          user_id
        )
      `)
      .eq("id", flashcardId)
      .eq("flashcard_sets.user_id", user.id)
      .single();

    if (flashcardError) {
      if (flashcardError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Flashcard not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch flashcard");
    }

    // Update flashcard review stats
    const { data: updatedFlashcard, error: updateError } = await supabase
      .from("flashcards")
      .update({
        times_reviewed: flashcard.times_reviewed + 1,
        times_correct: flashcard.times_correct + (correct ? 1 : 0),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Failed to update flashcard stats");
    }

    return NextResponse.json({
      success: true,
      data: updatedFlashcard
    });

  } catch (error) {
    console.error("Error updating flashcard review:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}