import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreatePaymentRequest } from "@/lib/types";
import crypto from "crypto";

// Cryptomus API integration
async function createCryptomusPayment(amount: number, currency: string, userId: string, transactionId: string) {
  const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
  const apiKey = process.env.CRYPTOMUS_API_KEY;

  if (!merchantId || !apiKey) {
    throw new Error("Cryptomus configuration missing. Please check CRYPTOMUS_MERCHANT_ID and CRYPTOMUS_API_KEY environment variables.");
  }

  const orderId = `premium_${userId}_${transactionId}_${Date.now()}`;
  
  const paymentData = {
    amount: amount.toString(),
    currency: currency,
    order_id: orderId,
    url_return: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?transaction_id=${transactionId}`,
    url_callback: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
    merchant: merchantId,
    is_payment_multiple: false,
    lifetime: 7200, // 2 hours
    to_currency: currency
  };

  // Generate signature according to Cryptomus documentation
  const sign = generateCryptomusSignature(paymentData, apiKey);

  console.log("Creating Cryptomus payment with data:", { ...paymentData, sign });

  const response = await fetch("https://api.cryptomus.com/v1/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "merchant": merchantId,
      "sign": sign,
    },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();

  console.log("Cryptomus API response:", result);

  if (!response.ok || result.state !== 0) {
    throw new Error(result.message || result.errors?.[0] || "Cryptomus payment creation failed");
  }

  return {
    payment_url: result.result.url,
    cryptomus_uuid: result.result.uuid,
    order_id: orderId
  };
}

function generateCryptomusSignature(data: Record<string, any>, apiKey: string): string {
  // Convert data to base64
  const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');
  
  // Create HMAC signature
  const signature = crypto.createHmac('md5', apiKey).update(base64Data).digest('hex');
  
  return signature;
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

    const body: CreatePaymentRequest = await request.json();
    const { tier, amount, currency = "USD" } = body;

    // Validate input
    if (!tier || tier !== "premium") {
      return NextResponse.json(
        { success: false, error: "Invalid tier specified" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0 || amount > 1000) { // Max $1000 for security
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate currency
    const allowedCurrencies = ["USD", "EUR", "BTC", "ETH", "USDT"];
    if (!allowedCurrencies.includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Unsupported currency" },
        { status: 400 }
      );
    }

    // Check if user already has an active premium subscription
    const { data: userData } = await supabase
      .from("users")
      .select("tier, subscription_expires_at")
      .eq("id", user.id)
      .single();

    if (userData?.tier === "premium" && userData.subscription_expires_at) {
      const expiryDate = new Date(userData.subscription_expires_at);
      if (expiryDate > new Date()) {
        return NextResponse.json(
          { success: false, error: "You already have an active premium subscription" },
          { status: 400 }
        );
      }
    }

    // Check for pending transactions
    const { data: pendingTransactions } = await supabase
      .from("payment_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Within last 30 minutes

    if (pendingTransactions && pendingTransactions.length > 0) {
      return NextResponse.json(
        { success: false, error: "You have a pending payment. Please complete or wait for it to expire before creating a new one." },
        { status: 400 }
      );
    }

    // Create payment transaction record first
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        amount: amount,
        currency: currency,
        status: "pending",
        tier_purchased: tier,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error("Failed to create payment transaction");
    }

    // Create payment with Cryptomus
    try {
      const cryptomusResult = await createCryptomusPayment(amount, currency, user.id, transaction.id);

      // Update transaction with Cryptomus data
      await supabase
        .from("payment_transactions")
        .update({
          transaction_id: cryptomusResult.cryptomus_uuid,
          cryptomus_data: {
            order_id: cryptomusResult.order_id,
            uuid: cryptomusResult.cryptomus_uuid
          }
        })
        .eq("id", transaction.id);

      return NextResponse.json({
        success: true,
        payment_url: cryptomusResult.payment_url,
        transaction_id: transaction.id,
        cryptomus_uuid: cryptomusResult.cryptomus_uuid
      });

    } catch (cryptomusError) {
      console.error("Cryptomus payment creation failed:", cryptomusError);
      
      // Mark transaction as failed
      await supabase
        .from("payment_transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);

      throw new Error(`Payment gateway error: ${cryptomusError instanceof Error ? cryptomusError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error("Error creating payment:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}