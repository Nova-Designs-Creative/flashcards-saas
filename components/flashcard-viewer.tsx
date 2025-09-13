"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  X, 
  BookOpen,
  Brain
} from "lucide-react";
import { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  flashcard: Flashcard;
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onMarkReview: (correct: boolean) => void;
}

export function FlashcardViewer({
  flashcard,
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onMarkReview
}: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    onPrevious();
  };

  const handleMarkCorrect = () => {
    onMarkReview(true);
    setIsFlipped(false);
    onNext();
  };

  const handleMarkIncorrect = () => {
    onMarkReview(false);
    setIsFlipped(false);
    onNext();
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200";
      case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 4: return "bg-orange-100 text-orange-800 border-orange-200";
      case 5: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "Easy";
      case 2: return "Basic";
      case 3: return "Medium";
      case 4: return "Hard";
      case 5: return "Expert";
      default: return "Unknown";
    }
  };

  const accuracy = flashcard.times_reviewed > 0 
    ? Math.round((flashcard.times_correct / flashcard.times_reviewed) * 100) 
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with progress and stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getDifficultyColor(flashcard.difficulty))}
          >
            {getDifficultyLabel(flashcard.difficulty)}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {flashcard.times_reviewed > 0 && (
            <span className="text-xs">
              {accuracy}% accuracy ({flashcard.times_correct}/{flashcard.times_reviewed})
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Main flashcard */}
      <div className="perspective-1000">
        <Card 
          className={cn(
            "relative min-h-[400px] cursor-pointer transition-transform duration-300 transform-gpu",
            isAnimating && "scale-95",
            "hover:shadow-lg"
          )}
          onClick={handleFlip}
        >
          <CardContent className="p-8 h-full flex flex-col justify-center">
            {!isFlipped ? (
              // Question side
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-medium">Question</span>
                </div>
                <h2 className="text-2xl font-semibold leading-relaxed">
                  {flashcard.question}
                </h2>
                <p className="text-muted-foreground">
                  Click to reveal answer
                </p>
              </div>
            ) : (
              // Answer side
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">Answer</span>
                </div>
                <div className="text-lg leading-relaxed whitespace-pre-wrap">
                  {flashcard.answer}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Previous button */}
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Center controls */}
        <div className="flex items-center gap-3">
          {isFlipped ? (
            // Review buttons (shown when answer is visible)
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkIncorrect}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Incorrect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkCorrect}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="w-4 h-4" />
                Correct
              </Button>
            </>
          ) : (
            // Flip button (shown when question is visible)
            <Button
              variant="secondary"
              onClick={handleFlip}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reveal Answer
            </Button>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick navigation dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalCards }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex 
                ? "bg-primary" 
                : "bg-muted hover:bg-muted-foreground/50"
            )}
            onClick={() => {
              setIsFlipped(false);
              // This would need to be passed as a prop if you want direct navigation
            }}
          />
        ))}
      </div>
    </div>
  );
}