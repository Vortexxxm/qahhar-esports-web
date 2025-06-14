import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import PlayerEditor from "@/components/PlayerEditor";
import AdminStats from "@/components/admin/AdminStats";
import UsersTable from "@/components/admin/UsersTable";
import PointsManager from "@/components/admin/PointsManager";
import TopPlayers from "@/components/admin/TopPlayers";
import JoinRequests from "@/components/admin/JoinRequests";
import TournamentRegistrations from "@/components/admin/TournamentRegistrations";
import VideoManager from "@/components/admin/VideoManager";
import { Shield, Users, Trophy, Settings, FileText, Video, UserPlus, Calendar } from "lucide-react";

type UserWithProfile = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  user_roles: { role: string }[] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

const AdminPanel = () => {
  const { toast } = useToast();
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingPlayer, setEditingPlayer] = useState<UserWithProfile | null>(null);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      navigate('/');
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى لوحة الإدارة",
        variant: "destructive",
      });
    }
  }, [user, userRole, loading, navigate, toast]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get user roles for each profile
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Get leaderboard scores for each profile
      const { data: scoresData, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (scoresError) throw scoresError;

      // Combine the data
      const combinedData: UserWithProfile[] = profilesData.map(profile => ({
        id: profile.id,
        profiles: profile,
        user_roles: rolesData.filter(role => role.user_id === profile.id).map(role => ({ role: role.role })),
        leaderboard_scores: scoresData.find(score => score.user_id === profile.id) || null,
      }));

      return combinedData;
    },
    enabled: userRole === 'admin',
  });

  const updatePointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: string; points: number }) => {
      const { error } = await supabase
        .from('leaderboard_scores')
        .update({ 
          points: points,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update rankings
      await supabase.rpc('update_leaderboard_rankings');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم بنجاح!",
        description: "تم تحديث النقاط بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "admin" | "moderator" | "user" }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "تم التحديث",
        description: "تم تغيير دور المستخدم بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ userId, visibility }: { userId: string; visibility: boolean }) => {
      const { error } = await supabase
        .from('leaderboard_scores')
        .update({ 
          visible_in_leaderboard: visibility,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update rankings if making visible
      if (visibility) {
        await supabase.rpc('update_leaderboard_rankings');
      }
    },
    onSuccess: (_, { visibility }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم التحديث",
        description: visibility ? "تم إظهار اللاعب في المتصدرين" : "تم إخفاء اللاعب من المتصدرين",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setWeeklyPlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase.rpc('set_weekly_player', { player_id: playerId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-players'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديد لاعب الأسبوع بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setMonthlyPlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase.rpc('set_monthly_player', { player_id: playerId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-players'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديد لاعب الشهر بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddPoints = (userId: string, points: number) => {
    updatePointsMutation.mutate({ userId, points });
  };

  const handleToggleUserRole = (userId: string, currentRole: string) => {
    const newRole: "admin" | "moderator" | "user" = currentRole === 'admin' ? 'user' : 'admin';
    updateUserRoleMutation.mutate({ userId, newRole });
  };

  const handleToggleVisibility = (userId: string, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ userId, visibility: !currentVisibility });
  };

  const handleSetWeeklyPlayer = (playerId: string) => {
    setWeeklyPlayerMutation.mutate(playerId);
  };

  const handleSetMonthlyPlayer = (playerId: string) => {
    setMonthlyPlayerMutation.mutate(playerId);
  };

  if (loading || usersLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-s3m-red/20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-s3m-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  if (editingPlayer) {
    return (
      <div className="min-h-screen py-4 px-2 md:py-6 md:px-4 bg-gradient-to-br from-black via-gray-900 to-s3m-red/20">
        <div className="container mx-auto max-w-4xl">
          <PlayerEditor 
            player={editingPlayer} 
            onClose={() => setEditingPlayer(null)}
            onSetWeeklyPlayer={handleSetWeeklyPlayer}
            onSetMonthlyPlayer={handleSetMonthlyPlayer}
          />
        </div>
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.user_roles?.[0]?.role === 'admin').length || 0;
  const averagePoints = users?.length ? Math.round(users.reduce((sum, u) => sum + (u.leaderboard_scores?.points || 0), 0) / users.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-s3m-red/20">
      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-s3m-red/20 p-3 md:p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-s3m-red" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
                  لوحة الإدارة
                </h1>
                <p className="text-white/60 text-xs md:text-sm hidden md:block">
                  إدارة النظام والمستخدمين
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs md:text-sm font-medium">
                مرحباً {user?.email?.split('@')[0]}
              </p>
              <p className="text-s3m-red text-xs">المدير العام</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        <div className="container mx-auto max-w-7xl">
          {/* Mobile-optimized stats */}
          <div className="mb-4">
            <AdminStats 
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              adminCount={adminCount}
              averagePoints={averagePoints}
            />
          </div>

          {/* Enhanced Mobile Tabs */}
          <Tabs defaultValue="requests" className="space-y-3">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="bg-black/40 border border-s3m-red/30 backdrop-blur-sm w-full min-w-max flex p-1 rounded-lg">
                <TabsTrigger 
                  value="requests" 
                  className="data-[state=active]:bg-s3m-red data-[state=active]:text-white text-white/70 text-xs md:text-sm px-2 md:px-4 py-2 whitespace-nowrap rounded-md transition-all duration-200 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">طلبات الانضمام</span>
                  <span className="sm:hidden">الطلبات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tournaments" 
                  className="data-[state=active]:bg-s3m-red data-[state=active]:text-white text-white/70 text-xs md:text-sm px-2 md:px-4 py-2 whitespace-nowrap rounded-md transition-all duration-200 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">البطولات</span>
                  <span className="sm:hidden">البطولات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-s3m-red data-[state=active]:text-white text-white/70 text-xs md:text-sm px-2 md:px-4 py-2 whitespace-nowrap rounded-md transition-all duration-200 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">الأعضاء</span>
                  <span className="sm:hidden">الأعضاء</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="points" 
                  className="data-[state=active]:bg-s3m-red data-[state=active]:text-white text-white/70 text-xs md:text-sm px-2 md:px-4 py-2 whitespace-nowrap rounded-md transition-all duration-200 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">النقاط</span>
                  <span className="sm:hidden">النقاط</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="data-[state=active]:bg-s3m-red data-[state=active]:text-white text-white/70 text-xs md:text-sm px-2 md:px-4 py-2 whitespace-nowrap rounded-md transition-all duration-200 flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">الفيديو</span>
                  <span className="sm:hidden">الفيديو</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile-optimized tab content */}
            <TabsContent value="requests">
              <Card className="gaming-card border-s3m-red/30">
                <CardHeader className="pb-2 p-3 md:p-4">
                  <CardTitle className="text-s3m-red text-sm md:text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    طلبات الانضمام
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <JoinRequests />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments">
              <Card className="gaming-card border-s3m-red/30">
                <CardHeader className="pb-2 p-3 md:p-4">
                  <CardTitle className="text-s3m-red text-sm md:text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    طلبات المشاركة في البطولات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <TournamentRegistrations />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="gaming-card border-s3m-red/30">
                <CardHeader className="pb-2 p-3 md:p-4">
                  <CardTitle className="text-s3m-red text-sm md:text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    قائمة الأعضاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 md:p-4">
                  <div className="overflow-x-auto">
                    <UsersTable 
                      users={users || []}
                      currentUserId={user?.id || ''}
                      onEditPlayer={setEditingPlayer}
                      onToggleRole={handleToggleUserRole}
                      onToggleVisibility={handleToggleVisibility}
                      onSetWeeklyPlayer={handleSetWeeklyPlayer}
                      onSetMonthlyPlayer={handleSetMonthlyPlayer}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="points">
              <div className="grid gap-3 lg:grid-cols-2">
                <PointsManager 
                  users={users || []}
                  onAddPoints={handleAddPoints}
                  isLoading={updatePointsMutation.isPending}
                />
                <TopPlayers users={users || []} />
              </div>
            </TabsContent>

            <TabsContent value="video">
              <VideoManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
