import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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
    const setId = id;

    // Get flashcard set with flashcards
    const { data: flashcardSet, error: setError } = await supabase
      .from("flashcard_sets")
      .select(`
        id,
        title,
        description,
        original_notes,
        flashcard_count,
        created_at,
        updated_at,
        flashcards (
          id,
          question,
          answer,
          difficulty,
          times_reviewed,
          times_correct,
          last_reviewed_at,
          created_at
        )
      `)
      .eq("id", setId)
      .eq("user_id", user.id)
      .single();

    if (setError) {
      if (setError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Flashcard set not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch flashcard set");
    }

    return NextResponse.json({
      success: true,
      data: flashcardSet
    });

  } catch (error) {
    console.error("Error fetching flashcard set:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const setId = id;
    const { title, description } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Update flashcard set
    const { data: updatedSet, error: updateError } = await supabase
      .from("flashcard_sets")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", setId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Flashcard set not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to update flashcard set");
    }

    return NextResponse.json({
      success: true,
      data: updatedSet
    });

  } catch (error) {
    console.error("Error updating flashcard set:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const setId = id;

    // Delete flashcard set (flashcards will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from("flashcard_sets")
      .delete()
      .eq("id", setId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw new Error("Failed to delete flashcard set");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}