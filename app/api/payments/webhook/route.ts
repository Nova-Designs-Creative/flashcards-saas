import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

interface CryptomusWebhookPayload {
  type: string;
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: string;
  from: string;
  wallet_address_uuid: string;
  network: string;
  currency: string;
  payer_currency: string;
  additional_data?: string;
  txid?: string;
  sign: string;
}

function verifyWebhookSignature(payload: CryptomusWebhookPayload, signature: string, apiKey: string): boolean {
  try {
    // Remove the sign field from payload for verification
    const { sign: _sign, ...dataToVerify } = payload;
    
    // Convert to base64
    const base64Data = Buffer.from(JSON.stringify(dataToVerify)).toString('base64');
    
    // Generate expected signature
    const expectedSignature = crypto.createHmac('md5', apiKey).update(base64Data).digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CRYPTOMUS_API_KEY;
    
    if (!apiKey) {
      console.error("CRYPTOMUS_API_KEY not configured");
      return NextResponse.json(
        { success: false, error: "Webhook configuration error" },
        { status: 500 }
      );
    }

    const payload: CryptomusWebhookPayload = await request.json();
    
    console.log("Received Cryptomus webhook:", payload);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, payload.sign, apiKey)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Find the transaction by Cryptomus UUID
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("transaction_id", payload.uuid)
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", payload.uuid);
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Process different payment statuses
    let newStatus: string;
    let shouldUpgradeUser = false;

    switch (payload.status) {
      case "paid":
      case "paid_over":
        newStatus = "completed";
        shouldUpgradeUser = true;
        break;
      case "fail":
      case "cancel":
      case "system_fail":
      case "refund":
      case "refund_fail":
        newStatus = "failed";
        break;
      case "process":
      case "confirm_check":
      case "not_paid":
        newStatus = "pending";
        break;
      default:
        console.warn("Unknown payment status:", payload.status);
        newStatus = "pending";
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: newStatus,
        cryptomus_data: {
          ...transaction.cryptomus_data,
          webhook_payload: payload,
          last_webhook_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // Upgrade user if payment is successful
    if (shouldUpgradeUser && newStatus === "completed") {
      const premiumLimit = parseInt(process.env.PREMIUM_TIER_MONTHLY_LIMIT || "1000");
      
      const { error: upgradeError } = await supabase
        .from("users")
        .update({
          tier: "premium",
          monthly_limit: premiumLimit,
          subscription_expires_at: transaction.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.user_id);

      if (upgradeError) {
        console.error("Failed to upgrade user:", upgradeError);
        // Don't fail the webhook for this, but log it
      } else {
        console.log(`Successfully upgraded user ${transaction.user_id} to premium`);
      }
    }

    // Cryptomus expects a specific response format
    return NextResponse.json({ state: 0 });

  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}