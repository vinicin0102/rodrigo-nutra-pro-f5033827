-- Corrigir search_path das funções
CREATE OR REPLACE FUNCTION public.get_followers_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE following_id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE follower_id = user_id;
$$;