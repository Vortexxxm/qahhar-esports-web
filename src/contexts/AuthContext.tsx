import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to fetch user role
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  // Function to track user activity
  const trackUserActivity = async (userId: string) => {
    try {
      await supabase.rpc('update_user_activity', { user_uuid: userId });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  };

  // Function to initialize user profile with Google Auth support
  const initializeUserProfile = async (userId: string, userData?: any, isGoogleAuth = false) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Extract name from Google user data
        let username = 'مستخدم';
        let fullName = '';
        
        if (isGoogleAuth && user?.user_metadata) {
          username = user.user_metadata.name?.split(' ')[0] || user.user_metadata.email?.split('@')[0] || 'مستخدم';
          fullName = user.user_metadata.name || user.user_metadata.full_name || '';
        } else if (userData) {
          username = userData.username || user?.email?.split('@')[0] || 'مستخدم';
          fullName = userData.full_name || '';
        }

        // Create new profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            full_name: fullName,
            rank_title: 'Rookie',
            total_likes: 0,
            activity_score: 0,
            is_first_visit: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // Initialize leaderboard score
        const { error: scoreError } = await supabase
          .from('leaderboard_scores')
          .insert({
            user_id: userId,
            points: 0,
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            games_played: 0,
            visible_in_leaderboard: false,
            last_updated: new Date().toISOString(),
          });

        if (scoreError) throw scoreError;

        // Set initial user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'user',
            created_at: new Date().toISOString(),
          });

        if (roleError) throw roleError;

        // Show welcome message for new Google users
        if (isGoogleAuth) {
          toast({
            title: "مرحباً بك في S3M!",
            description: "تم إنشاء حسابك بنجاح باستخدام Google",
          });
        }
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if this is a Google Auth sign-in
          const isGoogleAuth = session.user.app_metadata?.provider === 'google';
          
          // Track user activity and fetch data
          setTimeout(async () => {
            if (mounted) {
              await Promise.all([
                fetchUserRole(session.user.id),
                initializeUserProfile(session.user.id, undefined, isGoogleAuth),
                trackUserActivity(session.user.id)
              ]);
              // Force invalidate all queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['profile'] });
              queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
              queryClient.refetchQueries({ queryKey: ['profile', session.user.id] });
            }
          }, 0);
        } else {
          setUserRole(null);
          // Clear all queries when user logs out
          queryClient.clear();
        }
        
        setLoading(false);
      }
    );

    // Check for existing session on mount
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isGoogleAuth = session.user.app_metadata?.provider === 'google';
          await Promise.all([
            fetchUserRole(session.user.id),
            initializeUserProfile(session.user.id, undefined, isGoogleAuth),
            trackUserActivity(session.user.id)
          ]);
          // Ensure queries are fresh
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.refetchQueries({ queryKey: ['profile', session.user.id] });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, toast, user]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });

      if (error) {
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم التسجيل بنجاح!",
          description: "تم إنشاء حسابك بنجاح",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "مرحباً بك!",
          description: "تم تسجيل الدخول بنجاح",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear all queries from the cache
      queryClient.clear();
      setUser(null);
      setSession(null);
      setUserRole(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
