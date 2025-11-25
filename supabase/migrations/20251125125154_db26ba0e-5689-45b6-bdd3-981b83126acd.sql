-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'points', 'comment', 'like', 'message'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID, -- ID of the related post, comment, etc
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_reference_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger for post likes (notify post author)
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_liker_username TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker username
  SELECT username INTO v_liker_username
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_post_author_id,
    'like',
    'Nova curtida! 💖',
    v_liker_username || ' curtiu sua publicação',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_like();

-- Trigger for comments (notify post author)
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_username TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user commented on their own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter username
  SELECT username INTO v_commenter_username
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_post_author_id,
    'comment',
    'Novo comentário! 💬',
    v_commenter_username || ' comentou em sua publicação',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_comment();

-- Trigger for post reactions (notify post author)
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_reactor_username TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user reacted to their own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get reactor username
  SELECT username INTO v_reactor_username
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_post_author_id,
    'reaction',
    'Nova reação! ' || NEW.reaction,
    v_reactor_username || ' reagiu à sua publicação',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_reaction
AFTER INSERT ON public.post_reactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_reaction();

-- Update the award_post_points function to send notification
CREATE OR REPLACE FUNCTION public.award_post_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update points
  UPDATE public.profiles
  SET points = points + NEW.points_earned
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.user_id,
    'points',
    'Pontos de Diamante! 💎',
    'Você ganhou ' || NEW.points_earned || ' pontos de diamante por sua publicação!',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;