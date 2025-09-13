"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown, 
  Sparkles, 
  Zap, 
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";

interface PremiumUpgradeBannerProps {
  usage: {
    generated_this_month: number;
    monthly_limit: number;
    remaining: number;
  };
  tier: string;
  showAlways?: boolean;
  onDismiss?: () => void;
}

export function PremiumUpgradeBanner({ 
  usage, 
  tier, 
  showAlways = false,
  onDismiss 
}: PremiumUpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for premium users unless forced
  if (tier === "premium" && !showAlways) {
    return null;
  }

  // Don't show if dismissed and not forced
  if (isDismissed && !showAlways) {
    return null;
  }

  const isLowOnFlashcards = usage.remaining <= 3;
  const isOutOfFlashcards = usage.remaining <= 0;
  const progressPercentage = Math.round((usage.generated_this_month / usage.monthly_limit) * 100);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Only show when low on flashcards or forced, and not premium
  if (!isLowOnFlashcards && !showAlways) {
    return null;
  }

  // Don't show if tier is premium (double check)
  if (tier === "premium") {
    return null;
  }

  return (
    <Alert className={`border-2 ${
      isOutOfFlashcards 
        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" 
        : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
    }`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3 flex-1">
          {isOutOfFlashcards ? (
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          ) : (
            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          )}
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className={`text-sm font-semibold ${
                isOutOfFlashcards 
                  ? "text-red-800 dark:text-red-200" 
                  : "text-yellow-800 dark:text-yellow-200"
              }`}>
                {isOutOfFlashcards 
                  ? "You've reached your monthly limit!" 
                  : "Running low on flashcards!"
                }
              </h3>
              <AlertDescription className={`${
                isOutOfFlashcards 
                  ? "text-red-700 dark:text-red-300" 
                  : "text-yellow-700 dark:text-yellow-300"
              } mt-1`}>
                {isOutOfFlashcards ? (
                  <>
                    You&apos;ve used all <strong>{usage.monthly_limit}</strong> flashcards this month. 
                    Upgrade to Premium for unlimited generation.
                  </>
                ) : (
                  <>
                    Only <strong>{usage.remaining}</strong> flashcards remaining this month 
                    ({progressPercentage}% used). Upgrade to Premium for unlimited generation.
                  </>
                )}
              </AlertDescription>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/premium">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Unlimited flashcards</span>
                <span>•</span>
                <Zap className="w-3 h-3" />
                <span>Priority support</span>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Monthly Usage</span>
                <span>{usage.generated_this_month} / {usage.monthly_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progressPercentage >= 90 
                      ? "bg-red-500" 
                      : progressPercentage >= 70 
                        ? "bg-yellow-500" 
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {!showAlways && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}