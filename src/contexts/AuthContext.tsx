
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log("Getting initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        } else if (session?.user) {
          console.log("Session found, user:", session.user.id);
          setUser(session.user);
          await fetchUserRole(session.user.id);
          await updateUserActivity(session.user.id);
        } else {
          console.log("No session found");
        }
      } catch (error) {
        console.error("Error in getSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
        await updateUserActivity(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole('user'); // Default role
      } else {
        console.log("User role fetched:", data?.role);
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole('user');
    }
  };

  const updateUserActivity = async (userId: string) => {
    try {
      console.log("Updating user activity for:", userId);
      const { error } = await supabase.rpc('update_user_activity', {
        user_uuid: userId
      });

      if (error) {
        console.error("Error updating user activity:", error);
      }
    } catch (error) {
      console.error("Error in updateUserActivity:", error);
    }
  };

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

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
