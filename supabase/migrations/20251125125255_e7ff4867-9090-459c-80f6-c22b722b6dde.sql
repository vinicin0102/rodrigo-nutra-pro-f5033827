-- Trigger for community messages (notify active members)
CREATE OR REPLACE FUNCTION public.notify_community_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_username TEXT;
  v_active_user RECORD;
BEGIN
  -- Get sender username
  SELECT username INTO v_sender_username
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Notify all users who have been active in the last hour (except sender)
  FOR v_active_user IN 
    SELECT DISTINCT user_id 
    FROM public.community_messages
    WHERE created_at > NOW() - INTERVAL '1 hour'
    AND user_id != NEW.user_id
  LOOP
    -- Create notification
    PERFORM create_notification(
      v_active_user.user_id,
      'message',
      'Nova mensagem na comunidade! 💬',
      v_sender_username || ' enviou uma mensagem',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_community_message
AFTER INSERT ON public.community_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_community_message();