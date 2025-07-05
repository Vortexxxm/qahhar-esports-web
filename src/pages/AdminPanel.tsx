import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AILeaderboardManager from "@/components/admin/AILeaderboardManager";
import PushNotificationSender from "@/components/admin/PushNotificationSender";

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      setLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          toast({
            title: "Error",
            description: "Failed to fetch user role.",
            variant: "destructive",
          });
        } else {
          setRole(data?.role || null);
        }
      }
      setLoading(false);
    };

    getRole();
  }, [user, toast]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  if (role !== 'admin') {
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
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div>إحصائيات الموقع</div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>إدارة المستخدمين</div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <AILeaderboardManager />
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
