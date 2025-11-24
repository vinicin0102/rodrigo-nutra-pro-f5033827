-- Add image and audio support to community messages
ALTER TABLE public.community_messages
ADD COLUMN image_url TEXT,
ADD COLUMN audio_url TEXT;

-- Create storage bucket for community media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community media
CREATE POLICY "Anyone can view community media"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

CREATE POLICY "Authenticated users can upload community media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own community media"
ON storage.objects FOR DELETE
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create typing indicators table
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'community',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view typing indicators"
ON public.typing_indicators FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own typing indicators"
ON public.typing_indicators FOR ALL
USING (auth.uid() = user_id);

-- Add image support to posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create reactions table
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'love', 'laugh', 'wow', 'fire')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
ON public.post_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON public.post_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
ON public.post_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.post_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id);

-- Add storage bucket for posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for post images
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);