"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  CreditCard,
  Shield,
  Clock,
  Users
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError("");

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

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment");
      }

      // Store transaction ID for potential recovery
      if (data.transaction_id) {
        localStorage.setItem('pending_transaction_id', data.transaction_id);
      }

      // Redirect to Cryptomus payment page
      if (data.payment_url) {
        // Show loading message while redirecting
        setError("Redirecting to secure payment page...");
        window.location.href = data.payment_url;
      } else {
        throw new Error("No payment URL received from payment gateway");
      }

    } catch (err) {
      console.error("Payment creation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      
      // Provide helpful error messages
      if (errorMessage.includes("already have an active")) {
        setError("You already have an active premium subscription!");
      } else if (errorMessage.includes("pending payment")) {
        setError("You have a pending payment. Please complete it or wait for it to expire.");
      } else if (errorMessage.includes("configuration")) {
        setError("Payment system is temporarily unavailable. Please try again later.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Unlimited Flashcards",
      description: "Generate as many flashcards as you want every month",
      free: "10 per month",
      premium: "Unlimited"
    },
    {
      icon: Zap,
      title: "Priority AI Processing",
      description: "Faster flashcard generation with priority queue",
      free: "Standard speed",
      premium: "2x faster"
    },
    {
      icon: Shield,
      title: "Advanced Study Features",
      description: "Smart review scheduling and difficulty adjustment",
      free: "Basic studying",
      premium: "Smart algorithms"
    },
    {
      icon: Clock,
      title: "Study Analytics",
      description: "Detailed progress tracking and performance insights",
      free: "Basic stats",
      premium: "Advanced analytics"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share flashcard sets with study groups",
      free: "Personal only",
      premium: "Team sharing"
    },
    {
      icon: CreditCard,
      title: "Export Options",
      description: "Export flashcards to PDF, Anki, and other formats",
      free: "Limited export",
      premium: "All formats"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Supercharge your studying with unlimited AI-powered flashcards and advanced features
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader className="text-center">
            <Badge variant="secondary" className="mx-auto mb-2 w-fit">Current Plan</Badge>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="text-3xl font-bold mt-4">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>10 flashcards per month</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Basic AI flashcard generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Simple study mode</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Basic progress tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
          </div>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-2xl">Premium</CardTitle>
            </div>
            <CardDescription>Everything you need to excel</CardDescription>
            <div className="text-4xl font-bold mt-4 text-primary">
              $9.99<span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Unlimited flashcards</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Priority AI processing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Advanced study algorithms</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Detailed analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Team collaboration</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Export to all formats</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Priority customer support</span>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Feature Comparison</CardTitle>
          <CardDescription>See what you get with Premium</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <feature.icon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Free</div>
                  <div className="text-sm">{feature.free}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-primary mb-1">Premium</div>
                  <div className="text-sm font-semibold">{feature.premium}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Security */}
      <Card className="mt-8">
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Secure Payment Processing</h3>
          <p className="text-muted-foreground">
            Your payment is processed securely through Cryptomus. We use industry-standard encryption to protect your financial information.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>💳 Credit/Debit Cards</span>
            <span>₿ Cryptocurrency</span>
            <span>🔒 SSL Encrypted</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}