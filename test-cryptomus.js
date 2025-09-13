// Test script for Cryptomus payment integration
// Run this in the browser console on the premium page to test payment creation

async function testPaymentCreation() {
  console.log("🧪 Testing Cryptomus payment creation...");
  
  try {
    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tier: "premium",
        amount: 9.99,
        currency: "USD",
      }),
    });

    const data = await response.json();
    
    console.log("📡 API Response:", data);
    
    if (data.success) {
      console.log("✅ Payment creation successful!");
      console.log("💳 Payment URL:", data.payment_url);
      console.log("🆔 Transaction ID:", data.transaction_id);
      console.log("🔗 Cryptomus UUID:", data.cryptomus_uuid);
    } else {
      console.error("❌ Payment creation failed:", data.error);
    }
    
    return data;
  } catch (error) {
    console.error("💥 Test failed:", error);
    return null;
  }
}

async function testWebhookSignature() {
  console.log("🔐 Testing webhook signature generation...");
  
  const testPayload = {
    type: "payment",
    uuid: "test-uuid-123",
    order_id: "premium_test_123",
    amount: "9.99",
    status: "paid",
    currency: "USD"
  };
  
  // This would normally be done server-side
  console.log("📝 Test payload:", testPayload);
  console.log("ℹ️  In production, signature verification happens on the server");
}

async function checkEnvironmentConfig() {
  console.log("⚙️ Checking environment configuration...");
  
  try {
    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tier: "premium",
        amount: 0.01, // Small test amount
        currency: "USD",
      }),
    });

    const data = await response.json();
    
    if (data.error && data.error.includes("configuration")) {
      console.warn("⚠️  Cryptomus configuration missing");
      console.log("📋 Required environment variables:");
      console.log("   - CRYPTOMUS_MERCHANT_ID");
      console.log("   - CRYPTOMUS_API_KEY");
      console.log("   - NEXT_PUBLIC_SITE_URL");
    } else {
      console.log("✅ Configuration appears to be set up");
    }
    
  } catch (error) {
    console.error("💥 Configuration check failed:", error);
  }
}

// Export test functions for manual testing
window.cryptomusTests = {
  testPaymentCreation,
  testWebhookSignature,
  checkEnvironmentConfig
};

console.log("🚀 Cryptomus test functions loaded!");
console.log("📘 Usage:");
console.log("   cryptomusTests.testPaymentCreation()");
console.log("   cryptomusTests.checkEnvironmentConfig()");
console.log("   cryptomusTests.testWebhookSignature()");