import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { transaction_id } = await request.json();

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Verify the transaction belongs to this user
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transaction_id)
      .eq("user_id", user.id)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if transaction is already completed (webhook may have processed it)
    if (transaction.status === "completed") {
      // Just verify user is already upgraded
      const { data: userData } = await supabase
        .from("users")
        .select("tier")
        .eq("id", user.id)
        .single();

      if (userData?.tier === "premium") {
        return NextResponse.json({
          success: true,
          message: "Account already upgraded to premium",
          alreadyUpgraded: true
        });
      }
    }

    // Update transaction status to completed if not already
    if (transaction.status !== "completed") {
      await supabase
        .from("payment_transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction_id);
    }

    // Update user tier to premium
    const premiumLimit = parseInt(process.env.PREMIUM_TIER_MONTHLY_LIMIT || "1000");
    
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        tier: "premium",
        monthly_limit: premiumLimit,
        subscription_expires_at: transaction.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error("Failed to upgrade user account");
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Account successfully upgraded to premium"
    });

  } catch (error) {
    console.error("Error upgrading user:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}