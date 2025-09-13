-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with tier information
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  flashcards_generated_this_month integer DEFAULT 0,
  monthly_limit integer DEFAULT 10, -- Free tier gets 10, premium gets unlimited
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Flashcard sets table
CREATE TABLE IF NOT EXISTS public.flashcard_sets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  original_notes text NOT NULL,
  flashcard_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Individual flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id uuid REFERENCES public.flashcard_sets(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  difficulty integer DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  times_reviewed integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id text UNIQUE, -- Cryptomus transaction ID
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  tier_purchased text NOT NULL CHECK (tier_purchased IN ('premium')),
  expires_at timestamp with time zone, -- When the premium subscription expires
  cryptomus_data jsonb, -- Store raw response from Cryptomus
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_id ON public.flashcard_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_set_id ON public.flashcards(set_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow initial user profile creation" ON public.users;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Insert policy for new users (allow initial profile creation)
CREATE POLICY "Allow initial user profile creation" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing flashcard set policies if they exist
DROP POLICY IF EXISTS "Users can view own flashcard sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can insert own flashcard sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can update own flashcard sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can delete own flashcard sets" ON public.flashcard_sets;

-- Users can only access their own flashcard sets
CREATE POLICY "Users can view own flashcard sets" ON public.flashcard_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard sets" ON public.flashcard_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard sets" ON public.flashcard_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcard sets" ON public.flashcard_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing flashcard policies if they exist
DROP POLICY IF EXISTS "Users can view own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can insert flashcards to own sets" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can delete own flashcards" ON public.flashcards;

-- Users can only access flashcards from their own sets
CREATE POLICY "Users can view own flashcards" ON public.flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcards to own sets" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own flashcards" ON public.flashcards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own flashcards" ON public.flashcards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

-- Drop existing payment transaction policies if they exist
DROP POLICY IF EXISTS "Users can view own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can insert own payment transactions" ON public.payment_transactions;

-- Users can only view their own payment transactions
CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_flashcard_sets_updated_at ON public.flashcard_sets;
DROP TRIGGER IF EXISTS handle_payment_transactions_updated_at ON public.payment_transactions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_flashcard_sets_updated_at
  BEFORE UPDATE ON public.flashcard_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to reset monthly flashcard count
CREATE OR REPLACE FUNCTION public.reset_monthly_flashcard_count()
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET flashcards_generated_this_month = 0
  WHERE DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', updated_at);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();