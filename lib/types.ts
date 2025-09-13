// User and tier related types
export type UserTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  tier: UserTier;
  flashcards_generated_this_month: number;
  monthly_limit: number;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Flashcard related types
export interface Flashcard {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  difficulty: number; // 1-5 scale
  times_reviewed: number;
  times_correct: number;
  last_reviewed_at?: string;
  created_at: string;
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  original_notes: string;
  flashcard_count: number;
  created_at: string;
  updated_at: string;
  flashcards?: Flashcard[];
}

// API request/response types
export interface CreateFlashcardSetRequest {
  title: string;
  description?: string;
  notes: string;
}

export interface CreateFlashcardSetResponse {
  success: boolean;
  flashcard_set?: FlashcardSet;
  error?: string;
  usage?: {
    generated_this_month: number;
    monthly_limit: number;
    remaining: number;
  };
}

export interface GenerateFlashcardsRequest {
  notes: string;
  count?: number; // Optional: specify number of flashcards to generate
}

export interface GenerateFlashcardsResponse {
  success: boolean;
  flashcards?: Array<{
    question: string;
    answer: string;
    difficulty?: number;
  }>;
  error?: string;
  usage?: {
    generated_this_month: number;
    monthly_limit: number;
    remaining: number;
  };
}

// User usage response type
export interface UserUsageResponse {
  success: boolean;
  usage: {
    generated_this_month: number;
    monthly_limit: number;
    remaining: number;
  };
  tier: UserTier;
  subscription_expires_at?: string;
  error?: string;
}

// Payment related types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  tier_purchased: UserTier;
  expires_at?: string;
  cryptomus_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  tier: 'premium';
  amount: number;
  currency?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

// Study session types
export interface StudySession {
  flashcard_id: string;
  is_correct: boolean;
  difficulty_rating?: number;
  time_taken?: number; // in seconds
}

export interface StudySessionResult {
  total_cards: number;
  correct_answers: number;
  accuracy: number;
  average_time: number;
  session_duration: number;
}

// UI component props types
export interface FlashcardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onMarkCorrect: (correct: boolean) => void;
}

export interface FlashcardSetCardProps {
  set: FlashcardSet;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Form types
export interface CreateSetFormData {
  title: string;
  description: string;
  notes: string;
}

export interface EditSetFormData {
  title: string;
  description: string;
}

// Error types
export interface APIError {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Tier limits configuration
export interface TierLimits {
  free: {
    monthly_flashcard_limit: number;
    max_sets: number;
    max_flashcards_per_set: number;
  };
  premium: {
    monthly_flashcard_limit: number;
    max_sets: number;
    max_flashcards_per_set: number;
  };
}