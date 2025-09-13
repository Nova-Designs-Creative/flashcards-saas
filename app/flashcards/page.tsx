"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BookOpen, Brain, Plus, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardSetList } from "@/components/flashcard-set-list";
import { FlashcardSet } from "@/lib/types";

export default function FlashcardsPage() {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [error, setError] = useState("");
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [usage, setUsage] = useState({
    generated_this_month: 0,
    monthly_limit: 10,
    remaining: 10
  });

  useEffect(() => {
    fetchFlashcardSets();
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage");
      const data = await response.json();

      if (data.success) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error);
    }
  };

  const fetchFlashcardSets = async () => {
    try {
      setIsLoadingSets(true);
      const response = await fetch("/api/flashcards/sets");
      const data = await response.json();

      if (data.success) {
        setSets(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch flashcard sets:", error);
    } finally {
      setIsLoadingSets(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!notes.trim() || !title.trim()) {
      setError("Please provide both a title and notes to generate flashcards.");
      return;
    }

    if (usage.remaining <= 0) {
      setError("You've reached your monthly limit. Upgrade to premium for unlimited flashcards!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          notes,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Update usage stats
      if (data.usage) {
        setUsage(data.usage);
      }

      // Clear form on success
      setNotes("");
      setTitle("");
      setDescription("");

      // Refresh the sets list
      await fetchFlashcardSets();

      // Redirect to the new flashcard set for studying
      if (data.flashcard_set) {
        router.push(`/flashcards/study/${data.flashcard_set.id}`);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudySet = (id: string) => {
    router.push(`/flashcards/study/${id}`);
  };

  const handleEditSet = () => {
    // For now, just show an alert. You could implement an edit modal here
    alert("Edit functionality coming soon!");
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard set? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/sets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete flashcard set");
      }

      // Remove from local state
      setSets(prev => prev.filter(set => set.id !== id));
    } catch (error) {
      console.error("Failed to delete set:", error);
      alert("Failed to delete flashcard set. Please try again.");
    }
  };

  const isFormValid = notes.trim().length > 50 && title.trim().length > 0;
  const progressPercentage = (usage.generated_this_month / usage.monthly_limit) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Transform your notes into personalized flashcards with the power of AI
        </p>
      </div>

      {/* Usage Stats */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Monthly Usage</CardTitle>
            <Badge variant={usage.remaining > 2 ? "default" : "destructive"}>
              {usage.remaining} remaining
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generated this month</span>
              <span>{usage.generated_this_month} / {usage.monthly_limit}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            {usage.remaining <= 2 && (
              <p className="text-sm text-muted-foreground">
                Running low on flashcards? <Button variant="link" className="p-0 h-auto">Upgrade to Premium</Button> for unlimited generation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Set</TabsTrigger>
          <TabsTrigger value="browse">My Flashcard Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Flashcard Set
              </CardTitle>
              <CardDescription>
                Paste your notes below and we&apos;ll generate interactive flashcards to help you study more effectively.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Flashcard Set Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Biology Chapter 5: Cell Division"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what this set covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Your Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Paste your study notes here. The more detailed your notes, the better the flashcards will be. Minimum 50 characters required.

Example:
Mitosis is the process of cell division that results in two identical diploid daughter cells. The phases include:
1. Prophase - chromosomes condense and become visible
2. Metaphase - chromosomes align at the cell equator
3. Anaphase - sister chromatids separate and move to opposite poles
4. Telophase - nuclear envelopes reform around each set of chromosomes

Key terms:
- Diploid: having two complete sets of chromosomes
- Chromatid: one half of a replicated chromosome
- Centromere: the region where sister chromatids are joined"
                  className="min-h-[300px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{notes.length} characters (minimum 50 required)</span>
                  <span>AI will generate {Math.min(Math.floor(notes.length / 100), 20)} flashcards</span>
                </div>
              </div>

              <Button 
                onClick={handleGenerateFlashcards}
                disabled={!isFormValid || isLoading || usage.remaining <= 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Flashcards...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Flashcards
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Include key terms, definitions, and concepts in your notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Organize your notes with clear headings and bullet points</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Provide examples and explanations for complex concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>The AI works best with well-structured, detailed content</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                My Flashcard Sets
              </CardTitle>
              <CardDescription>
                View and manage your created flashcard sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlashcardSetList
                sets={sets}
                isLoading={isLoadingSets}
                onStudy={handleStudySet}
                onEdit={handleEditSet}
                onDelete={handleDeleteSet}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}