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
import AILeaderboardManager from "@/components/admin/AILeaderboardManager";
import { Shield, Users, Trophy, Settings, FileText, Video, UserPlus, Calendar, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const { data: scoresData, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (scoresError) throw scoresError;

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
          <div className="w-12 h-12 border-4 border-s3m-red border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">جاري التحميل...</div>
          <div className="text-white/60 text-sm mt-2">يرجى الانتظار</div>
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
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-s3m-red/30 shadow-lg">
        <div className="container mx-auto max-w-7xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-s3m-red/20 to-red-600/20 rounded-xl border border-s3m-red/30">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-s3m-red" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
                  لوحة الإدارة
                </h1>
                <p className="text-white/70 text-xs md:text-sm hidden sm:block">
                  إدارة النظام والمستخدمين بسهولة
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-white/90 text-sm md:text-base font-medium">
                  مرحباً {user?.email?.split('@')[0]}
                </p>
                <p className="text-s3m-red text-xs md:text-sm font-bold">المدير العام ⭐</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white hover:bg-s3m-red/20 border border-s3m-red/30"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 p-3 bg-black/40 rounded-lg border border-s3m-red/20">
              <p className="text-white text-sm font-medium">
                مرحباً {user?.email?.split('@')[0]}
              </p>
              <p className="text-s3m-red text-xs font-bold">المدير العام ⭐</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 md:p-6 space-y-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <AdminStats 
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              adminCount={adminCount}
              averagePoints={averagePoints}
            />
          </div>

          <Tabs defaultValue="requests" className="space-y-4">
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <TabsList className="bg-gradient-to-r from-black/60 to-gray-900/60 border border-s3m-red/40 backdrop-blur-md w-full min-w-max flex p-1.5 rounded-xl shadow-lg">
                <TabsTrigger 
                  value="requests" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">طلبات الانضمام</span>
                  <span className="sm:hidden">الطلبات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tournaments" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">البطولات</span>
                  <span className="sm:hidden">البطولات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">الأعضاء</span>
                  <span className="sm:hidden">الأعضاء</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="points" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">النقاط</span>
                  <span className="sm:hidden">النقاط</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ai-leaderboard" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">الذكاء الاصطناعي</span>
                  <span className="sm:hidden">الذكاء</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-s3m-red data-[state=active]:to-red-600 data-[state=active]:text-white text-white/80 text-xs md:text-sm px-3 md:px-5 py-2.5 whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">الفيديو</span>
                  <span className="sm:hidden">الفيديو</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="requests" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 p-4 md:p-6 border-b border-s3m-red/20">
                  <CardTitle className="text-s3m-red text-base md:text-xl flex items-center gap-3 font-bold">
                    <div className="p-2 bg-s3m-red/20 rounded-lg">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    طلبات الانضمام الجديدة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <JoinRequests />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 p-4 md:p-6 border-b border-s3m-red/20">
                  <CardTitle className="text-s3m-red text-base md:text-xl flex items-center gap-3 font-bold">
                    <div className="p-2 bg-s3m-red/20 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    طلبات المشاركة في البطولات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <TournamentRegistrations />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 p-4 md:p-6 border-b border-s3m-red/20">
                  <CardTitle className="text-s3m-red text-base md:text-xl flex items-center gap-3 font-bold">
                    <div className="p-2 bg-s3m-red/20 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    إدارة الأعضاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
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

            <TabsContent value="points" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                  <CardHeader className="pb-3 p-4 border-b border-s3m-red/20">
                    <CardTitle className="text-s3m-red text-base md:text-lg flex items-center gap-3 font-bold">
                      <div className="p-2 bg-s3m-red/20 rounded-lg">
                        <Trophy className="w-4 h-4" />
                      </div>
                      إدارة النقاط
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <PointsManager 
                      users={users || []}
                      onAddPoints={handleAddPoints}
                      isLoading={updatePointsMutation.isPending}
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                  <CardHeader className="pb-3 p-4 border-b border-s3m-red/20">
                    <CardTitle className="text-s3m-red text-base md:text-lg flex items-center gap-3 font-bold">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      </div>
                      أفضل اللاعبين
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <TopPlayers users={users || []} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-leaderboard" className="mt-6">
              <AILeaderboardManager />
            </TabsContent>

            <TabsContent value="video" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/40 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 p-4 md:p-6 border-b border-s3m-red/20">
                  <CardTitle className="text-s3m-red text-base md:text-xl flex items-center gap-3 font-bold">
                    <div className="p-2 bg-s3m-red/20 rounded-lg">
                      <Video className="w-5 h-5" />
                    </div>
                    إدارة الفيديوهات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <VideoManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
