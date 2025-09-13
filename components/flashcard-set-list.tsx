"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Play, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlashcardSet } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  onStudy: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FlashcardSetCard({ set, onStudy, onEdit, onDelete }: FlashcardSetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(set.id);
    } catch (error) {
      console.error("Failed to delete set:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{set.title}</CardTitle>
            {set.description && (
              <CardDescription className="line-clamp-2">
                {set.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(set.id)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Set"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{set.flashcard_count} cards</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDistanceToNow(new Date(set.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Last updated */}
        {set.updated_at !== set.created_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Updated {formatDistanceToNow(new Date(set.updated_at), { addSuffix: true })}</span>
          </div>
        )}

        {/* Study button */}
        <Button 
          onClick={() => onStudy(set.id)}
          className="w-full"
          disabled={set.flashcard_count === 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Studying
        </Button>
      </CardContent>
    </Card>
  );
}

interface FlashcardSetListProps {
  sets: FlashcardSet[];
  isLoading?: boolean;
  onStudy: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function FlashcardSetList({ 
  sets, 
  isLoading = false,
  onStudy, 
  onEdit, 
  onDelete,
  onLoadMore,
  hasMore = false
}: FlashcardSetListProps) {
  if (isLoading && sets.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No flashcard sets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first flashcard set by adding your study notes above.
          </p>
          <Badge variant="secondary">Get started by clicking &quot;Create New Set&quot;</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <FlashcardSetCard
            key={set.id}
            set={set}
            onStudy={onStudy}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}