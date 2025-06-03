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

  // Function to initialize user profile
  const initializeUserProfile = async (userId: string, userData?: any) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: userData?.username || user?.email?.split('@')[0] || 'مستخدم',
            full_name: userData?.full_name || '',
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
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
          await initializeUserProfile(session.user.id);
          // Invalidate and refetch relevant queries
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        initializeUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

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