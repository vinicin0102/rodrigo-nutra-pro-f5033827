-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'weekly', 'monthly', 'daily'
  category TEXT NOT NULL, -- 'posts', 'sales', 'engagement', 'community'
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  icon TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table to track progress
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (active = true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert challenge progress"
  ON public.user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(active, end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON public.user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON public.user_challenges(user_id, completed);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_challenges;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  p_user_id UUID,
  p_category TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge RECORD;
  v_user_challenge RECORD;
  v_new_value INTEGER;
BEGIN
  -- Find active challenges in this category
  FOR v_challenge IN
    SELECT * FROM public.challenges
    WHERE category = p_category
    AND active = true
    AND NOW() BETWEEN start_date AND end_date
  LOOP
    -- Get or create user challenge progress
    SELECT * INTO v_user_challenge
    FROM public.user_challenges
    WHERE user_id = p_user_id
    AND challenge_id = v_challenge.id;
    
    IF v_user_challenge IS NULL THEN
      -- Create new progress entry
      INSERT INTO public.user_challenges (user_id, challenge_id, current_value)
      VALUES (p_user_id, v_challenge.id, p_increment);
      v_new_value := p_increment;
    ELSE
      -- Update existing progress
      v_new_value := v_user_challenge.current_value + p_increment;
      
      UPDATE public.user_challenges
      SET 
        current_value = v_new_value,
        updated_at = NOW()
      WHERE id = v_user_challenge.id;
    END IF;
    
    -- Check if challenge is completed
    IF v_new_value >= v_challenge.target_value AND (v_user_challenge IS NULL OR NOT v_user_challenge.completed) THEN
      -- Mark as completed
      UPDATE public.user_challenges
      SET 
        completed = true,
        completed_at = NOW()
      WHERE user_id = p_user_id
      AND challenge_id = v_challenge.id;
      
      -- Award points
      UPDATE public.profiles
      SET points = points + v_challenge.reward_points
      WHERE id = p_user_id;
      
      -- Create notification
      PERFORM create_notification(
        p_user_id,
        'challenge',
        'Desafio Concluído! 🏆',
        'Você completou "' || v_challenge.title || '" e ganhou ' || v_challenge.reward_points || ' pontos de diamante!',
        v_challenge.id
      );
    END IF;
  END LOOP;
END;
$$;

-- Trigger to update challenge progress on new post
CREATE OR REPLACE FUNCTION public.track_post_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_challenge_progress(NEW.user_id, 'posts', 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_track_post_challenge
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.track_post_challenge();

-- Trigger to update challenge progress on community message
CREATE OR REPLACE FUNCTION public.track_community_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_challenge_progress(NEW.user_id, 'community', 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_track_community_challenge
AFTER INSERT ON public.community_messages
FOR EACH ROW
EXECUTE FUNCTION public.track_community_challenge();

-- Trigger to update challenge progress on engagement (likes)
CREATE OR REPLACE FUNCTION public.track_engagement_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_challenge_progress(NEW.user_id, 'engagement', 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_track_engagement_challenge
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.track_engagement_challenge();

-- Insert some initial challenges
INSERT INTO public.challenges (title, description, type, category, target_value, reward_points, icon, start_date, end_date, active)
VALUES
  ('Iniciante da Semana', 'Publique 3 posts esta semana', 'weekly', 'posts', 3, 150, '🚀', NOW(), NOW() + INTERVAL '7 days', true),
  ('Comunicador Ativo', 'Envie 10 mensagens na comunidade', 'weekly', 'community', 10, 100, '💬', NOW(), NOW() + INTERVAL '7 days', true),
  ('Rei do Engajamento', 'Curta 20 publicações', 'weekly', 'engagement', 20, 120, '👑', NOW(), NOW() + INTERVAL '7 days', true),
  ('Mestre do Mês', 'Publique 15 posts este mês', 'monthly', 'posts', 15, 500, '🏆', NOW(), NOW() + INTERVAL '30 days', true),
  ('Comunidade Forte', 'Envie 50 mensagens na comunidade este mês', 'monthly', 'community', 50, 400, '🤝', NOW(), NOW() + INTERVAL '30 days', true),
  ('Super Engajador', 'Curta 100 publicações este mês', 'monthly', 'engagement', 100, 450, '⭐', NOW(), NOW() + INTERVAL '30 days', true)
ON CONFLICT DO NOTHING;