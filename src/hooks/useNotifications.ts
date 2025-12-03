import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from './useNotificationPreferences';

export interface Notification {
  id: string;
  user_id: string;
  type: 'health_score_change' | 'goal_completed' | 'goal_failed' | 'new_check_in' | 'squad_goal_progress' | 'client_at_risk';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  client_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Sound configuration for each notification type
type NotificationType = Notification['type'];

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  pattern?: number[];
}

const soundConfigs: Record<NotificationType, SoundConfig> = {
  client_at_risk: {
    frequency: 440,
    duration: 0.15,
    type: 'square',
    volume: 0.3,
    pattern: [440, 0, 440, 0, 440]
  },
  goal_completed: {
    frequency: 523,
    duration: 0.12,
    type: 'sine',
    volume: 0.25,
    pattern: [523, 659, 784]
  },
  goal_failed: {
    frequency: 294,
    duration: 0.2,
    type: 'triangle',
    volume: 0.25,
    pattern: [392, 294]
  },
  new_check_in: {
    frequency: 587,
    duration: 0.1,
    type: 'sine',
    volume: 0.2,
    pattern: [587, 698]
  },
  squad_goal_progress: {
    frequency: 440,
    duration: 0.15,
    type: 'sine',
    volume: 0.2,
    pattern: [440, 554]
  },
  health_score_change: {
    frequency: 349,
    duration: 0.12,
    type: 'sine',
    volume: 0.2,
    pattern: [349, 440]
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const { preferences } = useNotificationPreferences();
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType, volume: number, startTime: number) => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, [getAudioContext]);

  const playNotificationSound = useCallback((type: NotificationType) => {
    if (!preferences?.sound_enabled) return;
    if (preferences && !preferences[type]) return;

    const config = soundConfigs[type];
    if (!config) return;

    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      if (config.pattern) {
        config.pattern.forEach((freq, index) => {
          if (freq > 0) {
            playTone(freq, config.duration, config.type, config.volume, now + index * (config.duration + 0.05));
          }
        });
      } else {
        playTone(config.frequency, config.duration, config.type, config.volume, now);
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [preferences, getAudioContext, playTone]);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id
  });

  // Real-time subscription with sound
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          // Play sound for new notification
          const newNotification = payload.new as Notification;
          if (newNotification?.type) {
            playNotificationSound(newNotification.type);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, playNotificationSound]);

  // Update unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    playNotificationSound
  };
};
