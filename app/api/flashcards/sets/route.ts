import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const offset = (page - 1) * limit;

    // Get flashcard sets with pagination
    const { data: flashcardSets, error: setsError, count } = await supabase
      .from("flashcard_sets")
      .select(`
        id,
        title,
        description,
        flashcard_count,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq("user_id", user.id)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (setsError) {
      throw new Error("Failed to fetch flashcard sets");
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: flashcardSets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      }
    });

  } catch (error) {
    console.error("Error fetching flashcard sets:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const setId = searchParams.get("id");

    if (!setId) {
      return NextResponse.json(
        { success: false, error: "Set ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership and delete
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