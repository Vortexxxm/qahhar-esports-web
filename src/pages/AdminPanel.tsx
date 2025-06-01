import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Settings, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import PlayerEditor from "@/components/PlayerEditor";

type UserWithProfile = {
  id: string;
  email: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  user_roles: { role: string }[];
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

const AdminPanel = () => {
  const { toast } = useToast();
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
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
  }, [user, userRole, loading, navigate]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role),
          leaderboard_scores (*)
        `);

      if (error) throw error;
      return data as UserWithProfile[];
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
      setPointsToAdd("");
      setSelectedUserId("");
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
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
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

  const handleAddPoints = () => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0 || !selectedUserId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مستخدم وإدخال رقم صحيح للنقاط",
        variant: "destructive",
      });
      return;
    }

    const user = users?.find(u => u.id === selectedUserId);
    const currentPoints = user?.leaderboard_scores?.points || 0;
    const newPoints = currentPoints + points;

    updatePointsMutation.mutate({ userId: selectedUserId, points: newPoints });
  };

  const handleToggleUserRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateUserRoleMutation.mutate({ userId, newRole });
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

  const stats = [
    { title: "إجمالي الأعضاء", value: users?.length.toString() || "0", icon: Users, color: "text-blue-400" },
    { title: "الأعضاء النشطين", value: users?.length.toString() || "0", icon: UserCheck, color: "text-green-400" },
    { title: "المديرين", value: users?.filter(u => u.user_roles?.[0]?.role === 'admin').length.toString() || "0", icon: Trophy, color: "text-yellow-400" },
    { title: "متوسط النقاط", value: users?.length ? Math.round(users.reduce((sum, u) => sum + (u.leaderboard_scores?.points || 0), 0) / users.length).toString() : "0", icon: Settings, color: "text-purple-400" },
  ];

  if (editingPlayer) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <PlayerEditor 
            player={editingPlayer} 
            onClose={() => setEditingPlayer(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
          <p className="text-white/70">إدارة أعضاء الفريق والنقاط والإحصائيات</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/20 border border-s3m-red/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-s3m-red">
              إدارة الأعضاء
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-s3m-red">
              إدارة النقاط
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-s3m-red">قائمة الأعضاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-s3m-red/20">
                      <tr>
                        <th className="text-right py-3 text-white/80">المستخدم</th>
                        <th className="text-right py-3 text-white/80">النقاط</th>
                        <th className="text-right py-3 text-white/80">الدور</th>
                        <th className="text-right py-3 text-white/80">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((userData) => (
                        <tr key={userData.id} className="border-b border-white/10">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={userData.profiles?.avatar_url || ""} />
                                <AvatarFallback className="bg-s3m-red text-white">
                                  {(userData.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-semibold">
                                  {userData.profiles?.username || 'مجهول'}
                                </p>
                                <p className="text-white/60 text-sm">
                                  {userData.profiles?.full_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-s3m-red font-bold">
                              {userData.leaderboard_scores?.points?.toLocaleString() || '0'}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge className={userData.user_roles?.[0]?.role === "admin" ? "bg-gradient-to-r from-s3m-red to-red-600" : "bg-white/20"}>
                              {userData.user_roles?.[0]?.role === "admin" ? "مدير" : "عضو"}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPlayer(userData)}
                                className="border-s3m-red/30"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserRole(userData.id, userData.user_roles?.[0]?.role || 'user')}
                                className="border-s3m-red/30"
                                disabled={userData.id === user?.id}
                              >
                                {userData.user_roles?.[0]?.role === "admin" ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-s3m-red">إضافة نقاط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">اختر اللاعب</Label>
                    <select 
                      className="w-full p-3 bg-black/20 border border-s3m-red/30 rounded-lg text-white"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">اختر لاعب</option>
                      {users?.map(userData => (
                        <option key={userData.id} value={userData.id}>
                          {userData.profiles?.username || 'مجهول'} - {userData.leaderboard_scores?.points || 0} نقطة
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">عدد النقاط</Label>
                    <Input
                      type="number"
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(e.target.value)}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="مثال: 100"
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                    onClick={handleAddPoints}
                    disabled={updatePointsMutation.isPending}
                  >
                    {updatePointsMutation.isPending ? "جاري الإضافة..." : "إضافة النقاط"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-s3m-red">أفضل اللاعبين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      ?.sort((a, b) => (b.leaderboard_scores?.points || 0) - (a.leaderboard_scores?.points || 0))
                      .slice(0, 5)
                      .map((userData, index) => (
                      <div key={userData.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-s3m-red font-bold">#{index + 1}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-s3m-red text-white text-xs">
                              {(userData.profiles?.username || 'U').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white">
                            {userData.profiles?.username || 'مجهول'}
                          </span>
                        </div>
                        <span className="text-s3m-red font-bold">
                          {userData.leaderboard_scores?.points?.toLocaleString() || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
