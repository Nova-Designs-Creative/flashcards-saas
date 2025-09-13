"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Crown, 
  Sparkles, 
  ArrowLeft,
  Clock
} from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "failed">("pending");
  const transactionId = searchParams.get("transaction_id");

  const updateUserTier = useCallback(async () => {
    try {
      const response = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transactionId,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error("Failed to upgrade user:", data.error);
      }
    } catch (error) {
      console.error("Error upgrading user:", error);
    }
  }, [transactionId]);

  useEffect(() => {
    if (transactionId) {
      // Simulate payment processing for demo purposes
      // In production, you would verify the payment status with Cryptomus
      setTimeout(() => {
        setPaymentStatus("success");
        setIsLoading(false);
        
        // Update user tier to premium (in production, this would be done via webhook)
        updateUserTier();
      }, 2000);
    } else {
      setPaymentStatus("failed");
      setIsLoading(false);
    }
  }, [transactionId, updateUserTier]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Your Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue processing your payment. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/premium")}>
                Try Again
              </Button>
              <Button onClick={() => router.push("/flashcards")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Flashcards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <CardTitle className="text-2xl">Welcome to Premium!</CardTitle>
          </div>
          <CardDescription>
            Your payment was successful and your account has been upgraded
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Transaction Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>$9.99 USD</span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <Badge className="ml-2">Premium Monthly</Badge>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              You now have access to:
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Unlimited flashcard generation</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Priority AI processing (2x faster)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Advanced study features and analytics</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Team collaboration and sharing</span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Subscription Information</span>
            </div>
            <p className="text-sm text-blue-800">
              Your premium subscription will automatically renew monthly. You can cancel or modify your subscription at any time from your account settings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => router.push("/flashcards")} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Start Creating Flashcards
            </Button>
            <Button variant="outline" onClick={() => router.push("/account")}>
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}