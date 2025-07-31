import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("AuthProvider rendered, user:", user?.id, "role:", userRole, "loading:", loading);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole('user');
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole('user');
    }
  }, []);

  const updateUserActivity = useCallback(async (userId: string) => {
    // Skip activity update to reduce database load
    // This can be done less frequently or only on important actions
    return;
  }, []);

  const checkFirstTimeUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_first_visit, username')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking first time user:", error);
        return;
      }

      // Only redirect if this is truly a first visit and we're not already on edit profile
      if (data?.is_first_visit && window.location.pathname !== '/edit-profile') {
        console.log("First time user detected, redirecting to edit profile");
        navigate('/edit-profile');
      }
    } catch (error) {
      console.error("Error in checkFirstTimeUser:", error);
    }
  }, [navigate]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
          setUserRole(null);
        } else if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
          await checkFirstTimeUser(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in getSession:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
        if (event === 'SIGNED_IN') {
          await checkFirstTimeUser(session.user.id);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, checkFirstTimeUser]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Sign up successful");
        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب",
        });
      }

      return { user: data.user, error };
    } catch (error) {
      console.error("Error in signUp:", error);
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Sign in successful");
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في S3M E-Sports",
        });
      }

      return { user: data.user, error };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Sign out successful");
        setUser(null);
        setUserRole(null);
        navigate('/');
        toast({
          title: "تم تسجيل الخروج",
          description: "شكراً لزيارتك",
        });
      }
    } catch (error) {
      console.error("Error in signOut:", error);
    }
  };

  const value = useMemo(() => ({
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, userRole, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};