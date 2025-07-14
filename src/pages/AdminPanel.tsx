
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AILeaderboardManager from "@/components/admin/AILeaderboardManager";
import PushNotificationSender from "@/components/admin/PushNotificationSender";

const AdminPanel = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [roleLoading, setRoleLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

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
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-s3m-red data-[state=active]:text-white">
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">إحصائيات الموقع</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium">المستخدمين النشطين</h4>
                  <p className="text-2xl font-bold text-s3m-red mt-2">0</p>
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">إدارة المستخدمين</h3>
              <p className="text-gray-400">سيتم إضافة إدارة المستخدمين قريباً</p>
            </div>
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
