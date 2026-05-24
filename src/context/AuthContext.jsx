import { createContext, useContext, useReducer, useEffect } from 'react';
import storageKeys, { storage } from '../utils/storage';
import authService from '../services/authService';
import supabase from '../lib/supabase';
import { mapProfileFromDb } from '../utils/supabaseHelpers';

const AuthContext = createContext(null);

const initialState = {
  user: storage.get(storageKeys.USER),
  isAuthenticated: !!storage.get(storageKeys.USER),
  loading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.user) {
      storage.set(storageKeys.USER, state.user);
    }
  }, [state.user]);

  // Subscribe to real-time updates for the logged-in user's profile row
  useEffect(() => {
    if (!state.user?.id) return;

    const channel = supabase
      .channel(`user-profile-sync-${state.user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${state.user.id}` 
        },
        (payload) => {
          if (payload.new) {
            console.log('Real-time profile sync:', payload.new);
            dispatch({ type: 'UPDATE_USER', payload: mapProfileFromDb(payload.new) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user?.id]);

  const login = async (email, password, role) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await authService.login(email, password, role);
      if (res.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: res.user });
        storage.set(storageKeys.USER, res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Invalid credentials');
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
      return { success: false, error: err.message };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await authService.signup(userData);
      if (res.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: res.user });
        storage.set(storageKeys.USER, res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Signup failed');
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    storage.remove(storageKeys.USER);
  };

  const updateProfile = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      updateProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
