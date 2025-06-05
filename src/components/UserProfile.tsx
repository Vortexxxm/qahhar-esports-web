
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Trophy, Target, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  rank_title: string;
  total_likes: number;
  bio: string;
  leaderboard_scores?: {
    points: number;
    wins: number;
    kills: number;
    deaths: number;
  };
}

interface UserProfileProps {
  userId: string;
  compact?: boolean;
}

const UserProfile = ({ userId, compact = false }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    if (user) {
      checkIfLiked();
    }
  }, [userId, user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          rank_title,
          total_likes,
          bio,
          leaderboard_scores (
            points,
            wins,
            kills,
            deaths
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfileData(data);
      setLikesCount(data.total_likes || 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('liked_user_id', userId)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      // لا يوجد إعجاب
      setIsLiked(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتفاعل مع الملفات الشخصية",
        variant: "destructive",
      });
      return;
    }

    if (user.id === userId) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك الإعجاب بملفك الشخصي",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // إلغاء الإعجاب
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('liked_user_id', userId);

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        
        toast({
          title: "تم إلغاء الإعجاب",
          description: "تم إلغاء إعجابك بهذا الملف الشخصي",
        });
      } else {
        // إضافة إعجاب
        await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            liked_user_id: userId
          });

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        toast({
          title: "تم الإعجاب!",
          description: "شكراً لك على تقييم هذا الملف الشخصي",
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التفاعل مع الملف الشخصي",
        variant: "destructive",
      });
    }
  };

  const getRankBadgeStyle = (rank: string) => {
    switch (rank) {
      case 'Heroic':
        return "bg-gradient-to-r from-yellow-500 to-red-500 text-white";
      case 'Legend':
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case 'Pro':
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  if (!profileData) {
    return <div className="text-center text-gray-500">الملف الشخصي غير موجود</div>;
  }

  const { leaderboard_scores } = profileData;

  return (
    <Card className={`gaming-card hover:scale-105 transition-all duration-300 ${
      profileData.rank_title === 'Heroic' ? 
      'bg-gradient-to-br from-yellow-500/10 to-red-500/10 border-yellow-500/30' : 
      'bg-gradient-to-br from-s3m-red/10 to-red-600/10'
    }`}>
      {profileData.rank_title === 'Heroic' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-pulse rounded-lg"></div>
      )}
      
      <CardContent className={`p-${compact ? '4' : '6'} relative z-10`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} border-2 border-s3m-red/50`}>
              <AvatarImage src={profileData.avatar_url || ""} />
              <AvatarFallback className="bg-s3m-red text-white">
                {(profileData.username || profileData.full_name || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-white`}>
                {profileData.username || profileData.full_name}
              </h3>
              <Badge className={getRankBadgeStyle(profileData.rank_title)}>
                {profileData.rank_title}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={toggleLike}
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-2 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likesCount}</span>
            </Button>
            <span className="text-xs text-gray-500">إعجاب</span>
          </div>
        </div>

        {!compact && leaderboard_scores && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2 bg-black/20 rounded-lg">
              <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{leaderboard_scores.wins}</div>
              <div className="text-xs text-gray-400">انتصارات</div>
            </div>
            
            <div className="text-center p-2 bg-black/20 rounded-lg">
              <Target className="h-4 w-4 text-red-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">
                {leaderboard_scores.deaths > 0 ? 
                  (leaderboard_scores.kills / leaderboard_scores.deaths).toFixed(1) : 
                  leaderboard_scores.kills.toFixed(1)
                }
              </div>
              <div className="text-xs text-gray-400">K/D</div>
            </div>
            
            <div className="text-center p-2 bg-black/20 rounded-lg">
              <Gamepad2 className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{leaderboard_scores.points}</div>
              <div className="text-xs text-gray-400">نقاط</div>
            </div>
            
            <div className="text-center p-2 bg-black/20 rounded-lg">
              <Heart className="h-4 w-4 text-pink-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{likesCount}</div>
              <div className="text-xs text-gray-400">إعجاب</div>
            </div>
          </div>
        )}

        {!compact && profileData.bio && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <p className="text-gray-300 text-sm">{profileData.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
