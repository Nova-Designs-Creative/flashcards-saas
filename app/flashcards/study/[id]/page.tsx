"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target,
  Trophy,
  RotateCcw
} from "lucide-react";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { FlashcardSet, StudySessionResult } from "@/lib/types";

export default function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [studySession, setStudySession] = useState({
    correctAnswers: 0,
    totalReviewed: 0,
    startTime: Date.now(),
  });
  const [sessionComplete, setSessionComplete] = useState(false);

  const fetchFlashcardSet = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/flashcards/sets/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch flashcard set");
      }

      setFlashcardSet(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flashcard set");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFlashcardSet();
  }, [fetchFlashcardSet]);

  const handleNext = () => {
    if (flashcardSet && currentCardIndex < flashcardSet.flashcards!.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleMarkReview = async (correct: boolean) => {
    if (!flashcardSet || !flashcardSet.flashcards) return;

    const currentFlashcard = flashcardSet.flashcards[currentCardIndex];
    
    // Update local session stats
    setStudySession(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      totalReviewed: prev.totalReviewed + 1,
    }));

    // Update flashcard stats in the database
    try {
      await fetch(`/api/flashcards/${currentFlashcard.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correct }),
      });

      // Update local state
      const updatedFlashcards = [...flashcardSet.flashcards];
      updatedFlashcards[currentCardIndex] = {
        ...currentFlashcard,
        times_reviewed: currentFlashcard.times_reviewed + 1,
        times_correct: currentFlashcard.times_correct + (correct ? 1 : 0),
        last_reviewed_at: new Date().toISOString(),
      };

      setFlashcardSet({
        ...flashcardSet,
        flashcards: updatedFlashcards,
      });

    } catch (error) {
      console.error("Failed to update review stats:", error);
    }

    // Check if session is complete
    if (studySession.totalReviewed + 1 >= flashcardSet.flashcards.length) {
      setSessionComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setStudySession({
      correctAnswers: 0,
      totalReviewed: 0,
      startTime: Date.now(),
    });
    setSessionComplete(false);
  };

  const calculateSessionResults = (): StudySessionResult => {
    const sessionDuration = (Date.now() - studySession.startTime) / 1000; // in seconds
    const accuracy = studySession.totalReviewed > 0 
      ? (studySession.correctAnswers / studySession.totalReviewed) * 100 
      : 0;
    const averageTime = studySession.totalReviewed > 0 
      ? sessionDuration / studySession.totalReviewed 
      : 0;

    return {
      total_cards: flashcardSet?.flashcards?.length || 0,
      correct_answers: studySession.correctAnswers,
      accuracy: Math.round(accuracy),
      average_time: Math.round(averageTime),
      session_duration: Math.round(sessionDuration),
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-2 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !flashcardSet) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Flashcard Set Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The flashcard set you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Button onClick={() => router.push("/flashcards")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Flashcards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    const results = calculateSessionResults();
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/flashcards")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flashcards
          </Button>
        </div>

        {/* Session Complete */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Study Session Complete!</CardTitle>
            <CardDescription>
              Great job studying {flashcardSet.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Results Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{results.total_cards}</div>
                <div className="text-sm text-muted-foreground">Cards Studied</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{results.average_time}s</div>
                <div className="text-sm text-muted-foreground">Avg. Time</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{Math.floor(results.session_duration / 60)}m</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              {results.accuracy >= 90 && (
                <p className="text-primary font-medium">Excellent work! You&apos;ve mastered this material.</p>
              )}
              {results.accuracy >= 70 && results.accuracy < 90 && (
                <p className="text-primary font-medium">Good job! Keep practicing to improve further.</p>
              )}
              {results.accuracy < 70 && (
                <p className="text-primary font-medium">Keep studying! Review the material and try again.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
              <Button onClick={() => router.push("/flashcards")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentFlashcard = flashcardSet.flashcards![currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/flashcards")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Flashcards
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
          {flashcardSet.description && (
            <p className="text-muted-foreground">{flashcardSet.description}</p>
          )}
        </div>

        {/* Study Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Study Progress</span>
            <span>{studySession.totalReviewed} / {flashcardSet.flashcards!.length} reviewed</span>
          </div>
          <Progress 
            value={(studySession.totalReviewed / flashcardSet.flashcards!.length) * 100}
            className="h-2"
          />
        </div>

        {/* Session Stats */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>
              {studySession.totalReviewed > 0 
                ? `${Math.round((studySession.correctAnswers / studySession.totalReviewed) * 100)}% accurate`
                : "0% accurate"
              }
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.floor((Date.now() - studySession.startTime) / 60000)}m elapsed</span>
          </div>
        </div>
      </div>

      {/* Flashcard Viewer */}
      <FlashcardViewer
        flashcard={currentFlashcard}
        currentIndex={currentCardIndex}
        totalCards={flashcardSet.flashcards!.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onMarkReview={handleMarkReview}
      />
    </div>
  );
}