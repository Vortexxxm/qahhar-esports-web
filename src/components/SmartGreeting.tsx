import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Star, Trophy, Crown, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserStatus = async () => {
      try {
        const { data: activity } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_first_visit, rank_title, activity_score, total_likes')
          .eq('id', user.id)
          .single();

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

    if (profile?.is_first_visit) {
      return {
        message: "مرحباً بك في موقعنا! إليك نظرة سريعة لمساعدتك على الاستفادة القصوى من الموقع.",
        icon: <Star className="h-6 w-6 text-yellow-500" />,
        badge: "عضو جديد",
        bgGradient: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
        textColor: "text-purple-300"
      };
    }

    if (daysSinceLastLogin >= 5) {
      return {
        message: "اشتقنا لأسلوبك يا بطل، ماذا لديك من جديد؟",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        badge: "مرحباً بعودتك",
        bgGradient: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
        textColor: "text-yellow-300"
      };
    }

    if (currentHour >= 23 || currentHour <= 5) {
      return {
        message: "مساء الخير، هل أنت مستعد لإكمال أسطورتك الليلة؟ 🌙",
        icon: <Moon className="h-6 w-6 text-blue-400" />,
        bgGradient: "bg-gradient-to-r from-blue-600/20 to-indigo-600/20",
        textColor: "text-blue-300"
      };
    }

    if (profile?.rank_title === 'Heroic') {
      return {
        message: "أهلاً بالبطل! إنجازاتك تتحدث عن نفسها",
        icon: <Crown className="h-6 w-6 text-yellow-500" />,
        badge: "🔥 بطل مميز",
        bgGradient: "bg-gradient-to-r from-yellow-500/20 to-red-500/20",
        textColor: "text-yellow-300"
      };
    }

    if ((profile?.activity_score || 0) > 100) {
      return {
        message: "أداؤك رائع هذا الأسبوع! استمر في التقدم",
        icon: <Zap className="h-6 w-6 text-green-500" />,
        badge: "🔥 الأكثر تفاعلاً",
        bgGradient: "bg-gradient-to-r from-green-500/20 to-teal-500/20",
        textColor: "text-green-300"
      };
    }

    const timeGreeting = currentHour < 12 ? "صباح الخير" : 
                        currentHour < 18 ? "مرحباً" : "مساء الخير";
    
    return {
      message: `${timeGreeting}! نتمنى لك يوماً مليئاً بالانتصارات`,
      icon: <Star className="h-6 w-6 text-s3m-red" />,
      bgGradient: "bg-gradient-to-r from-s3m-red/10 to-red-600/10",
      textColor: "text-s3m-red"
    };
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!greetingData || !user || !isVisible) return null;

  return (
    <div>
      <Card className={`mb-6 border-none ${greetingData.bgGradient} backdrop-blur-sm relative overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
              <div className="p-3 rounded-full bg-black/20">
                {greetingData.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-semibold ${greetingData.textColor} mb-1 leading-tight`}>
                  {greetingData.message}
                </p>
                {greetingData.badge && (
                  <Badge className="bg-gradient-to-r from-s3m-red to-red-600 text-white text-xs">
                    {greetingData.badge}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartGreeting;