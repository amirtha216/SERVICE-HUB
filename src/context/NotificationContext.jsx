import { createContext, useContext, useReducer, useEffect } from 'react';
import supabase from '../lib/supabase';
import { mapNotificationFromDb, mapNotificationToDb } from '../utils/supabaseHelpers';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const initialState = {
  notifications: [],
  loading: false
};

const notifReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATIONS':
      return { notifications: action.payload, loading: false };
    case 'ADD':
      return { notifications: [action.payload, ...state.notifications], loading: false };
    case 'MARK_READ':
      return {
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        loading: false
      };
    case 'MARK_ALL_READ':
      return {
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        loading: false
      };
    case 'DELETE':
      return {
        notifications: state.notifications.filter(n => n.id !== action.payload),
        loading: false
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notifReducer, initialState);
  const { user } = useAuth();

  // Fetch notifications from Supabase when user changes
  useEffect(() => {
    if (!user?.id) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      return;
    }

    const fetchNotifications = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data.map(mapNotificationFromDb) });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchNotifications();

    // Set up real-time listener for notification changes for this user
    const channel = supabase
      .channel(`notifications-changes-${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD', payload: mapNotificationFromDb(payload.new) });
        } else if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'MARK_READ', payload: payload.new.id });
        } else if (payload.eventType === 'DELETE') {
          dispatch({ type: 'DELETE', payload: payload.old.id });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const addNotification = async (notif) => {
    const id = `notif_${Date.now()}`;
    const newNotif = {
      id,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      isRead: false,
      link: notif.link || '',
      createdAt: new Date().toISOString()
    };

    const dbNotif = mapNotificationToDb(newNotif);

    const { error } = await supabase
      .from('notifications')
      .insert([dbNotif]);

    if (error) {
      console.error('Error adding notification:', error);
    } else {
      dispatch({ type: 'ADD', payload: newNotif });
    }
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      dispatch({ type: 'MARK_READ', payload: id });
    }
  };

  const markAllAsRead = async (userId) => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    } else {
      dispatch({ type: 'MARK_ALL_READ' });
    }
  };

  const deleteNotification = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
    } else {
      dispatch({ type: 'DELETE', payload: id });
    }
  };

  const getUnreadCount = (userId) => 
    state.notifications.filter(n => n.userId === userId && !n.isRead).length;

  const getUserNotifications = (userId) =>
    state.notifications.filter(n => n.userId === userId);

  return (
    <NotificationContext.Provider value={{
      ...state,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getUnreadCount,
      getUserNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default NotificationContext;
