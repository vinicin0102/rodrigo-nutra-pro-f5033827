-- Add bio column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create user_awards table to track awards received by users
CREATE TABLE IF NOT EXISTS public.user_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  award_name TEXT NOT NULL,
  award_description TEXT,
  award_category TEXT,
  award_icon TEXT,
  points_cost INTEGER,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_awards
CREATE POLICY "Users can view all awards"
  ON public.user_awards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own awards"
  ON public.user_awards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_awards_user_id ON public.user_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_awards_earned_at ON public.user_awards(earned_at DESC);

-- Create storage bucket for profile avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile avatars
CREATE POLICY "Anyone can view profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Authenticated users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[2] = auth.uid()::text
);

