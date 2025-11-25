-- Criar tabela de seguidores
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Índices para performance
CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);

-- Habilitar RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver relacionamentos de seguir"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem seguir outros"
  ON public.followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Usuários podem deixar de seguir"
  ON public.followers FOR DELETE
  USING (auth.uid() = follower_id);

-- Função para contar seguidores
CREATE OR REPLACE FUNCTION public.get_followers_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE following_id = user_id;
$$;

-- Função para contar seguindo
CREATE OR REPLACE FUNCTION public.get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE follower_id = user_id;
$$;

-- Adicionar colunas de contagem no perfil (desnormalizado para performance)
ALTER TABLE public.profiles
ADD COLUMN followers_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN following_count INTEGER DEFAULT 0 NOT NULL;

-- Trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contadores
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contadores
    UPDATE public.profiles
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id;
    
    UPDATE public.profiles
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_counts();