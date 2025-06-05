
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Star, Trophy, Crown, Zap } from 'lucide-react';

interface UserActivity {
  last_login: string;
  login_count: number;
  created_at: string;
}

interface Profile {
  is_first_visit: boolean;
  rank_title: string;
  activity_score: number;
  total_likes: number;
}

const SmartGreeting = () => {
  const { user } = useAuth();
  const [greetingData, setGreetingData] = useState<{
    message: string;
    icon: React.ReactNode;
    badge?: string;
    bgGradient: string;
    textColor: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserStatus = async () => {
      try {
        // جلب بيانات النشاط
        const { data: activity } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // جلب بيانات البروفايل
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_first_visit, rank_title, activity_score, total_likes')
          .eq('id', user.id)
          .single();

        // تحديث نشاط المستخدم
        await supabase.rpc('update_user_activity', { user_uuid: user.id });

        const greeting = generateGreeting(activity, profile);
        setGreetingData(greeting);
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [user]);

  const generateGreeting = (activity: UserActivity | null, profile: Profile | null) => {
    const currentHour = new Date().getHours();
    const now = new Date();
    const lastLogin = activity?.last_login ? new Date(activity.last_login) : null;
    const daysSinceLastLogin = lastLogin ? 
      Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // الزيارة الأولى
    if (profile?.is_first_visit) {
      return {
        message: "مرحباً بك في موقعنا! إليك نظرة سريعة لمساعدتك على الاستفادة القصوى من الموقع.",
        icon: <Star className="h-6 w-6 text-yellow-500" />,
        badge: "عضو جديد",
        bgGradient: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
        textColor: "text-purple-300"
      };
    }

    // عودة بعد غياب طويل
    if (daysSinceLastLogin >= 5) {
      return {
        message: "اشتقنا لأسلوبك يا بطل، ماذا لديك من جديد؟",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        badge: "مرحباً بعودتك",
        bgGradient: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
        textColor: "text-yellow-300"
      };
    }

    // دخول متأخر بالليل
    if (currentHour >= 23 || currentHour <= 5) {
      return {
        message: "مساء الخير، هل أنت مستعد لإكمال أسطورتك الليلة؟ 🌙",
        icon: <Moon className="h-6 w-6 text-blue-400" />,
        bgGradient: "bg-gradient-to-r from-blue-600/20 to-indigo-600/20",
        textColor: "text-blue-300"
      };
    }

    // رتبة مميزة
    if (profile?.rank_title === 'Heroic') {
      return {
        message: "أهلاً بالبطل! إنجازاتك تتحدث عن نفسها",
        icon: <Crown className="h-6 w-6 text-yellow-500" />,
        badge: "🔥 بطل مميز",
        bgGradient: "bg-gradient-to-r from-yellow-500/20 to-red-500/20",
        textColor: "text-yellow-300"
      };
    }

    // نشاط مرتفع
    if ((profile?.activity_score || 0) > 100) {
      return {
        message: "أداؤك رائع هذا الأسبوع! استمر في التقدم",
        icon: <Zap className="h-6 w-6 text-green-500" />,
        badge: "🔥 الأكثر تفاعلاً",
        bgGradient: "bg-gradient-to-r from-green-500/20 to-teal-500/20",
        textColor: "text-green-300"
      };
    }

    // رسالة افتراضية حسب الوقت
    const timeGreeting = currentHour < 12 ? "صباح الخير" : 
                        currentHour < 18 ? "مرحباً" : "مساء الخير";
    
    return {
      message: `${timeGreeting}! نتمنى لك يوماً مليئاً بالانتصارات`,
      icon: <Star className="h-6 w-6 text-s3m-red" />,
      bgGradient: "bg-gradient-to-r from-s3m-red/10 to-red-600/10",
      textColor: "text-s3m-red"
    };
  };

  if (!greetingData || !user) return null;

  return (
    <Card className={`mb-6 border-none ${greetingData.bgGradient} backdrop-blur-sm relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-black/20">
              {greetingData.icon}
            </div>
            <div>
              <p className={`text-lg font-semibold ${greetingData.textColor} mb-1`}>
                {greetingData.message}
              </p>
              {greetingData.badge && (
                <Badge className="bg-gradient-to-r from-s3m-red to-red-600 text-white">
                  {greetingData.badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartGreeting;
