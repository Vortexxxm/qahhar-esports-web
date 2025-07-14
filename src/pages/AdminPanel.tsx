import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AILeaderboardManager from "@/components/admin/AILeaderboardManager";
import PushNotificationSender from "@/components/admin/PushNotificationSender";
import PointsManager from "@/components/admin/PointsManager";
import UsersTable from "@/components/admin/UsersTable";
import VideoManager from "@/components/admin/VideoManager";
import TopPlayers from "@/components/admin/TopPlayers";
import type { Database } from "@/integrations/supabase/types";

type UserWithProfile = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  user_roles: { role: string }[] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

const AdminPanel = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [roleLoading, setRoleLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || authLoading) {
        setRoleLoading(true);
        return;
      }

      console.log('Checking admin access for user:', user.id);
      console.log('Current user role:', userRole);

      // Check if userRole is already available from context
      if (userRole) {
        const isAdmin = userRole === 'admin';
        setHasAccess(isAdmin);
        setRoleLoading(false);
        
        if (!isAdmin) {
          toast({
            title: "غير مصرح",
            description: "ليس لديك صلاحية للوصول لهذه الصفحة",
            variant: "destructive",
          });
        }
        return;
      }

      // Fallback: Check role directly from database
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          toast({
            title: "خطأ",
            description: "فشل في التحقق من الصلاحيات",
            variant: "destructive",
          });
          setHasAccess(false);
        } else {
          const isAdmin = data?.role === 'admin';
          setHasAccess(isAdmin);
          
          if (!isAdmin) {
            toast({
              title: "غير مصرح",
              description: "ليس لديك صلاحية للوصول لهذه الصفحة",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        setHasAccess(false);
      } finally {
        setRoleLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, userRole, authLoading, toast]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          game_id,
          phone_number
        `);

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const { data: scores, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (scoresError) throw scoresError;

      return profiles?.map(profile => ({
        id: profile.id,
        profiles: profile,
        user_roles: roles?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || [],
        leaderboard_scores: scores?.find(s => s.user_id === profile.id) || null
      })) as UserWithProfile[];
    },
    enabled: hasAccess && !authLoading && !roleLoading,
  });

  const updatePointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: string; points: number }) => {
      const { error } = await supabase
        .from('leaderboard_scores')
        .upsert({
          user_id: userId,
          points: points,
          visible_in_leaderboard: true,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      // تحديث الترتيب
      await supabase.rpc('update_leaderboard_rankings');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث النقاط بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث النقاط",
        variant: "destructive",
      });
    },
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, currentRole }: { userId: string; currentRole: string }) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
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
        description: "تم تحديث دور المستخدم بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الدور",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ userId, currentVisibility }: { userId: string; currentVisibility: boolean }) => {
      const { error } = await supabase
        .from('leaderboard_scores')
        .update({ visible_in_leaderboard: !currentVisibility })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الرؤية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الرؤية",
        variant: "destructive",
      });
    },
  });

  // Show loading while checking authentication
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red mx-auto mb-4"></div>
          <div className="text-white text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-gray-400">إدارة المحتوى والمستخدمين والبطولات</p>
        </div>

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="bg-black/50 border-s3m-red/30">
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              إحصائيات
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              المتصدرين
            </TabsTrigger>
            <TabsTrigger value="video" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              الفيديو الترويجي
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">إحصائيات الموقع</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium">المستخدمين النشطين</h4>
                    <p className="text-2xl font-bold text-s3m-red mt-2">{users?.length || 0}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium">البطولات النشطة</h4>
                    <p className="text-2xl font-bold text-s3m-red mt-2">0</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium">الأخبار المنشورة</h4>
                    <p className="text-2xl font-bold text-s3m-red mt-2">0</p>
                  </div>
                </div>
              </div>
              {users && <TopPlayers users={users} />}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">إدارة المستخدمين</h3>
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red mx-auto"></div>
                  <p className="text-white mt-4">جاري التحميل...</p>
                </div>
              ) : users ? (
                <UsersTable
                  users={users}
                  currentUserId={user?.id || ''}
                  onEditPlayer={() => {}}
                  onToggleRole={(userId, currentRole) => 
                    toggleRoleMutation.mutate({ userId, currentRole })
                  }
                  onToggleVisibility={(userId, currentVisibility) =>
                    toggleVisibilityMutation.mutate({ userId, currentVisibility })
                  }
                  onSetWeeklyPlayer={() => {}}
                  onSetMonthlyPlayer={() => {}}
                />
              ) : (
                <p className="text-gray-400">لا توجد بيانات</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PointsManager
                users={users || []}
                onAddPoints={(userId, points) => updatePointsMutation.mutate({ userId, points })}
                isLoading={updatePointsMutation.isPending}
              />
              <AILeaderboardManager />
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <VideoManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationSender />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
