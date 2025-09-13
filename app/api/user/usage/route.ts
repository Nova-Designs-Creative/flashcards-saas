import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Get or create user profile with usage stats
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("tier, flashcards_generated_this_month, monthly_limit, subscription_expires_at, updated_at")
      .eq("id", user.id)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist in our table, create them
      const freeLimit = parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || "10");
      
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          tier: "free",
          flashcards_generated_this_month: 0,
          monthly_limit: freeLimit,
        })
        .select("tier, flashcards_generated_this_month, monthly_limit, subscription_expires_at, updated_at")
        .single();

      if (createError) {
        throw new Error("Failed to create user profile");
      }
      
      userData = newUser;
    } else if (userError) {
      throw new Error("Failed to fetch user data");
    }

    if (!userData) {
      throw new Error("Failed to get user data");
    }

    // Check if premium subscription has expired
    if (userData.tier === "premium" && userData.subscription_expires_at) {
      const expiryDate = new Date(userData.subscription_expires_at);
      if (expiryDate < new Date()) {
        // Downgrade to free tier
        const freeLimit = parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || "10");
        
        await supabase
          .from("users")
          .update({
            tier: "free",
            monthly_limit: freeLimit,
            subscription_expires_at: null,
          })
          .eq("id", user.id);

        userData.tier = "free";
        userData.monthly_limit = freeLimit;
        userData.subscription_expires_at = null;
      }
    }

    // Check if we need to reset monthly count (new month)
    const now = new Date();
    const lastUpdate = new Date(userData.updated_at || now);
    
    if (now.getMonth() !== lastUpdate.getMonth() || now.getFullYear() !== lastUpdate.getFullYear()) {
      await supabase
        .from("users")
        .update({
          flashcards_generated_this_month: 0,
          updated_at: now.toISOString(),
        })
        .eq("id", user.id);

      userData.flashcards_generated_this_month = 0;
    }

    const remaining = Math.max(0, userData.monthly_limit - userData.flashcards_generated_this_month);

    return NextResponse.json({
      success: true,
      usage: {
        generated_this_month: userData.flashcards_generated_this_month,
        monthly_limit: userData.monthly_limit,
        remaining: remaining,
      },
      tier: userData.tier,
      subscription_expires_at: userData.subscription_expires_at,
    });

  } catch (error) {
    console.error("Error fetching user usage:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}