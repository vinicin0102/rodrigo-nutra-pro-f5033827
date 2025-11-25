-- Create user_badges table for achievements
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
ON public.user_badges FOR SELECT
USING (true);

-- Create user_subscriptions table for plan management
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Update award_post_points function to give 2 points instead of 50
CREATE OR REPLACE FUNCTION public.award_post_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points (2 points per post)
  UPDATE public.profiles
  SET points = points + 2
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.user_id,
    'points',
    'Pontos de Diamante! 💎',
    'Você ganhou 2 pontos de diamante por sua publicação!',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update post likes count and award 1 point per like instead of 10
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    
    -- Award 1 point to post author
    UPDATE public.profiles
    SET points = points + 1
    WHERE id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    
    -- Remove 1 point from post author
    UPDATE public.profiles
    SET points = points - 1
    WHERE id = (SELECT user_id FROM public.posts WHERE id = OLD.post_id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update posts table to change default points_earned
ALTER TABLE public.posts ALTER COLUMN points_earned SET DEFAULT 2;

-- Function to grant first post badge
CREATE OR REPLACE FUNCTION public.grant_first_post_badge()
RETURNS TRIGGER AS $$
DECLARE
  post_count INTEGER;
BEGIN
  -- Count user's posts
  SELECT COUNT(*) INTO post_count
  FROM public.posts
  WHERE user_id = NEW.user_id;
  
  -- If this is the first post, grant badge
  IF post_count = 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (NEW.user_id, 'first_post', 'Primeira Postagem', '🎉')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Check for post milestones
  IF post_count = 10 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (NEW.user_id, 'posts_10', '10 Postagens', '✍️')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF post_count = 50 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (NEW.user_id, 'posts_50', '50 Postagens', '📝')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_created_badge
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.grant_first_post_badge();

-- Function to grant likes badges
CREATE OR REPLACE FUNCTION public.grant_likes_badges()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  total_likes INTEGER;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Count total likes received by this user
  SELECT SUM(likes_count) INTO total_likes
  FROM public.posts
  WHERE user_id = post_author_id;
  
  -- Grant badges based on total likes
  IF total_likes >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (post_author_id, 'likes_10', '10 Curtidas', '❤️')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  IF total_likes >= 50 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (post_author_id, 'likes_50', '50 Curtidas', '🔥')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  IF total_likes >= 100 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_icon)
    VALUES (post_author_id, 'likes_100', '100 Curtidas', '💎')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_like_badges
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.grant_likes_badges();

-- Create default free subscription for existing users
INSERT INTO public.user_subscriptions (user_id, plan_type)
SELECT id, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;