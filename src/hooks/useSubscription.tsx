import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  plan_type: 'free' | 'premium';
  is_active: boolean;
  expires_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data ? {
        plan_type: data.plan_type as 'free' | 'premium',
        is_active: data.is_active,
        expires_at: data.expires_at
      } : { plan_type: 'free', is_active: true, expires_at: null });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription?.plan_type === 'premium' && subscription?.is_active;

  return {
    subscription,
    isPremium,
    loading,
    refetch: fetchSubscription
  };
};
