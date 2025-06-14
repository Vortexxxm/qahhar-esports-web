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
import PlayerCard from "@/components/PlayerCard";
import AdminStats from "@/components/admin/AdminStats";
import UsersTable from "@/components/admin/UsersTable";
import PointsManager from "@/components/admin/PointsManager";
import TopPlayers from "@/components/admin/TopPlayers";
import JoinRequests from "@/components/admin/JoinRequests";
import TournamentRegistrations from "@/components/admin/TournamentRegistrations";

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

  // Transform UserWithProfile to PlayerCardData
  const transformToPlayerCardData = (user: UserWithProfile) => {
    return {
      id: user.id,
      username: user.profiles?.username || '',
      full_name: user.profiles?.full_name || '',
      avatar_url: user.profiles?.avatar_url || '',
      rank_title: user.profiles?.rank_title || 'Rookie',
      total_likes: user.profiles?.total_likes || 0,
      bio: user.profiles?.bio || '',
      leaderboard_scores: user.leaderboard_scores ? {
        points: user.leaderboard_scores.points || 0,
        wins: user.leaderboard_scores.wins || 0,
        kills: user.leaderboard_scores.kills || 0,
        deaths: user.leaderboard_scores.deaths || 0,
        visible_in_leaderboard: user.leaderboard_scores.visible_in_leaderboard || false
      } : null
    };
  };

  // Handle edit from PlayerCard
  const handleEditFromPlayerCard = (playerCardData: any) => {
    // Find the original user data
    const originalUser = users?.find(u => u.id === playerCardData.id);
    if (originalUser) {
      setEditingPlayer(originalUser);
    }
  };

  if (loading || usersLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  if (editingPlayer) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <PlayerEditor 
            player={editingPlayer} 
            onClose={() => setEditingPlayer(null)}
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
    <div className="min-h-screen py-4 px-3 md:py-6 md:px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
          <p className="text-white/70 text-sm md:text-base">إدارة أعضاء الفريق والنقاط والإحصائيات</p>
        </div>

        <AdminStats 
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          adminCount={adminCount}
          averagePoints={averagePoints}
        />

        <Tabs defaultValue="requests" className="space-y-3 md:space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="bg-black/20 border border-s3m-red/20 w-full min-w-max flex">
              <TabsTrigger value="requests" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                طلبات الانضمام
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                طلبات البطولات
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                إدارة الأعضاء
              </TabsTrigger>
              <TabsTrigger value="points" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                إدارة النقاط
              </TabsTrigger>
              <TabsTrigger value="players" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                إدارة اللاعبين
              </TabsTrigger>
              <TabsTrigger value="special" className="data-[state=active]:bg-s3m-red text-xs md:text-sm px-3 py-2 whitespace-nowrap">
                اللاعبون المميزون
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="requests">
            <Card className="gaming-card">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-s3m-red text-base md:text-xl">طلبات الانضمام</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <JoinRequests />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card className="gaming-card">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-s3m-red text-base md:text-xl">طلبات المشاركة في البطولات</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <TournamentRegistrations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="gaming-card">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-s3m-red text-base md:text-xl">قائمة الأعضاء</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="overflow-x-auto">
                  <UsersTable 
                    users={users || []}
                    currentUserId={user?.id || ''}
                    onEditPlayer={setEditingPlayer}
                    onToggleRole={handleToggleUserRole}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <div className="grid gap-4 lg:grid-cols-2">
              <PointsManager 
                users={users || []}
                onAddPoints={handleAddPoints}
                isLoading={updatePointsMutation.isPending}
              />
              <TopPlayers users={users || []} />
            </div>
          </TabsContent>

          <TabsContent value="players">
            <Card className="gaming-card">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-s3m-red text-base md:text-xl">إدارة بطاقات اللاعبين</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {users?.map((user) => (
                    <PlayerCard
                      key={user.id}
                      player={transformToPlayerCardData(user)}
                      cardStyle="classic"
                      isAdmin={true}
                      onEdit={handleEditFromPlayerCard}
                      onToggleVisibility={handleToggleVisibility}
                      onSetWeeklyPlayer={handleSetWeeklyPlayer}
                      onSetMonthlyPlayer={handleSetMonthlyPlayer}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special">
            <Card className="gaming-card">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-s3m-red text-base md:text-xl">إدارة اللاعبين المميزين</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {users?.map((user) => (
                    <PlayerCard
                      key={user.id}
                      player={transformToPlayerCardData(user)}
                      cardStyle="classic"
                      isAdmin={true}
                      onEdit={handleEditFromPlayerCard}
                      onToggleVisibility={handleToggleVisibility}
                      onSetWeeklyPlayer={handleSetWeeklyPlayer}
                      onSetMonthlyPlayer={handleSetMonthlyPlayer}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
