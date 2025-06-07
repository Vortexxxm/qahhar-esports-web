
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Trophy, Target, Gamepad2, Star, Flame, Crown, Zap } from 'lucide-react';
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
  } | null;
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          rank_title,
          total_likes,
          bio
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_scores')
        .select(`
          points,
          wins,
          kills,
          deaths
        `)
        .eq('user_id', userId)
        .single();

      const userData: UserProfileData = {
        ...profileData,
        leaderboard_scores: leaderboardError ? null : leaderboardData
      };
      
      setProfileData(userData);
      setLikesCount(userData.total_likes || 0);
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
        return "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 animate-pulse";
      case 'Legend':
        return "bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/50";
      case 'Pro':
        return "bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/50";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 h-80 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-gray-500">الملف الشخصي غير موجود</div>;
  }

  const { leaderboard_scores } = profileData;

  return (
    <div className="relative group">
      {/* Animated Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border-0 shadow-2xl transform hover:scale-105 transition-all duration-500">
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce delay-500"></div>
        </div>

        {/* Header with special rank glow */}
        <div className="relative p-6 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
          {profileData.rank_title === 'Heroic' && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 animate-pulse"></div>
          )}
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Enhanced Avatar with rank-based glow */}
              <div className="relative">
                <div className={`absolute -inset-2 rounded-full blur-sm ${
                  profileData.rank_title === 'Heroic' ? 'bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse' :
                  profileData.rank_title === 'Legend' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                  profileData.rank_title === 'Pro' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                  'bg-gradient-to-r from-s3m-red to-red-600'
                }`}></div>
                <Avatar className={`relative ${compact ? 'w-16 h-16' : 'w-20 h-20'} border-4 border-white/20 shadow-2xl`}>
                  <AvatarImage src={profileData.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-s3m-red to-red-700 text-white text-xl font-bold">
                    {(profileData.username || profileData.full_name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Rank icon overlay */}
                {profileData.rank_title === 'Heroic' && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                    <Crown className="h-4 w-4 text-yellow-900" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
                  {profileData.username || profileData.full_name}
                </h3>
                <Badge className={`${getRankBadgeStyle(profileData.rank_title)} px-3 py-1 text-sm font-bold`}>
                  {profileData.rank_title === 'Heroic' && <Star className="w-4 h-4 mr-1" />}
                  {profileData.rank_title}
                </Badge>
              </div>
            </div>

            {/* Enhanced Like Button */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                onClick={toggleLike}
                variant="ghost"
                size="lg"
                className={`relative overflow-hidden group/btn transition-all duration-300 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                } rounded-xl p-3`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-2 rtl:space-x-reverse">
                  <Heart className={`h-6 w-6 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover/btn:scale-110'}`} />
                  <span className="font-bold text-lg">{likesCount}</span>
                </div>
              </Button>
              <span className="text-xs text-gray-400 font-medium">إعجاب</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Enhanced Stats Grid */}
          {!compact && leaderboard_scores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group/stat bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300">
                <div className="flex flex-col items-center space-y-2">
                  <Trophy className="h-6 w-6 text-yellow-500 group-hover/stat:scale-110 transition-transform duration-300" />
                  <div className="text-xl font-bold text-white">{leaderboard_scores.wins}</div>
                  <div className="text-xs text-gray-400 font-medium">انتصارات</div>
                </div>
              </div>
              
              <div className="group/stat bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                <div className="flex flex-col items-center space-y-2">
                  <Target className="h-6 w-6 text-red-500 group-hover/stat:scale-110 transition-transform duration-300" />
                  <div className="text-xl font-bold text-white">
                    {leaderboard_scores.deaths > 0 ? 
                      (leaderboard_scores.kills / leaderboard_scores.deaths).toFixed(1) : 
                      leaderboard_scores.kills.toFixed(1)
                    }
                  </div>
                  <div className="text-xs text-gray-400 font-medium">K/D</div>
                </div>
              </div>
              
              <div className="group/stat bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <div className="flex flex-col items-center space-y-2">
                  <Gamepad2 className="h-6 w-6 text-blue-500 group-hover/stat:scale-110 transition-transform duration-300" />
                  <div className="text-xl font-bold text-white">{leaderboard_scores.points}</div>
                  <div className="text-xs text-gray-400 font-medium">نقاط</div>
                </div>
              </div>
              
              <div className="group/stat bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                <div className="flex flex-col items-center space-y-2">
                  <Heart className="h-6 w-6 text-pink-500 group-hover/stat:scale-110 transition-transform duration-300" />
                  <div className="text-xl font-bold text-white">{likesCount}</div>
                  <div className="text-xs text-gray-400 font-medium">إعجاب</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Bio Section */}
          {!compact && profileData.bio && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/5 via-transparent to-s3m-red/5 rounded-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <p className="text-gray-300 text-sm leading-relaxed">{profileData.bio}</p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-s3m-red to-transparent opacity-50"></div>
      </Card>
    </div>
  );
};

export default UserProfile;
