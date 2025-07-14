import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserActivity: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: '',
            username: '',
          },
        },
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      setSession(data.session);
      await fetchUserRole(data.user?.id);
    } catch (error: any) {
      console.error('Signup error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      setSession(data.session);
      await fetchUserRole(data.user?.id);
    } catch (error: any) {
      console.error('Signin error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Signout error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = useCallback(async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, []);

  const updateUserActivity = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user activity:', error);
      }
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  };

  const checkUserProfile = useCallback(async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      // If it's a new user's first visit, redirect to profile
      if (profile?.is_first_visit) {
        // Mark as no longer first visit
        await supabase
          .from('profiles')
          .update({ is_first_visit: false })
          .eq('id', user.id);
        
        // Redirect to profile page
        window.location.href = '/profile?first_visit=true';
      }
    } catch (error) {
      console.error('Error in checkUserProfile:', error);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await Promise.all([
            fetchUserRole(session.user.id),
            updateUserActivity(session.user.id),
            checkUserProfile(session.user)
          ]);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setUserRole(null);
        
        if (session?.user) {
          await Promise.all([
            fetchUserRole(session.user.id),
            updateUserActivity(session.user.id),
            checkUserProfile(session.user)
          ]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserRole, updateUserActivity, checkUserProfile]);

  const value: AuthContextType = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
